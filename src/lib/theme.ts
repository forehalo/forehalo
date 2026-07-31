/**
 * Theme preference vocabulary (forge dual theme).
 *
 * Preference: "light" | "dark" | "system" (null/absent storage = system).
 * THEME_STORAGE_KEY is shared with the pre-paint FOUC bootstrap in index.html
 * (which resolves the stored preference into a concrete theme) — keep in sync.
 */

export const THEME_STORAGE_KEY = "fh-theme";

export type ThemePreference = "light" | "dark" | "system";

/**
 * Read a CSS custom property from <html> (forge tokens like `--halo`).
 * Custom properties return their authored value (hex/rgba), not computed rgb.
 */
export function readCssToken(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
