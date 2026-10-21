export interface RoastThreshold {
  maxTaps: number;
  text: string;
}

export const BIRTHDAY_CONFIG = {
  // Operational timings
  gameDurationMs: 20000,
  countdownSeconds: 3,
  gameToResultDelayMs: 1000, // Configurable delay (in ms) before transitioning to results screen
  resultDurationMs: 1500,
  resultButtonLockoutMs: 2000, // Lock results button for 2s to prevent accidental clicks after mashing

  // Mathematical target
  targetAge: 20,

  // Initial roast thresholds:
  // 0–15 taps: "Did you even try?"
  // 16–35 taps: "A respectable amount of desperation."
  // 36–60 taps: "Bro was fighting for her life."
  // 61 or more taps: "Professional button masher."
  roastThresholds: [
    { maxTaps: 15, text: "Did you even try?" },
    { maxTaps: 35, text: "A respectable amount of desperation." },
    { maxTaps: 60, text: "Bro was fighting for her life." },
    { maxTaps: Infinity, text: "Professional button masher." },
  ] as RoastThreshold[],
} as const;

export function getRoastMessage(taps: number): string {
  for (const threshold of BIRTHDAY_CONFIG.roastThresholds) {
    if (taps <= threshold.maxTaps) {
      return threshold.text;
    }
  }
  return "Professional button masher.";
}
