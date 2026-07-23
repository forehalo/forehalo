import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createElement } from "react";

/**
 * Motion preference (design.md §9).
 * Honors `prefers-reduced-motion` AND the command-palette `motion → reduce`
 * toggle (persisted to localStorage, mirrored onto <html data-motion>).
 */
interface MotionCtx {
  reduced: boolean;
  /** user override via palette: 'full' | 'reduced' | null (follow OS) */
  setOverride: (v: "full" | "reduced" | null) => void;
}

const Ctx = createContext<MotionCtx>({ reduced: false, setOverride: () => {} });

export function MotionProvider({ children }: { children: ReactNode }) {
  const [osReduced, setOsReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [override, setOverrideState] = useState<"full" | "reduced" | null>(() => {
    try {
      return (localStorage.getItem("fh-motion") as "full" | "reduced" | null) ?? null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = (e: MediaQueryListEvent) => setOsReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const reduced = override ? override === "reduced" : osReduced;

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
    document.documentElement.classList.toggle("reduced-motion", reduced);
  }, [reduced]);

  const setOverride = (v: "full" | "reduced" | null) => {
    setOverrideState(v);
    try {
      if (v) localStorage.setItem("fh-motion", v);
      else localStorage.removeItem("fh-motion");
    } catch {
      /* noop */
    }
  };

  return createElement(Ctx.Provider, { value: { reduced, setOverride } }, children);
}

export function useMotionPref() {
  return useContext(Ctx);
}

/** Boolean: should decorative motion be suppressed? */
export function useReducedMotion() {
  return useContext(Ctx).reduced;
}
