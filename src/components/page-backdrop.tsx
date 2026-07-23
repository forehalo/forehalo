import { useEffect, useRef } from "react";
import { createBackdropEngine, type BackdropEngine } from "@/lib/backdrop/engine";
import { createFlowFieldScene } from "@/lib/backdrop/scenes/flow-field";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * PageBackdrop — the shared interactive physics backdrop (design.md §2).
 *
 * ONE fixed full-viewport canvas behind all content (`z-0`, `aria-hidden`,
 * `pointer-events-none`), one global scene for every route:
 *   flow-field (the FFI boundary — particles compile amber → emerald
 *   crossing the membrane; the Well stirs the stream)
 *
 * The film-grain overlay still renders above everything (Layout). Under
 * reduced motion the loop never starts — the scene draws a single static
 * frame instead (design.md §9). All loop/pause/cleanup logic lives in the
 * engine (src/lib/backdrop/engine.ts); this component is only the seam
 * between React (reduced-motion) and the engine.
 */
export function PageBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BackdropEngine | null>(null);
  const reduced = useReducedMotion();

  // the engine lives for the app's whole lifetime
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createBackdropEngine(canvas);
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // static frame vs loop on reduced motion
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    // static-only under reduced motion: the scene renders a single still
    // frame (particles frozen mid-stream, membrane flat)
    engine.setScene(() => createFlowFieldScene({ staticOnly: reduced }));
    if (reduced) {
      engine.stop();
      engine.renderStaticFrame();
    } else {
      engine.start();
    }
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
