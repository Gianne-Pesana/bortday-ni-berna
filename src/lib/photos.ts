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

/**
 * Preload all photos before starting the game countdown.
 * Resolves when all images have loaded (or errored), with a safety timeout so gameplay is never blocked.
 */
export async function preloadPhotos(photos: PhotoManifestItem[], timeoutMs = 4000): Promise<void> {
  if (typeof window === "undefined" || photos.length === 0) {
    return;
  }

  const loadPromises = photos.map((item) => {
    return new Promise<void>((resolve) => {
      // Data URLs don't need network preloading
      if (item.src.startsWith("data:")) {
        resolve();
        return;
      }
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`[Photos] Failed to preload image: ${item.src}`);
        resolve(); // resolve anyway so we don't block
      };
      img.src = item.src;
    });
  });

  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutMs);
  });

  await Promise.race([Promise.all(loadPromises), timeoutPromise]);
}
