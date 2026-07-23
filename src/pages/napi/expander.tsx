import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "@/components/section-header";
import { CodeBlock } from "@/components/code-block";
import { MacroExpand } from "@/components/motion/macro-expand";
import { highlightLine } from "@/lib/highlight";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { AFTER_CODE, GLUE_ELIMINATED, RAW_FOLD, RAW_FOLD_COUNT, RAW_VISIBLE } from "./raw-binding";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * N2 · The Expander (napi.md §N2) — the pinned centerpiece.
 * One CodeBlock frame whose filename tab morphs `binding_raw.rs` ⇄ `sum.rs`.
 * A halo scanline with a mono `⟨ expand ⟩` handle sweeps top→bottom through
 * the code as scroll progresses during the 220vh pin (ScrollTrigger scrub
 * 0.5): above it the 4-line `#[napi]` macro materializes, below it the raw
 * N-API boilerplate dissolves into ghosts (chars scatter 6px + fade). The
 * frame header shows only the filename tab morph; at 100% the frame has
 * shrunk to the 4-line macro. Handle is pointer-draggable + keyboard operable
 * (role=slider). Reduced motion: static two-column with a tap-to-toggle.
 */

const BEFORE_LINES = RAW_VISIBLE.split("\n");
const FOLD_LINES = RAW_FOLD.split("\n");
const AFTER_LINES = AFTER_CODE.split("\n");

const BAND = 48; // dissolve band height in px
const SHRINK_START = 0.86; // pin progress where the frame starts collapsing

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** deterministic per-row scatter direction, ±6px */
const jitterFor = (i: number) => (((i * 2654435761) % 1000) / 1000 - 0.5) * 12;

/** rust (#FF5C28) → halo (#FFB43A) */
export function Expander() {
  const reduced = useReducedMotion();
  return (
    <section id="expansion" className="relative scroll-mt-14 py-24">
      <div className="mx-auto max-w-[1360px] px-6 md:px-16">
        <SectionHeader
          slug="expansion"
          title="118 lines you'd have to write. 4 lines with the macro."
        />
        {reduced ? <StaticExpander /> : <PinnedMorph />}
      </div>
    </section>
  );
}

/* ── the pinned before ⇄ after morph ────────────────────────────────────── */

function PinnedMorph() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const beforeRef = useRef<HTMLDivElement | null>(null);
  const afterRef = useRef<HTMLDivElement | null>(null);
  const scanRef = useRef<HTMLDivElement | null>(null);

  const dims = useRef({ beforeH: 0, afterH: 0 });
  const rows = useRef<HTMLElement[]>([]);
  const progress = useRef(0);
  const dragging = useRef(false);

  const [foldOpen, setFoldOpen] = useState(false);
  const [eliminated, setEliminated] = useState(0);
  const [afterName, setAfterName] = useState(false);
  const [scale, setScale] = useState(1);

  const apply = useCallback((p: number) => {
    progress.current = p;
    const { beforeH, afterH } = dims.current;
    const viewport = viewportRef.current;
    const scan = scanRef.current;
    if (!viewport || !scan || beforeH <= 0 || afterH <= 0) return;

    const sweep = clamp01(p / SHRINK_START);
    const shrinkT = p <= SHRINK_START ? 0 : (p - SHRINK_START) / (1 - SHRINK_START);
    const shrinkE = easeInOut(shrinkT);
    const h = beforeH - (beforeH - afterH) * shrinkE;
    const scanY = Math.min(sweep * beforeH, h);

    viewport.style.height = `${h}px`;
    scan.style.transform = `translateY(${scanY}px)`;
    scan.style.opacity = String(1 - shrinkE);

    // AFTER materializes top-down over the first 80% of the pin
    const reveal = clamp01(p / 0.8);
    const after = afterRef.current;
    if (after) after.style.clipPath = `inset(0 0 ${(1 - reveal) * 100}% 0)`;

    // BEFORE: below the scanline intact · in the band dissolving · above it ghost
    for (let i = 0; i < rows.current.length; i++) {
      const el = rows.current[i];
      const d = el.offsetTop - scanY;
      if (d >= BAND) {
        if (el.style.opacity !== "1") {
          el.style.opacity = "1";
          el.style.transform = "";
        }
      } else if (d >= 0) {
        const t = 1 - d / BAND;
        el.style.opacity = String(1 - t * 0.75);
        el.style.transform = `translate(${t * jitterFor(i)}px, ${-t * 3}px)`;
      } else {
        const depth = clamp01(-d / (beforeH * 0.6));
        const ghost = (0.13 - depth * 0.1) * (1 - shrinkE);
        el.style.opacity = String(Math.max(0, ghost));
        el.style.transform = `translate(${jitterFor(i) * 1.5}px, 0)`;
      }
    }

    // progress state (drives the slider's aria-valuenow) + filename morph
    const n = Math.round(GLUE_ELIMINATED * sweep);
    setEliminated((prev) => (prev === n ? prev : n));
    const nameAfter = sweep > 0.5;
    setAfterName((prev) => (prev === nameAfter ? prev : nameAfter));
  }, []);

  const measure = useCallback(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!before || !after) return;
    dims.current.beforeH = before.scrollHeight;
    dims.current.afterH = after.scrollHeight;
    rows.current = Array.from(before.querySelectorAll<HTMLElement>("[data-row]"));

    // scale-to-fit: the whole frame must fit the pinned stage
    const stage = stageRef.current;
    if (stage) {
      const frameH = 41 + dims.current.beforeH + 2; // header + borders
      setScale(Math.min(1, (stage.clientHeight - 24) / frameH));
    }
    apply(progress.current);
  }, [apply]);

  // initial measure + re-measure on resize / fold expand
  useLayoutEffect(() => {
    measure();
    const before = beforeRef.current;
    const ro = new ResizeObserver(measure);
    if (before) ro.observe(before);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // 220vh pin — the scanline maps linearly to scroll progress (scrub 0.5)
  useGSAP(
    () => {
      if (!stageRef.current) return;
      const st = ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top top+=56",
        end: "+=220%",
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          if (!dragging.current) apply(self.progress);
        },
      });
      return () => st.kill();
    },
    { scope: stageRef },
  );

  /* handle drag (pointer) + keyboard (role=slider, magnetic ends) */
  const dragState = useRef({ startY: 0, startP: 0 });
  const tweenTo = useCallback(
    (target: number) => {
      const obj = { p: progress.current };
      gsap.to(obj, {
        p: target,
        duration: 0.25,
        ease: "power2.out",
        onUpdate: () => apply(obj.p),
      });
    },
    [apply],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragging.current = true;
    dragState.current = { startY: e.clientY, startP: progress.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const { beforeH } = dims.current;
    if (beforeH <= 0) return;
    const dy = e.clientY - dragState.current.startY;
    const scanYPx = clamp01(dragState.current.startP / SHRINK_START) * beforeH + dy;
    apply(clamp01(scanYPx / beforeH) * SHRINK_START);
  };
  const onPointerUp = () => {
    dragging.current = false;
    if (progress.current < 0.06) tweenTo(0);
    else if (progress.current > 0.97) tweenTo(1);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = 0.05 * SHRINK_START;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") apply(clamp01(progress.current + step));
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") apply(clamp01(progress.current - step));
    else if (e.key === "Home") apply(0);
    else if (e.key === "End") tweenTo(1);
    else return;
    e.preventDefault();
  };

  const pct = Math.round((eliminated / GLUE_ELIMINATED) * 100);

  return (
    <div
      ref={stageRef}
      className="flex h-[calc(100dvh-3.5rem)] flex-col justify-center overflow-hidden"
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
        <div className="rounded-[3px] border border-steel bg-carbon" data-cursor="read">
          {/* frame header — filename tab morph */}
          <div className="flex items-center justify-between gap-4 border-b border-steel px-4 py-2">
            <div className="relative font-mono text-[11px]">
              <span
                className={cn(
                  "transition-opacity duration-150",
                  afterName ? "opacity-0" : "text-ash",
                )}
              >
                binding_raw.rs
              </span>
              <span
                aria-hidden={!afterName}
                className={cn(
                  "absolute left-0 top-0 whitespace-nowrap transition-opacity duration-150",
                  afterName ? "text-halo opacity-100" : "opacity-0",
                )}
              >
                sum.rs
              </span>
            </div>
          </div>

          {/* the morph viewport */}
          <div ref={viewportRef} className="relative overflow-hidden">
            {/* BEFORE — raw boilerplate (the ash/dim world), dissolves as the scanline passes */}
            <div
              ref={beforeRef}
              className="absolute inset-x-0 top-0 py-3 font-mono text-[13px] leading-[1.6] opacity-[0.82]"
            >
              {BEFORE_LINES.map((line, i) => (
                <div key={i} data-row className="whitespace-pre px-4 will-change-transform">
                  <Gutter n={i + 1} />
                  {highlightLine(line, "rust", `rv${i}-`)}
                </div>
              ))}
              {/* folded 78 lines */}
              <div data-row className="px-4">
                <button
                  onClick={() => setFoldOpen((v) => !v)}
                  data-cursor="expand"
                  className="my-1 w-full rounded-[2px] border border-dashed border-steel-soft px-2 py-1 text-left text-[11px] text-dim transition-colors hover:border-halo hover:text-halo"
                >
                  // … {RAW_FOLD_COUNT} more lines {foldOpen ? "▴" : "▾"}
                </button>
              </div>
              <MacroExpand open={foldOpen}>
                {FOLD_LINES.map((line, i) => (
                  <div key={i} data-row className="whitespace-pre px-4 will-change-transform">
                    <Gutter n={BEFORE_LINES.length + i + 1} />
                    {highlightLine(line, "rust", `rf${i}-`)}
                  </div>
                ))}
              </MacroExpand>
            </div>

            {/* AFTER — the 4-line macro, revealed by the scanline */}
            <div
              ref={afterRef}
              className="absolute inset-x-0 top-0 py-3 font-mono text-[13px] leading-[1.6]"
              style={{ clipPath: "inset(0 0 100% 0)" }}
            >
              {AFTER_LINES.map((line, i) => (
                <div key={i} className="whitespace-pre px-4">
                  <Gutter n={i + 1} />
                  {highlightLine(line, "rust", `af${i}-`)}
                </div>
              ))}
            </div>

            {/* the expansion slider — 1px halo scanline + mono handle */}
            <div ref={scanRef} className="pointer-events-none absolute inset-x-0 top-0 z-10">
              <div className="h-px w-full bg-halo shadow-[0_0_8px_rgba(255,180,58,0.65)]" />
              <button
                type="button"
                role="slider"
                aria-label="expansion slider — drag to expand the macro"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                data-cursor="move"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onKeyDown={onKeyDown}
                className="pointer-events-auto absolute right-3 top-0 -translate-y-1/2 touch-none rounded-[2px] border border-steel bg-carbon-2 px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] text-halo transition-colors hover:border-halo"
              >
                ⟨ strip ⟩
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Gutter({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="inline-block w-8 select-none pr-4 text-right align-top text-dim"
      style={{ fontSize: 10 }}
    >
      {n}
    </span>
  );
}

/* ── reduced-motion: static two-column before/after + tap-to-toggle ─────── */

function StaticExpander() {
  const [tab, setTab] = useState<"raw" | "macro">("raw");
  return (
    <div>
      <div className="mb-4 flex gap-2 lg:hidden" role="tablist" aria-label="before / after">
        {(["raw", "macro"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            data-cursor="link"
            className={cn(
              "rounded-[2px] border px-2.5 py-1 font-mono text-[11px] transition-colors",
              tab === t
                ? "border-halo bg-halo-soft text-halo"
                : "border-steel text-dim hover:text-bone",
            )}
          >
            {t === "raw" ? "binding_raw.rs" : "sum.rs"}
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn(tab === "raw" ? "block" : "hidden lg:block")}>
          <CodeBlock
            filename="binding_raw.rs"
            code={RAW_VISIBLE}
            lang="rust"
            foldedNote={`… ${RAW_FOLD_COUNT} more lines you didn't have to write`}
            foldCode={RAW_FOLD}
          />
        </div>
        <div className={cn(tab === "macro" ? "block" : "hidden lg:block")}>
          <CodeBlock filename="sum.rs" code={AFTER_CODE} lang="rust" />
          <p className="micro mt-3 text-dim">
            <span className="text-node">✓ expanded</span> — {GLUE_ELIMINATED} lines of glue
            eliminated
          </p>
        </div>
      </div>
    </div>
  );
}
