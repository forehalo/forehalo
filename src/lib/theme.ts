/**
 * Theme resolution (forge dual theme).
 *
 * Preference: "light" | "dark" | "system" (null/absent storage = system).
 * Resolved appearance always collapses to "light" | "dark".
 *
 * Storage key and resolve logic are shared with the pre-paint FOUC bootstrap
 * in index.html — keep them in sync.
 */

export const THEME_STORAGE_KEY = "fh-theme";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** Collapse stored/UI preference + OS media into a concrete theme. */
export function resolveTheme(
  preference: ThemePreference | null | undefined,
  prefersDark: boolean,
): ResolvedTheme {
  if (preference === "light" || preference === "dark") return preference;
  return prefersDark ? "dark" : "light";
}

/** Parse a stored value; unknown/empty → system. */
export function parseThemePreference(raw: string | null | undefined): ThemePreference {
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}

/**
 * Read a CSS custom property from <html> (forge tokens like `--halo`).
 * Custom properties return their authored value (hex/rgba), not computed rgb.
 */
export function readCssToken(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
