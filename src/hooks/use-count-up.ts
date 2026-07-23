import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * countUp (design.md §6): stats tick from 0 with compile-out easing, 900ms.
 * Returns the current display value. Pass `start` to trigger (e.g. inView).
 * Set `live` to keep incrementing by `liveStep` every `liveMs` after landing.
 */
export function useCountUp(
  target: number,
  opts: {
    start?: boolean;
    duration?: number;
    decimals?: number;
    live?: boolean;
    liveStep?: number;
    liveMs?: number;
  } = {},
) {
  const {
    start = true,
    duration = 900,
    decimals = 0,
    live = false,
    liveStep = 1,
    liveMs = 1400,
  } = opts;
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setValue(target);
      doneRef.current = true;
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      // compile-out easing
      const e = 1 - Math.pow(1 - p, 4) * Math.cos(p * 0.5); // ≈ cubic-bezier(0.16,1,0.3,1)
      const eased = p === 1 ? 1 : Math.min(1, e);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setValue(target);
        doneRef.current = true;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration, reduced]);

  // delightful fake liveness after landing
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (doneRef.current) setValue((v) => v + liveStep);
    }, liveMs);
    return () => window.clearInterval(id);
  }, [live, liveStep, liveMs]);

  return value.toFixed(decimals);
}
