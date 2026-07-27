import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SiGithub, SiNodedotjs } from "@icons-pack/react-simple-icons";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";

/**
 * N1 · Hero — The Attribute (napi.md §N1, 100vh).
 * Massive `#[napi]` in JetBrains Mono at clamp(120px, 22vw, 320px) with a
 * dashed macro-region frame, colored per world — rust-logo orange for
 * `# [ ]`, node.js green for `n`, bridge violet for `a p i`. The attribute
 * assembles
 * token-by-token (slot-machine settle, 60ms/token), glow-pulses 400ms, then
 * breathes on a 6s cycle. Once settled, the glyphs are springy bodies:
 * they repel from the cursor (180px radius) and settle back with a
 * rotation twist. The Rust crab and the Node hexagon perch on the top of the
 * dashed frame (scale-fade entrance). Below it: a one-line intro to
 * napi-rs itself and the napi.rs / GitHub links — nothing else.
 */

const ATTR = ["#", "[", "n", "a", "p", "i", "]"] as const;
/** per-glyph colors: rust-logo orange for `# [ ]`, node.js green for `n`,
 * bridge violet for `a p i` — a notch under brand primaries (not neon, not mud) */
const GLYPH_COLORS = [
  "text-[#e45a16]",
  "text-[#e45a16]",
  "text-[#429640]",
  "text-[#9f8aef]",
  "text-[#9f8aef]",
  "text-[#9f8aef]",
  "text-[#e45a16]",
] as const;
const POOL = "#[]{}<>/=+*~napi";

export function HeroAttribute() {
  const reduced = useReducedMotion();
  return (
    <section
      id="annotation"
      className="relative flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 flex-col items-center justify-center overflow-hidden px-6 py-16"
    >
      {/* flanking micro-labels (hud, dim) */}
      <span
        aria-hidden
        className="hud absolute left-8 top-[34%] hidden -translate-y-1/2 text-dim xl:block"
      >
        proc_macro_attribute
      </span>
      <span
        aria-hidden
        className="hud absolute right-8 top-[34%] hidden -translate-y-1/2 text-dim xl:block"
      >
        napi-derive
      </span>

      <Attribute />

      {/* one-line intro to napi-rs (the tool, not the author) */}
      <motion.p
        className="mt-12 max-w-xl text-center font-grotesk text-[17px] font-medium leading-[1.7] text-ash"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_COMPILE_OUT, delay: reduced ? 0 : 0.9 }}
      >
        A framework for building pre-compiled Node.js addons in Rust via Node-API — one attribute,
        zero glue. Also targets WASI.
      </motion.p>

      {/* the links */}
      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_COMPILE_OUT, delay: reduced ? 0 : 1.1 }}
      >
        {[
          {
            label: "napi.rs",
            href: "https://napi.rs",
            icon: <img src="/projects/napi-favicon.png" alt="" className="size-3 rounded-[1px]" />,
          },
          {
            label: "napi-rs/napi-rs",
            href: "https://github.com/napi-rs/napi-rs",
            icon: <SiGithub size={12} aria-hidden />,
          },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            data-cursor="link"
            className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ash transition-colors hover:text-halo"
          >
            {l.icon}
            {l.label}
            <ArrowUpRight size={12} aria-hidden />
          </a>
        ))}
      </motion.div>
    </section>
  );
}

/* ── the giant attribute, slot-machine assembly ─────────────────────────── */

function Attribute() {
  const reduced = useReducedMotion();
  const [chars, setChars] = useState<string[]>(() => ATTR.map(() => ""));
  const [settled, setSettled] = useState(false);
  const [pulseDone, setPulseDone] = useState(false);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bodies = useRef(ATTR.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 })));

  useEffect(() => {
    if (reduced) return; // reduced motion renders the final attribute statically
    const start = performance.now();
    const settleAt = (i: number) => 400 + i * 60; // 60ms/token stagger
    const id = window.setInterval(() => {
      const t = performance.now() - start;
      setChars(
        ATTR.map((final, i) =>
          t >= settleAt(i) ? final : POOL[Math.floor(Math.random() * POOL.length)],
        ),
      );
      if (t >= settleAt(ATTR.length - 1) + 40) {
        window.clearInterval(id);
        setChars([...ATTR]);
        setSettled(true);
      }
    }, 33);
    return () => window.clearInterval(id);
  }, [reduced]);

  // 400ms halo glow pulse right after the settle, then idle breathing
  useEffect(() => {
    if (!settled || reduced) return;
    const t = window.setTimeout(() => setPulseDone(true), 420);
    return () => window.clearTimeout(t);
  }, [settled, reduced]);

  // cursor-repulsion physics — starts only after the slot machine settles,
  // so the entrance assembly is never disturbed (from the forehalo-2 hero)
  useEffect(() => {
    if (reduced || !settled) return;
    const pointer = { x: -9999, y: -9999, active: false };
    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    let raf = 0;
    let lastT = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = lastT ? Math.min(50, t - lastT) : 16.667;
      lastT = t;
      const f = Math.min(3, dt / 16.667);
      for (let i = 0; i < ATTR.length; i++) {
        const el = glyphRefs.current[i];
        const b = bodies.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - b.x;
        const cy = rect.top + rect.height / 2 - b.y;
        let ax = -b.x * 0.075;
        let ay = -b.y * 0.075;
        if (pointer.active) {
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < 180 && d > 0.01) {
            const force = (1 - d / 180) * 2.4;
            ax += (dx / d) * force;
            ay += (dy / d) * force;
          }
        }
        b.vx = (b.vx + ax * f) * 0.86;
        b.vy = (b.vy + ay * f) * 0.86;
        b.x += b.vx * f;
        b.y += b.vy * f;
        el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.x * 0.08}deg)`;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced, settled]);

  // under reduced motion the final attribute renders statically (no slot machine)
  const shown = reduced ? ATTR : chars;
  const settledEff = reduced || settled;
  const pulseDoneEff = reduced || pulseDone;

  return (
    <div
      className="napi-frame relative px-5 py-3 outline-hidden sm:px-8 sm:py-4"
      data-cursor="expand"
      tabIndex={0}
      role="img"
      aria-label="#[napi] — the attribute macro that binds Rust to Node"
    >
      {/* dashed macro-region frame — dashes march on hover (preview shimmer) */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
        <rect
          className="napi-frame-dash"
          x="1"
          y="1"
          rx="3"
          fill="none"
          stroke="var(--steel-soft)"
          strokeWidth="1"
          strokeDasharray="7 6"
          style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }}
        />
      </svg>
      <div
        aria-hidden
        className={`select-none whitespace-pre font-mono font-bold ${
          settledEff ? (pulseDoneEff ? "napi-attr-breathe" : "napi-attr-pulse") : ""
        } text-[clamp(120px,22vw,320px)] leading-[0.9] tracking-[-0.03em] max-sm:text-[clamp(52px,18vw,110px)]`}
        style={{ textShadow: "0 0 25px rgba(159,138,239,0.14)" }}
      >
        {shown.map((c, i) => (
          <span
            key={i}
            ref={(el) => {
              glyphRefs.current[i] = el;
            }}
            className={`inline-block will-change-transform ${GLYPH_COLORS[i]}`}
          >
            {c || " "}
          </span>
        ))}
      </div>

      {/* world mascots perched on the top of the dashed frame — Rust crab
          stands on the rail; the Node hexagon rests on a flat edge. Both
          scale-fade in once the slot machine settles. */}
      <FrameLogos settled={settledEff} />
    </div>
  );
}

/* ── world mascots perched on the macro-region frame ────────────────────
 * Pure CSS entrances. JS only toggles `.napi-logos-live` once the title
 * slot-machine settles; delays in napi.css sequence Rust → Node.
 * Node is rotated 30° so one hex edge sits flat on the top border rail. */

const LOGO_SIZE = 28;

function FrameLogos({ settled }: { settled: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0${settled ? " napi-logos-live" : ""}`}
    >
      {/* Rust crab stands on the top border, near the `[` glyph */}
      <div
        className="napi-logo-rust absolute"
        style={{ left: "22%", bottom: "100%", marginBottom: -1 }}
      >
        <img src="/rust.png" alt="" width={LOGO_SIZE} className="block h-auto" draggable={false} />
      </div>

      {/* Node hexagon — rotated 30° so one flat edge rests on the top rail */}
      <div
        className="napi-logo-node absolute"
        style={{ left: "calc(30% - 10px)", bottom: "100%", marginBottom: -1 }}
      >
        <span className="napi-node-glow" />
        <SiNodedotjs size={LOGO_SIZE} aria-hidden />
        {/* fleck delays / directions live in CSS nth-child rules */}
        <span className="napi-star-field">
          <span className="napi-star-fleck" />
          <span className="napi-star-fleck" />
          <span className="napi-star-fleck" />
          <span className="napi-star-fleck" />
          <span className="napi-star-fleck" />
          <span className="napi-star-fleck" />
          <span className="napi-star-fleck" />
          <span className="napi-star-fleck" />
        </span>
      </div>
    </div>
  );
}
