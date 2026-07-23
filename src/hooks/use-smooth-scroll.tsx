import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { useReducedMotion } from "./use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scroll (design.md §7): lerp 0.1, wheelMultiplier 1.0,
 * smoothTouch false (native on touch). Exposed via context so any component
 * (BuildRail, hero buttons) can `scrollTo`.
 */
const LenisCtx = createContext<Lenis | null>(null);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return; // native scrolling under reduced motion
    const instance = new Lenis({ lerp: 0.1, wheelMultiplier: 1.0, syncTouch: false });
    setLenis(instance);
    // keep GSAP ScrollTrigger in sync with Lenis (pinned sections, scrub)
    instance.on("scroll", () => ScrollTrigger.update());
    let raf = 0;
    const loop = (t: number) => {
      instance.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return createElement(LenisCtx.Provider, { value: lenis }, children);
}

export function useLenis() {
  return useContext(LenisCtx);
}

/** Scroll to a selector/element with compile-out-ish easing via Lenis. */
export function useScrollTo() {
  const lenis = useLenis();
  return (target: string | HTMLElement, offset = 0) => {
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView({ behavior: "auto", block: "start" });
      if (offset && el) window.scrollBy({ top: offset });
    }
  };
}
