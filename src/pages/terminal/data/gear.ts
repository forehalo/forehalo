/**
 * The site owner's real machine (terminal.md §data), printed neofetch-style
 * in the welcome screen. Never include serial numbers or UUIDs.
 */

export interface GearEntry {
  key: string;
  value: string;
}

/** neofetch header above the rule line */
export const GEAR_HEADER = "yii@thatyii";

export const GEAR: GearEntry[] = [
  { key: "Host", value: "MacBook Pro (Mac17,7)" },
  { key: "Chip", value: "Apple M5 Max — 18 cores (6 super + 12 performance)" },
  { key: "Memory", value: "128 GB unified" },
  { key: "Display", value: "LG TV SSCR2 — 6016×3384 @ 120Hz" },
  { key: "OS", value: "macOS 26.5.2" },
];
