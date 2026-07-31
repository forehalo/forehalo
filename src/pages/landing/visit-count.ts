/**
 * Landing (`/`) visit counter — scales thermal print wear only (not paper color).
 * Stored in localStorage; clamped to [0, 10]. Resets after TTL so the receipt
 * never stays permanently unreadable.
 *
 * All storage access goes through the `LandingStorage` port (default:
 * `globalThis.localStorage`, guarded exactly like the old inline try/catch
 * calls) so the TTL / clamp / legacy-migration logic is exercisable without
 * monkey-patching the global.
 */

export const LANDING_VISIT_KEY = "fh-landing-visits";
export const LANDING_VISIT_MIN = 0;
export const LANDING_VISIT_MAX = 10;
/** Counter expires this long after the last recorded visit. */
export const LANDING_VISIT_TTL_MS = 60_000;

/** Minimal storage port — injectable so the counter logic is testable in isolation. */
export type LandingStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const defaultStorage: LandingStorage = {
  getItem(key) {
    try {
      return globalThis.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      globalThis.localStorage.setItem(key, value);
    } catch {
      /* private mode / quota */
    }
  },
};

type VisitState = {
  count: number;
  /** epoch ms of last write */
  ts: number;
};

function clamp(n: number): number {
  return Math.min(LANDING_VISIT_MAX, Math.max(LANDING_VISIT_MIN, n));
}

function readState(storage: LandingStorage): VisitState | null {
  try {
    const raw = storage.getItem(LANDING_VISIT_KEY);
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

function writeState(storage: LandingStorage, state: VisitState): void {
  try {
    storage.setItem(LANDING_VISIT_KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota */
  }
}

function isExpired(ts: number, now = Date.now()): boolean {
  return now - ts > LANDING_VISIT_TTL_MS;
}

/**
 * Age for this paint, then bump the counter (and refresh TTL) for the next
 * visit. Returns the NEW (post-bump) count — the aging THIS paint renders —
 * so a caller writing via a lazy `useState` initializer shows the bump on
 * first paint instead of one visit late. If the previous counter expired,
 * starts from 0 again.
 */
export function recordLandingVisit(storage: LandingStorage = defaultStorage): number {
  const now = Date.now();
  const state = readState(storage);
  const age = state && !isExpired(state.ts, now) ? state.count : LANDING_VISIT_MIN;
  const next = clamp(age + 1);
  writeState(storage, { count: next, ts: now });
  return next;
}
