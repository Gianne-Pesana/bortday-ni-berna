import fs from "node:fs";
import path from "node:path";
import exifr from "exifr";
import heicConvert from "heic-convert";

export interface PhotoManifestItem {
  filename: string;
  src: string;
  dateTaken: string | null;
  isDated: boolean;
}

const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

const PHOTOS_DIR = path.resolve(process.cwd(), "public/photos");
const CONVERTED_DIR = path.resolve(PHOTOS_DIR, ".converted");
const OUTPUT_FILE = path.resolve(process.cwd(), "src/lib/photo-manifest.json");

async function extractCaptureDate(filePath: string): Promise<Date | null> {
  try {
    // Query capture-related tags: DateTimeOriginal prioritized, then CreateDate
    const exifData = await exifr.parse(filePath, ["DateTimeOriginal", "CreateDate"]);
    if (!exifData) return null;

    const rawDate = exifData.DateTimeOriginal || exifData.CreateDate;
    if (!rawDate) return null;

    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  } catch {
    // Treat as undated if EXIF cannot be parsed
  }
  return null;
}

/**
 * Converts HEIC/HEIF images into browser-compatible JPEGs with caching.
 */
async function processHeicImage(filename: string): Promise<string> {
  if (!fs.existsSync(CONVERTED_DIR)) {
    fs.mkdirSync(CONVERTED_DIR, { recursive: true });
  }

  const baseName = path.parse(filename).name;
  const convertedFilename = `${baseName}.jpg`;
  const inputPath = path.join(PHOTOS_DIR, filename);
  const outputPath = path.join(CONVERTED_DIR, convertedFilename);

  const inputStat = fs.statSync(inputPath);
  const needsConversion =
    !fs.existsSync(outputPath) || fs.statSync(outputPath).mtimeMs < inputStat.mtimeMs;

  if (needsConversion) {
    console.log(`[Photo Manifest] 🔄 Converting HEIC: ${filename} -> .converted/${convertedFilename}...`);
    const inputBuffer = fs.readFileSync(inputPath);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 0.92,
    });
    fs.writeFileSync(outputPath, Buffer.from(outputBuffer));
    console.log(`[Photo Manifest] ✓ Converted ${filename}`);
  } else {
    console.log(`[Photo Manifest] ⚡ Using cached conversion for ${filename}`);
  }

  return `/photos/.converted/${convertedFilename}`;
}

export async function generatePhotoManifest(): Promise<PhotoManifestItem[]> {
  console.log(`[Photo Manifest] Scanning directory: ${PHOTOS_DIR}`);

  if (!fs.existsSync(PHOTOS_DIR)) {
    console.log(`[Photo Manifest] Creating empty directory: ${PHOTOS_DIR}`);
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  const entries = fs.readdirSync(PHOTOS_DIR);
  const imageFiles = entries.filter((file) => {
    // Ignore hidden directories like .converted
    if (file.startsWith(".")) return false;
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_EXTENSIONS.has(ext);
  });

  if (imageFiles.length === 0) {
    console.warn("[Photo Manifest] ⚠️ No supported photos found in public/photos/. Manifest will be empty.");
    ensureOutputDir();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2), "utf-8");
    return [];
  }

  console.log(`[Photo Manifest] Found ${imageFiles.length} image files. Reading EXIF metadata...`);

  const datedPhotos: Array<{ filename: string; src: string; date: Date }> = [];
  const undatedPhotos: Array<{ filename: string; src: string }> = [];

  for (const filename of imageFiles) {
    const filePath = path.join(PHOTOS_DIR, filename);
    const ext = path.extname(filename).toLowerCase();
    const isHeic = ext === ".heic" || ext === ".heif";

    // 1. Resolve web-accessible src (converting HEIC if needed)
    let webSrc = `/photos/${filename}`;
    if (isHeic) {
      try {
        webSrc = await processHeicImage(filename);
      } catch (convErr) {
        console.error(`[Photo Manifest] ❌ Error converting HEIC file ${filename}:`, convErr);
        continue;
      }
    }

    // 2. Extract capture date from the original image file
    const captureDate = await extractCaptureDate(filePath);

    if (captureDate) {
      datedPhotos.push({
        filename,
        src: webSrc,
        date: captureDate,
      });
    } else {
      undatedPhotos.push({
        filename,
        src: webSrc,
      });
    }
  }

  // 1. Sort dated photos from oldest to newest. Tie-breaker: filename
  datedPhotos.sort((a, b) => {
    const timeDiff = a.date.getTime() - b.date.getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.filename.localeCompare(b.filename);
  });

  // 2. Sort undated photos deterministically (alphabetically)
  undatedPhotos.sort((a, b) => a.filename.localeCompare(b.filename));

  // 3. Print useful build-time warning listing undated files
  if (undatedPhotos.length > 0) {
    console.warn(
      `[Photo Manifest] ⚠️ Warning: Found ${undatedPhotos.length} undated photo(s) without valid EXIF capture date:`
    );
    for (const p of undatedPhotos) {
      console.warn(`    - ${p.filename} (placed at end of chronological sequence)`);
    }
  }

  // 4. Combine: dated photos first, then undated photos
  const manifest: PhotoManifestItem[] = [
    ...datedPhotos.map((p) => ({
      filename: p.filename,
      src: p.src,
      dateTaken: p.date.toISOString(),
      isDated: true,
    })),
    ...undatedPhotos.map((p) => ({
      filename: p.filename,
      src: p.src,
      dateTaken: null,
      isDated: false,
    })),
  ];

  ensureOutputDir();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(
    `[Photo Manifest] ✓ Successfully generated manifest with ${manifest.length} photo(s) at ${OUTPUT_FILE}`
  );

  return manifest;
}

function ensureOutputDir() {
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Execute if run directly
if (
  import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` ||
  process.argv[1]?.endsWith("generate-photo-manifest.ts")
) {
  generatePhotoManifest().catch((err) => {
    console.error("[Photo Manifest] ❌ Error generating manifest:", err);
    process.exit(1);
  });
}
