/**
 * Shared motion constants (design.md §6).
 * One master ease — "compile-out": instant attack, long silk settle.
 */
export const EASE_COMPILE_OUT = [0.16, 1, 0.3, 1] as [number, number, number, number];
export const EASE_EXIT_IN = [0.7, 0, 0.2, 1] as [number, number, number, number];

export const DUR = {
  micro: 0.2,
  ui: 0.38,
  section: 0.9,
  page: 0.65,
} as const;

/** compilePrint: 12ms/token stagger (design.md §6) */
export const TOKEN_STAGGER = 0.012;
