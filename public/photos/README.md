# Berna's Birthday Photos Directory

Drop photos of Berna here in any of these supported formats:
- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.heic` / `.heif` (iPhone photos are automatically converted to optimized JPEGs at build time!)

### How It Works:
1. When you run `npm run dev` or `npm run build`, the build-time script automatically scans this folder.
2. It parses the true EXIF capture date (`DateTimeOriginal` / `CreateDate`).
3. For `.heic` / `.heif` files, it converts them into web-friendly `.jpg` files inside `.converted/` so Android, iOS, and PC browsers can display them seamlessly.
4. Photos are sorted from oldest to newest so they play in chronological order as the player rapidly mashes the button.
5. Any photos without EXIF capture data are classified as undated, placed after dated photos, and sorted alphabetically.
6. If this folder is empty, the game automatically uses built-in themed placeholder memories so the site is never broken.

### Quick Command to Refresh Manifest:
```bash
npm run generate-manifest
```
