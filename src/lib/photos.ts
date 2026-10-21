import manifestData from "./photo-manifest.json";

export interface PhotoManifestItem {
  filename: string;
  src: string;
  dateTaken: string | null;
  isDated: boolean;
}

// Fallback placeholder cards if no photos have been dropped into public/photos yet
export const DEFAULT_FALLBACK_PHOTOS: PhotoManifestItem[] = [
  {
    filename: "berna-baby.svg",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><rect width='600' height='600' fill='%23E9D8FD'/><circle cx='300' cy='250' r='100' fill='%23D6BCFA'/><text x='300' y='260' font-size='60' text-anchor='middle'>👶</text><text x='300' y='420' font-family='sans-serif' font-weight='bold' font-size='24' fill='%23553C9A' text-anchor='middle'>Baby Berna Era</text><text x='300' y='460' font-family='sans-serif' font-size='16' fill='%23805AD5' text-anchor='middle'>(Add photos to public/photos/)</text></svg>",
    dateTaken: "2006-10-22T08:00:00.000Z",
    isDated: true,
  },
  {
    filename: "berna-kid.svg",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><rect width='600' height='600' fill='%23FED7E2'/><circle cx='300' cy='250' r='100' fill='%23FBB6CE'/><text x='300' y='260' font-size='60' text-anchor='middle'>👧</text><text x='300' y='420' font-family='sans-serif' font-weight='bold' font-size='24' fill='%2397266D' text-anchor='middle'>School Days Berna</text><text x='300' y='460' font-family='sans-serif' font-size='16' fill='%23B83280' text-anchor='middle'>Chaos Level: 100%</text></svg>",
    dateTaken: "2014-06-15T12:00:00.000Z",
    isDated: true,
  },
  {
    filename: "berna-teen.svg",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><rect width='600' height='600' fill='%23EBF4FF'/><circle cx='300' cy='250' r='100' fill='%23C3DAFE'/><text x='300' y='260' font-size='60' text-anchor='middle'>🌸</text><text x='300' y='420' font-family='sans-serif' font-weight='bold' font-size='24' fill='%232B6CB0' text-anchor='middle'>Peak Teenage Chaos</text><text x='300' y='460' font-family='sans-serif' font-size='16' fill='%233182CE' text-anchor='middle'>Saving youth in progress...</text></svg>",
    dateTaken: "2020-10-22T14:30:00.000Z",
    isDated: true,
  },
  {
    filename: "berna-kuromi.svg",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><rect width='600' height='600' fill='%232D124D'/><circle cx='300' cy='250' r='100' fill='%23551E8B'/><text x='300' y='260' font-size='60' text-anchor='middle'>💀🎀</text><text x='300' y='420' font-family='sans-serif' font-weight='bold' font-size='24' fill='%23FF80BF' text-anchor='middle'>Turning 20 Soon!</text><text x='300' y='460' font-family='sans-serif' font-size='16' fill='%23D6BCFA' text-anchor='middle'>Last Day of Teenage Era</text></svg>",
    dateTaken: "2026-10-21T23:59:00.000Z",
    isDated: true,
  },
];

export function getPhotos(): PhotoManifestItem[] {
  const manifest = manifestData as PhotoManifestItem[];
  if (Array.isArray(manifest) && manifest.length > 0) {
    return manifest;
  }
  return DEFAULT_FALLBACK_PHOTOS;
}

// Global in-memory cache to retain decoded image objects
const memoryImageCache = new Set<HTMLImageElement>();
let activePreloadPromise: Promise<void> | null = null;
let loadedCount = 0;
let isPreloadComplete = false;
const progressListeners = new Set<(loaded: number, total: number) => void>();

export function arePhotosPreloaded(): boolean {
  return isPreloadComplete;
}

export function getPreloadCount(): { loaded: number; total: number; isReady: boolean } {
  const total = (manifestData as PhotoManifestItem[]).length || DEFAULT_FALLBACK_PHOTOS.length;
  return {
    loaded: loadedCount,
    total,
    isReady: isPreloadComplete || loadedCount >= total,
  };
}

export function subscribePreloadProgress(
  listener: (loaded: number, total: number) => void
): () => void {
  progressListeners.add(listener);
  return () => progressListeners.delete(listener);
}

/**
 * Preloads and pre-decodes all photos off the main thread.
 * Starts downloading immediately on site open and caches in memory for 0ms lag during tapping.
 */
export function preloadPhotos(
  photos: PhotoManifestItem[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  if (onProgress) {
    progressListeners.add(onProgress);
  }

  if (typeof window === "undefined" || photos.length === 0) {
    isPreloadComplete = true;
    return Promise.resolve();
  }

  if (activePreloadPromise) {
    return activePreloadPromise;
  }

  const total = photos.length;
  loadedCount = 0;

  const loadPromises = photos.map((item) => {
    return new Promise<void>((resolve) => {
      // Data URLs do not require network prefetching
      if (item.src.startsWith("data:")) {
        loadedCount++;
        progressListeners.forEach((fn) => fn(loadedCount, total));
        resolve();
        return;
      }

      const img = new Image();
      img.onload = async () => {
        try {
          // Decode image off the main thread so render has zero latency
          if ("decode" in img) {
            await img.decode();
          }
          memoryImageCache.add(img);
        } catch {
          // Ignore decode error, proceed anyway
        }
        loadedCount++;
        progressListeners.forEach((fn) => fn(loadedCount, total));
        resolve();
      };

      img.onerror = () => {
        console.warn(`[Photos] Failed to preload image: ${item.src}`);
        loadedCount++;
        progressListeners.forEach((fn) => fn(loadedCount, total));
        resolve();
      };

      img.src = item.src;
    });
  });

  // Safety maximum timeout of 20 seconds for slow 3G networks, but resolves as soon as images finish
  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(resolve, 20000);
  });

  activePreloadPromise = Promise.race([Promise.all(loadPromises), timeoutPromise]).then(() => {
    isPreloadComplete = true;
    progressListeners.forEach((fn) => fn(total, total));
  });

  return activePreloadPromise;
}
