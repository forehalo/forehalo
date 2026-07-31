import { useCallback } from "react";
import { useTheme } from "next-themes";
import type { ThemePreference } from "@/lib/theme";

export type { ThemePreference } from "@/lib/theme";

/**
 * Theme preference (design.md §2) — the single owner of the palette's
 * system/light/dark vocabulary. next-themes holds the stored preference and
 * resolved appearance; this hook normalizes `theme` (unknown/undefined →
 * system) and owns the cycle order, so callers never re-implement parsing
 * or option lists.
 */
export const THEME_OPTIONS = [
  "system",
  "light",
  "dark",
] as const satisfies readonly ThemePreference[];

function parseThemePreference(theme: string | undefined): ThemePreference {
  if (theme === "light" || theme === "dark" || theme === "system") return theme;
  return "system";
}

export interface ThemePreferenceApi {
  /** Active preference — always one of system/light/dark. */
  pref: ThemePreference;
  /** Concrete appearance from next-themes (undefined until resolved). */
  resolved: string | undefined;
  /** Advance (dir=1) or retreat (dir=-1) through the cycle; returns the new pref. */
  cycle: (dir?: 1 | -1) => ThemePreference;
  /** Set a specific preference. */
  set: (pref: ThemePreference) => void;
}

export function useThemePreference(): ThemePreferenceApi {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const set = useCallback((pref: ThemePreference) => setTheme(pref), [setTheme]);

  const cycle = useCallback(
    (dir: 1 | -1 = 1): ThemePreference => {
      const i = THEME_OPTIONS.indexOf(parseThemePreference(theme));
      const next =
        THEME_OPTIONS[(i + dir + THEME_OPTIONS.length) % THEME_OPTIONS.length] ?? "system";
      setTheme(next);
      return next;
    },
    [theme, setTheme],
  );

  return { pref: parseThemePreference(theme), resolved: resolvedTheme, cycle, set };
}
