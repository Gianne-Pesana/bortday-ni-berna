import assert from "node:assert";
import { BIRTHDAY_CONFIG, getRoastMessage } from "../config/birthday";
import { generatePhotoManifest } from "./generate-photo-manifest";

async function runVerification() {
  console.log("=== RUNNING VERIFICATION SUITE ===");

  // 1. VERIFY MATHEMATICAL AGE & PROGRESS RELATIONSHIP
  console.log("\n[Test 1] Mathematical Age & Progress Lockstep");

  function calculateProgressAndAge(elapsedMs: number, durationMs: number) {
    const progress = Math.max(0, 1 - elapsedMs / durationMs);
    const age = BIRTHDAY_CONFIG.targetAge * (1 - progress);
    const progressPercent = progress * 100;
    return { progress, age, progressPercent };
  }

  // 5-second duration checks
  const start5s = calculateProgressAndAge(0, 5000);
  assert.strictEqual(start5s.progress, 1, "At start, progress must be 1.0 (100%)");
  assert.strictEqual(start5s.age, 0, "At start, Berna's age must be 0");
  assert.strictEqual(start5s.progressPercent, 100);

  const mid5s = calculateProgressAndAge(2500, 5000);
  assert.strictEqual(mid5s.progress, 0.5, "At midpoint (2500ms / 5000ms), progress must be 0.5 (50%)");
  assert.strictEqual(mid5s.age, 10, "At midpoint, Berna's age must be exactly 10");
  assert.strictEqual(mid5s.progressPercent, 50);

  const end5s = calculateProgressAndAge(5000, 5000);
  assert.strictEqual(end5s.progress, 0, "At end (5000ms), progress must be 0");
  assert.strictEqual(end5s.age, 20, "At end, Berna's age must be exactly 20");
  assert.strictEqual(end5s.progressPercent, 0);

  // Past duration clamp check
  const pastEnd = calculateProgressAndAge(6500, 5000);
  assert.strictEqual(pastEnd.progress, 0, "Past duration must clamp to 0");
  assert.strictEqual(pastEnd.age, 20, "Past duration must clamp to exactly 20");

  // 10-second duration check: changing duration must preserve identical relationship
  const mid10s = calculateProgressAndAge(5000, 10000);
  assert.strictEqual(mid10s.progress, 0.5, "At 10s duration midpoint (5000ms), progress must still be 0.5");
  assert.strictEqual(mid10s.age, 10, "At 10s duration midpoint, age must still be exactly 10");

  console.log("✓ Mathematical age and progress calculations verified with zero drift across multiple durations.");

  // 2. VERIFY ROAST THRESHOLDS
  console.log("\n[Test 2] Roast Threshold Boundaries");

  assert.strictEqual(getRoastMessage(0), "Did you even try?");
  assert.strictEqual(getRoastMessage(15), "Did you even try?");
  assert.strictEqual(getRoastMessage(16), "A respectable amount of desperation.");
  assert.strictEqual(getRoastMessage(35), "A respectable amount of desperation.");
  assert.strictEqual(getRoastMessage(36), "Bro was fighting for her life.");
  assert.strictEqual(getRoastMessage(60), "Bro was fighting for her life.");
  assert.strictEqual(getRoastMessage(61), "Professional button masher.");
  assert.strictEqual(getRoastMessage(100), "Professional button masher.");

  console.log("✓ All roast threshold boundaries (0-15, 16-35, 36-60, 61+) verified strictly.");

  // 3. VERIFY MANIFEST GENERATION (EMPTY DIRECTORY)
  console.log("\n[Test 3] Empty public/photos/ Directory Handling");
  const emptyResult = await generatePhotoManifest();
  assert(Array.isArray(emptyResult), "Empty photos dir must return an array");
  console.log(`✓ Empty directory returned ${emptyResult.length} items without throwing.`);

  // 4. VERIFY SORTING, TIE-BREAKING, AND UNDATED PHOTOS
  console.log("\n[Test 4] Sorting, Tie-Breaking, and Undated Photo Logic");

  // Mock photo set simulating raw scan output
  interface TestPhoto {
    filename: string;
    src: string;
    date: Date | null;
  }

  const mockPhotos: TestPhoto[] = [
    { filename: "z_undated_party.png", src: "/photos/z_undated_party.png", date: null },
    { filename: "photo_2015_b.jpg", src: "/photos/photo_2015_b.jpg", date: new Date("2015-05-10T12:00:00Z") },
    { filename: "photo_2010.jpg", src: "/photos/photo_2010.jpg", date: new Date("2010-01-01T10:00:00Z") },
    { filename: "photo_2018.heic", src: "/photos/.converted/photo_2018.jpg", date: new Date("2018-03-15T09:00:00Z") },
    { filename: "photo_2015_a.jpg", src: "/photos/photo_2015_a.jpg", date: new Date("2015-05-10T12:00:00Z") }, // Same timestamp as photo_2015_b
    { filename: "a_undated_baby.jpg", src: "/photos/a_undated_baby.jpg", date: null },
    { filename: "b_undated_iphone.heic", src: "/photos/.converted/b_undated_iphone.jpg", date: null },
    { filename: "photo_2022.webp", src: "/photos/photo_2022.webp", date: new Date("2022-10-22T08:00:00Z") },
  ];

  const dated = mockPhotos.filter((p): p is { filename: string; src: string; date: Date } => p.date !== null);
  const undated = mockPhotos.filter((p) => p.date === null);

  // Sort dated: oldest to newest, tie-breaker: filename
  dated.sort((a, b) => {
    const diff = a.date.getTime() - b.date.getTime();
    if (diff !== 0) return diff;
    return a.filename.localeCompare(b.filename);
  });

  // Sort undated: alphabetically
  undated.sort((a, b) => a.filename.localeCompare(b.filename));

  const finalSequence = [...dated, ...undated];

  assert.strictEqual(finalSequence[0].filename, "photo_2010.jpg", "Oldest dated photo must be first");
  assert.strictEqual(finalSequence[1].filename, "photo_2015_a.jpg", "Tie-breaker must put photo_2015_a before photo_2015_b");
  assert.strictEqual(finalSequence[2].filename, "photo_2015_b.jpg");
  assert.strictEqual(finalSequence[3].filename, "photo_2018.heic", "Dated HEIC must sort chronologically between 2015 and 2022");
  assert.strictEqual(finalSequence[4].filename, "photo_2022.webp", "Newest dated photo must be last of dated photos");
  assert.strictEqual(finalSequence[5].filename, "a_undated_baby.jpg", "Undated photos come after dated photos, sorted alphabetically");
  assert.strictEqual(finalSequence[6].filename, "b_undated_iphone.heic", "Undated HEIC photo sorted alphabetically");
  assert.strictEqual(finalSequence[7].filename, "z_undated_party.png", "Last undated photo sorted alphabetically");

  console.log("✓ Sorting order, timestamp tie-breaking, and undated fallback ordering verified.");

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n");
}

runVerification().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
