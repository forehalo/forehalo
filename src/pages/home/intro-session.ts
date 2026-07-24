/**
 * Home intro plays once per browser until localStorage is cleared.
 * Navigating away and back (or a full reload) skips the type-in after
 * the first completed play.
 */

const STORAGE_KEY = "fh-home-intro-played";

export function hasHomeIntroPlayed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markHomeIntroPlayed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode / quota — ignore */
  }
}
