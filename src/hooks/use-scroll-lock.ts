import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Freeze page scroll while `open`, WITHOUT `Lenis.stop()`.
 *
 * Lenis.stop() still preventDefaults every wheel/touch while stopped, which
 * also freezes nested/native scrollers — the palette list would never move.
 * Instead: capture wheel/touch at the window in the capture phase (before
 * Lenis's own listener), redirect wheel deltas to `targetRef` when the event
 * is inside it, and prevent events everywhere else. Overflow is clamped on
 * <html> + <body> for the duration and restored on close.
 */
export function useScrollLock(open: boolean, targetRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const target = targetRef.current;
      if (!target || !target.contains(e.target as Node)) return;
      // Normalize line/page deltas so mouse wheels still move the list.
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= target.clientHeight;
      target.scrollTop += dy;
    };

    const onTouchMove = (e: TouchEvent) => {
      const target = targetRef.current;
      if (target && target.contains(e.target as Node)) return;
      e.preventDefault();
    };

    // Capture so we run before Lenis's window wheel listener.
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
    };
  }, [open, targetRef]);
}
