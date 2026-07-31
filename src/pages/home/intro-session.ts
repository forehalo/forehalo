/**
 * Home intro session — single owner of the once-per-browser gate for the
 * hero type-in, including the reveal-timing contract that used to be
 * re-negotiated in comments across home.tsx / hero.tsx.
 *
 * Discipline (all of it lives here):
 * - The decision is made on the first `hasHomeIntroPlayed()` call and cached:
 *   storage is never re-read afterwards. Re-reading mid-type would flip
 *   skipIntro and freeze the typewriter on the last line (freeze fix,
 *   f2518bc).
 * - The mark is written EARLY — at the reveal point, before the final verse
 *   line finishes — so a mid-reveal reload still skips the type-in next time.
 *   `markHomeIntroPlayed` is a no-op after the first call and latches the
 *   cached decision too, so a remount within the same SPA session skips.
 * - Timing contract: the log section may reveal once `introRevealAt` chars
 *   are typed (the penultimate line has fully typed; the final verse is just
 *   beginning); the final line then holds `INTRO_REVEAL_HOLD` ms while the
 *   log reveals below.
 *
 * Key `fh-home-intro-played` (value `"1"`) stays stable — no migration.
 */

const STORAGE_KEY = "fh-home-intro-played";
const PLAYED_VALUE = "1";

/** the final verse line holds this long (≈1s) while the log reveals below */
export const INTRO_REVEAL_HOLD = 1000;

/**
 * Chars typed when the log reveal (and the early mark) may happen: the last
 * verse line is about to begin typing. Derived here from the hero's line
 * model so the contract can't drift from the actual lines.
 */
export function introRevealAt(totalChars: number, finalLineLength: number): number {
  return totalChars - finalLineLength;
}

let introPlayed: boolean | null = null;
let introMarked = false;

/**
 * Whether the type-in should play for this mount. Decided once on first call
 * and cached for the module's lifetime — never re-reads storage (freeze
 * guard).
 */
export function hasHomeIntroPlayed(): boolean {
  if (introPlayed == null) {
    introPlayed = readPlayed();
  }
  return introPlayed;
}

/**
 * Record the play. Called early, at the reveal point (before the final verse
 * finishes typing). No-op after the first call; also sets the cached decision
 * so a remount in the same session skips.
 */
export function markHomeIntroPlayed(): void {
  if (introMarked) return;
  introMarked = true;
  introPlayed = true;
  try {
    localStorage.setItem(STORAGE_KEY, PLAYED_VALUE);
  } catch {
    /* private mode / quota — ignore */
  }
}

function readPlayed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === PLAYED_VALUE;
  } catch {
    return false;
  }
}
