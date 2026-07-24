/**
 * Landing (`/`) visit counter — scales thermal print wear only (not paper color).
 * Stored in localStorage; clamped to [0, 10]. Resets after TTL so the receipt
 * never stays permanently unreadable.
 */

export const LANDING_VISIT_KEY = "fh-landing-visits";
export const LANDING_VISIT_MIN = 0;
export const LANDING_VISIT_MAX = 10;
/** Counter expires this long after the last recorded visit. */
export const LANDING_VISIT_TTL_MS = 60_000;

type VisitState = {
  count: number;
  /** epoch ms of last write */
  ts: number;
};

function clamp(n: number): number {
  return Math.min(LANDING_VISIT_MAX, Math.max(LANDING_VISIT_MIN, n));
}

function readState(): VisitState | null {
  try {
    const raw = localStorage.getItem(LANDING_VISIT_KEY);
    if (raw == null || raw === "") return null;

    // legacy: bare integer from before TTL
    if (/^\d+$/.test(raw)) {
      return { count: clamp(Number.parseInt(raw, 10)), ts: Date.now() };
    }

    const parsed = JSON.parse(raw) as Partial<VisitState>;
    if (typeof parsed.count !== "number" || typeof parsed.ts !== "number") {
      return null;
    }
    if (Number.isNaN(parsed.count) || Number.isNaN(parsed.ts)) return null;
    return { count: clamp(parsed.count), ts: parsed.ts };
  } catch {
    return null;
  }
}

function writeState(state: VisitState): void {
  try {
    localStorage.setItem(LANDING_VISIT_KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota */
  }
}

function clearState(): void {
  try {
    localStorage.removeItem(LANDING_VISIT_KEY);
  } catch {
    /* ignore */
  }
}

function isExpired(ts: number, now = Date.now()): boolean {
  return now - ts > LANDING_VISIT_TTL_MS;
}

/** Current wear level (0 = fresh). Expired / missing storage → 0. */
export function getLandingVisitCount(): number {
  const state = readState();
  if (!state) return LANDING_VISIT_MIN;
  if (isExpired(state.ts)) {
    clearState();
    return LANDING_VISIT_MIN;
  }
  return state.count;
}

/**
 * Age for this paint, then bump the counter (and refresh TTL) for the next visit.
 * If the previous counter expired, starts from 0 again.
 */
export function recordLandingVisit(): number {
  const now = Date.now();
  const state = readState();
  const age = state && !isExpired(state.ts, now) ? state.count : LANDING_VISIT_MIN;
  const next = clamp(age + 1);
  writeState({ count: next, ts: now });
  return age;
}
