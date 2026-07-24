import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";

const ORIGIN_SIZE = 26;

type Frame = {
  /** bumps on each new target so enter morph restarts from the pointer */
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
  originX: number;
  originY: number;
};

/**
 * Pinned bone square around buttons / clickable links marked
 * `data-cursor="link"`. Enter morphs from a small ring at the pointer
 * into the element bounds; native cursor stays.
 * Fine pointers only.
 */
export function LinkFrame() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [pressed, setPressed] = useState(false);
  const target = useRef<HTMLElement | null>(null);
  const nextId = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const boundsOf = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return {
        left: r.left - 4,
        top: r.top - 4,
        width: r.width + 8,
        height: r.height + 8,
      };
    };

    const measure = () => {
      const el = target.current;
      if (!el) return;
      const b = boundsOf(el);
      setFrame((prev) => (prev ? { ...prev, ...b } : prev));
    };

    const onMove = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        '[data-cursor="link"]',
      ) as HTMLElement | null;

      if (el !== target.current) {
        target.current = el;
        if (!el) {
          setFrame(null);
          setPressed(false);
          return;
        }
        // New target: seed origin at the pointer, then morph to bounds.
        const b = boundsOf(el);
        nextId.current += 1;
        setFrame({
          id: nextId.current,
          ...b,
          originX: e.clientX,
          originY: e.clientY,
        });
        return;
      }

      if (el) {
        // Stay glued while moving / layout shifts under the pointer.
        const b = boundsOf(el);
        setFrame((prev) => (prev ? { ...prev, ...b } : prev));
      }
    };

    const onDown = () => {
      if (target.current) setPressed(true);
    };
    const onUp = () => setPressed(false);
    const onLeave = () => {
      target.current = null;
      setFrame(null);
      setPressed(false);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("scroll", measure, { capture: true, passive: true });
    window.addEventListener("resize", measure);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      target.current = null;
    };
  }, [enabled]);

  if (!enabled) return null;

  const half = ORIGIN_SIZE / 2;

  return (
    <AnimatePresence>
      {frame && (
        <motion.div
          key={frame.id}
          aria-hidden
          className="pointer-events-none fixed z-9999"
          initial={
            reduced
              ? false
              : {
                  left: frame.originX - half,
                  top: frame.originY - half,
                  width: ORIGIN_SIZE,
                  height: ORIGIN_SIZE,
                  borderRadius: 999,
                  opacity: 0,
                  scale: 1,
                }
          }
          animate={{
            left: frame.left,
            top: frame.top,
            width: frame.width,
            height: frame.height,
            borderRadius: 4,
            opacity: 1,
            scale: pressed ? 0.97 : 1,
          }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.92, transition: { duration: 0.12 } }}
          transition={reduced ? { duration: 0 } : { duration: 0.18, ease: EASE_COMPILE_OUT }}
          style={{
            border: "1.5px solid color-mix(in srgb, var(--bone) 60%, transparent)",
          }}
        />
      )}
    </AnimatePresence>
  );
}
