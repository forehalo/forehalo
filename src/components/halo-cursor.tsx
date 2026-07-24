import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * The Halo Cursor (design.md §5) — replaces the native cursor on fine-pointer
 * devices. A 26px bone ring + 3px halo dot, 60fps transform-only movement
 * with ~180ms trailing ease (lerp 0.18).
 *
 * State is driven by `data-cursor` attributes on hovered elements:
 *   data-cursor="link" | "expand" | "read" | "move" | "ffi" | "sync"
 * The ring MORPHS per state (dashed rotating ring, caret pair, ffi tint…)
 * but never explains itself — no attribute tag labels, no hint chips.
 * Elements with `data-magnetic` counter-lerp ≤6px toward the cursor (§5).
 *
 * Fast movement (>1400px/s) sheds amber spark particles ("compilation
 * artifacts") onto a fixed canvas overlay.
 */

type CursorKind = "default" | "link" | "expand" | "read" | "move" | "ffi" | "sync";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t0: number;
}

function isFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}

export function HaloCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [kind, setKind] = useState<CursorKind>("default");
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [linkRect, setLinkRect] = useState<DOMRect | null>(null);
  const [ffiTint, setFfiTint] = useState(0); // 0=rust, 1=node

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const lastMove = useRef({ x: 0, y: 0, t: 0 });
  const hoveredEl = useRef<HTMLElement | null>(null);
  const magneticEl = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparks = useRef<Spark[]>([]);

  // enable only for fine pointers, and never under reduced motion (§9)
  useEffect(() => {
    const fine = isFinePointer() && !reduced;
    setEnabled(fine);
    document.body.classList.toggle("halo-cursor-active", fine);
    return () => document.body.classList.remove("halo-cursor-active");
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = now - lastMove.current.t;
      // velocity → spark shedding (compilation artifacts)
      if (dt > 0) {
        const dx = e.clientX - lastMove.current.x;
        const dy = e.clientY - lastMove.current.y;
        const speed = (Math.hypot(dx, dy) / dt) * 1000;
        if (speed > 1400 && sparks.current.length < 12) {
          for (let i = 0; i < 2; i++) {
            sparks.current.push({
              x: current.current.x,
              y: current.current.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120 - 40,
              t0: now,
            });
          }
        }
      }
      lastMove.current = { x: e.clientX, y: e.clientY, t: now };
      target.current = { x: e.clientX, y: e.clientY };
      setVisible(true);

      const el = (e.target as HTMLElement | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      if (el !== hoveredEl.current) {
        hoveredEl.current = el;
        if (el) {
          const k = (el.dataset.cursor as CursorKind) || "default";
          setKind(k);
          if (k === "link" || k === "read") setLinkRect(el.getBoundingClientRect());
        } else {
          setKind("default");
          setLinkRect(null);
        }
      } else if (el && (kind === "link" || kind === "read")) {
        setLinkRect(el.getBoundingClientRect());
      }
      // magnetic host may be the cursor target or a nearby flagged element
      magneticEl.current =
        ((e.target as HTMLElement | null)?.closest?.("[data-magnetic]") as HTMLElement | null) ??
        null;
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    // main loop: lerp + magnetism + sparks canvas
    let raf = 0;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") ?? null;
    const resize = () => {
      if (canvas) {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      let tx = target.current.x;
      let ty = target.current.y;

      // magnetism: within 80px of an interactive element, lerp 25% toward its center
      const mel = magneticEl.current;
      if (mel) {
        const r = mel.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(cx - tx, cy - ty);
        if (d < 80) {
          tx += (cx - tx) * 0.25;
          ty += (cy - ty) * 0.25;
          // element counter-lerps ≤6px toward cursor (translate prop: no transform conflicts)
          const f = Math.min(1, (80 - d) / 80);
          mel.style.translate = `${((tx - cx) / Math.max(d, 1)) * 6 * f}px ${((ty - cy) / Math.max(d, 1)) * 6 * f}px`;
        } else {
          mel.style.translate = "0px 0px";
        }
      }

      current.current.x += (tx - current.current.x) * 0.18;
      current.current.y += (ty - current.current.y) * 0.18;
      x.set(current.current.x);
      y.set(current.current.y);

      // ffi tint by x-position inside the bridge (quantized to avoid per-frame renders)
      if (kind === "ffi" && hoveredEl.current) {
        const r = hoveredEl.current.getBoundingClientRect();
        const t = Math.min(1, Math.max(0, (current.current.x - r.left) / Math.max(r.width, 1)));
        setFfiTint((prev) => (Math.abs(prev - t) > 0.02 ? t : prev));
      }

      // keep link/read rect fresh (scroll) — quantized to avoid per-frame renders
      if ((kind === "link" || kind === "read") && hoveredEl.current) {
        const r = hoveredEl.current.getBoundingClientRect();
        setLinkRect((prev) =>
          prev &&
          Math.abs(prev.left - r.left) < 0.5 &&
          Math.abs(prev.top - r.top) < 0.5 &&
          Math.abs(prev.width - r.width) < 0.5 &&
          Math.abs(prev.height - r.height) < 0.5
            ? prev
            : r,
        );
      }

      // sparks
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const now = performance.now();
        const dpr = window.devicePixelRatio;
        sparks.current = sparks.current.filter((s) => now - s.t0 < 400);
        for (const s of sparks.current) {
          const age = (now - s.t0) / 400;
          const px = (s.x + s.vx * age * 0.4) * dpr;
          const py = (s.y + s.vy * age * 0.4 + 30 * age * age) * dpr;
          ctx.globalAlpha = 1 - age;
          ctx.fillStyle =
            getComputedStyle(document.documentElement).getPropertyValue("--halo").trim() ||
            "#FFB43A";
          ctx.fillRect(px, py, 2 * dpr, 2 * dpr);
        }
        ctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("resize", resize);
      magneticEl.current?.style.removeProperty("translate");
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, kind]);

  if (!enabled) return null;

  const isLink = kind === "link" && linkRect;
  const isRead = kind === "read" && linkRect;
  const size = kind === "expand" ? 40 : kind === "ffi" ? 40 : 26;

  // ffi ellipse tint: rust → node by x position
  const ffiColor = `rgb(${Math.round(255 + (140 - 255) * ffiTint)}, ${Math.round(92 + (200 - 92) * ffiTint)}, ${Math.round(40 + (75 - 40) * ffiTint)})`;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />
      {/* read state: ring splits into a caret pair [ ] hugging the block edges */}
      {isRead && linkRect && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-9999 font-mono text-[18px] leading-none text-halo"
        >
          <span
            className="absolute"
            style={{
              left: linkRect.left - 16,
              top: linkRect.top + linkRect.height / 2 - 9,
              transition:
                "left 180ms cubic-bezier(0.16,1,0.3,1), top 180ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            [
          </span>
          <span
            className="absolute"
            style={{
              left: linkRect.right + 8,
              top: linkRect.top + linkRect.height / 2 - 9,
              transition:
                "left 180ms cubic-bezier(0.16,1,0.3,1), top 180ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            ]
          </span>
        </div>
      )}
      {/* link state: the ring morphs into a square pinned on the target
          element (it does NOT follow the cursor; the dot still does).
          Enter animates from the cursor ring (26px circle at the cursor);
          exit fades/shrinks away while the cursor ring springs back. */}
      <AnimatePresence>
        {isLink && linkRect && (
          <motion.div
            key="link-ring"
            aria-hidden
            className="pointer-events-none fixed z-9999"
            initial={{
              left: current.current.x - 13,
              top: current.current.y - 13,
              width: 26,
              height: 26,
              borderRadius: 999,
              opacity: 0,
              scale: 1,
            }}
            animate={{
              left: linkRect.left - 4,
              top: linkRect.top - 4,
              width: linkRect.width + 8,
              height: linkRect.height + 8,
              borderRadius: 4,
              opacity: visible ? 1 : 0,
              scale: pressed ? 0.97 : 1,
            }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ border: "1.5px solid color-mix(in srgb, var(--bone) 60%, transparent)" }}
          />
        )}
      </AnimatePresence>
      {isRead ? (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-9999"
          style={{ x, y, opacity: visible ? 1 : 0 }}
        >
          <Dot pressed={pressed} />
        </motion.div>
      ) : (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-9999"
          style={{ x, y, opacity: visible ? 1 : 0 }}
        >
          {/* ring — hidden on link hover (the pinned square above replaces it) */}
          {!isLink && (
            <motion.div
              className="absolute"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                width: size,
                height: kind === "ffi" ? 30 : size,
                borderRadius: 999,
                opacity: 1,
                scale: pressed ? 0.82 : kind === "move" ? 0.7 : 1,
                backgroundColor: pressed ? "var(--halo-glow)" : "transparent",
              }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                left: 0,
                top: 0,
                translateX: "-50%",
                translateY: "-50%",
                border:
                  kind === "expand"
                    ? "none"
                    : kind === "ffi"
                      ? `1.5px solid ${ffiColor}`
                      : kind === "sync"
                        ? "1.5px solid color-mix(in srgb, var(--wasi-cyan) 85%, transparent)"
                        : "1.5px solid color-mix(in srgb, var(--bone) 60%, transparent)",
              }}
            >
              {/* expand: dashed ring with slow 8s rotation (halo-rotate defined in index.css) */}
              {kind === "expand" && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: "1.5px dashed color-mix(in srgb, var(--halo) 90%, transparent)",
                    animation: "halo-rotate 8s linear infinite",
                  }}
                />
              )}
            </motion.div>
          )}
          {/* sync: collaborator "you" band */}
          {kind === "sync" && (
            <div
              className="absolute rounded-full border border-wasi-cyan/60"
              style={{ width: 34, height: 34, left: -17, top: -17 }}
            />
          )}
          {/* move state crosshair dot */}
          <Dot pressed={pressed} crosshair={kind === "move"} />
          {kind === "sync" && (
            <div
              className="micro absolute whitespace-nowrap rounded-[2px] border border-steel bg-carbon px-1.5 py-0.5 text-wasi-cyan"
              style={{ left: 14, top: 16, fontSize: 9 }}
            >
              you
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}

function Dot({ pressed, crosshair }: { pressed?: boolean; crosshair?: boolean }) {
  return (
    <div
      className="absolute"
      style={{
        width: crosshair ? 10 : 3,
        height: crosshair ? 10 : 3,
        left: crosshair ? -5 : -1.5,
        top: crosshair ? -5 : -1.5,
        borderRadius: 999,
        backgroundColor: crosshair ? "transparent" : "var(--halo)",
        border: crosshair ? "1.5px solid var(--halo)" : undefined,
        transform: pressed ? "scale(1.4)" : undefined,
        transition: "transform 120ms cubic-bezier(0.16,1,0.3,1)",
      }}
    />
  );
}
