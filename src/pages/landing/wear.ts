import { LANDING_VISIT_MAX } from "@/pages/landing/visit-count";

/**
 * Single owner of the receipt's current wear: the clamped visit count
 * (0..LANDING_VISIT_MAX) as one normalized 0–1 value. Every visual channel —
 * WhiteSpeckles prop, WearCtx, `data-wear`, `--receipt-wear` — receives this
 * same number, computed once per paint. Do not re-normalize downstream.
 */
export function wearFromCount(count: number): number {
  return count / LANDING_VISIT_MAX;
}
