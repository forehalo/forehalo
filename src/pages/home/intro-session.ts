/**
 * Home intro plays once per SPA session. Navigating away and back (or the
 * lazy Home chunk remounting) must not re-type the hero or re-stagger the log.
 */
let played = false;

export function hasHomeIntroPlayed(): boolean {
  return played;
}

export function markHomeIntroPlayed(): void {
  played = true;
}
