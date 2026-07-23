import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/section-header";
import { LabPanel } from "@/pages/perfsee/lab-panel";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * P2 · Bundle lab — the home-page treemap elevated to a full instrument.
 * A two-row size-heatmap of an example app's production bundle: block color
 * is a heat scale (halo = heaviest offender), hover inspects a module and a
 * sibling module table stays in sync. A `baseline ⇄ this pr` toggle replays
 * Perfsee's signature move — the bundle diff on every PR: changed modules
 * light up with their ±kB deltas. All figures are illustrative (demo replay).
 */

interface Mod {
  id: string;
  path: string;
  /** parsed size in kB at baseline */
  parsed: number;
  /** gzip size in kB at baseline */
  gzip: number;
  /** parsed delta in kB introduced by the PR (0 = untouched) */
  delta: number;
  /** treemap rect in percent of the canvas */
  rect: { x: number; y: number; w: number; h: number };
}

const MODULES: Mod[] = [
  {
    id: "react",
    path: "vendor/react-dom",
    parsed: 412,
    gzip: 118,
    delta: 0,
    rect: { x: 0, y: 0, w: 26, h: 56 },
  },
  {
    id: "three",
    path: "vendor/three",
    parsed: 301,
    gzip: 88,
    delta: 0,
    rect: { x: 26, y: 0, w: 20, h: 56 },
  },
  {
    id: "editor",
    path: "editor/core",
    parsed: 268,
    gzip: 74,
    delta: 34,
    rect: { x: 46, y: 0, w: 18, h: 56 },
  },
  {
    id: "app",
    path: "app/main",
    parsed: 208,
    gzip: 61,
    delta: 12,
    rect: { x: 64, y: 0, w: 20, h: 56 },
  },
  {
    id: "runtime",
    path: "runtime/webpack",
    parsed: 96,
    gzip: 22,
    delta: 0,
    rect: { x: 84, y: 0, w: 16, h: 56 },
  },
  {
    id: "index",
    path: "pages/index",
    parsed: 142,
    gzip: 40,
    delta: -18,
    rect: { x: 0, y: 56, w: 16, h: 44 },
  },
  {
    id: "thread",
    path: "pages/thread",
    parsed: 118,
    gzip: 33,
    delta: -8,
    rect: { x: 16, y: 56, w: 14, h: 44 },
  },
  {
    id: "shared",
    path: "shared/utils",
    parsed: 88,
    gzip: 25,
    delta: 6,
    rect: { x: 30, y: 56, w: 16, h: 44 },
  },
  {
    id: "worker",
    path: "worker/search",
    parsed: 64,
    gzip: 19,
    delta: 0,
    rect: { x: 46, y: 56, w: 14, h: 44 },
  },
  {
    id: "analytics",
    path: "vendor/analytics-sdk",
    parsed: 57,
    gzip: 17,
    delta: 9,
    rect: { x: 60, y: 56, w: 12, h: 44 },
  },
  {
    id: "css",
    path: "styles/app.css",
    parsed: 41,
    gzip: 9,
    delta: -3,
    rect: { x: 72, y: 56, w: 12, h: 44 },
  },
  {
    id: "i18n",
    path: "i18n/locales",
    parsed: 24,
    gzip: 7,
    delta: 0,
    rect: { x: 84, y: 56, w: 16, h: 44 },
  },
];

const TOTAL = MODULES.reduce((s, m) => s + m.parsed, 0); // 1,819 kB
const TOTAL_GZIP = MODULES.reduce((s, m) => s + m.gzip, 0); // 513 kB
const TOTAL_DELTA = MODULES.reduce((s, m) => s + m.delta, 0); // +32 kB

/** heat bucket: block color scales with parsed size */
function bucket(m: Mod): { fill: string; opacity: number; hot: boolean } {
  if (m.parsed >= 260) return { fill: "#FFB43A", opacity: 0.72, hot: true }; // halo
  if (m.parsed >= 120) return { fill: "#8B9098", opacity: 0.5, hot: false }; // ash
  if (m.parsed >= 50) return { fill: "#4C525B", opacity: 0.5, hot: false }; // dim
  return { fill: "#2A2F38", opacity: 0.6, hot: false }; // steel-soft
}

function fmtKb(n: number) {
  return n.toLocaleString("en-US");
}

export function BundleLab() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.25);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mode, setMode] = useState<"base" | "pr">("base");

  const hoveredMod = useMemo(() => MODULES.find((m) => m.id === hovered) ?? null, [hovered]);

  const readout = hoveredMod ? (
    <>
      <span className="text-bone">{hoveredMod.path}</span>
      {" — parsed "}
      <span className="text-bone">
        {fmtKb(hoveredMod.parsed + (mode === "pr" ? hoveredMod.delta : 0))} kB
      </span>
      {" · gzip "}
      <span className="text-bone">{hoveredMod.gzip} kB</span>
      {" · "}
      {((hoveredMod.parsed / TOTAL) * 100).toFixed(1)}% of bundle
      {mode === "pr" && hoveredMod.delta !== 0 && (
        <span className={hoveredMod.delta > 0 ? "text-halo" : "text-node"}>
          {" "}
          ({hoveredMod.delta > 0 ? "+" : "−"}
          {Math.abs(hoveredMod.delta)} kB this pr)
        </span>
      )}
    </>
  ) : mode === "pr" ? (
    <>
      {"12 modules · parsed "}
      <span className="text-bone">{fmtKb(TOTAL)} kB</span>
      {" → "}
      <span className="text-halo">
        {fmtKb(TOTAL + TOTAL_DELTA)} kB (+{TOTAL_DELTA})
      </span>
      {" · gzip 513 kB → 522 kB (+9)"}
    </>
  ) : (
    <>
      {"12 modules · parsed "}
      <span className="text-bone">{fmtKb(TOTAL)} kB</span>
      {" · gzip "}
      <span className="text-bone">{TOTAL_GZIP} kB</span>
      {" · hover a block to inspect"}
    </>
  );

  return (
    <section
      id="bundle"
      className="relative mx-auto w-full max-w-[1360px] scroll-mt-14 px-6 py-24 md:px-16 md:py-32"
    >
      <SectionHeader slug="bundle" title="Every kilobyte, on the record." />

      <LabPanel
        title="bundle treemap"
        sample="example-app@main · production build"
        readout={readout}
        controls={
          <span
            className="ml-2 inline-flex items-center gap-1"
            role="group"
            aria-label="compare mode"
          >
            {(["base", "pr"] as const).map((m) => (
              <button
                key={m}
                type="button"
                data-cursor="link"
                data-magnetic
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "hud rounded-[2px] border px-2 py-0.5 text-[9px] transition-colors duration-200",
                  mode === m
                    ? "border-halo/60 bg-halo-soft text-halo"
                    : "border-steel text-dim hover:text-ash",
                )}
              >
                {m === "base" ? "baseline" : "this pr"}
              </button>
            ))}
          </span>
        }
      >
        <div ref={ref} className="grid gap-0 md:grid-cols-[1fr_290px]">
          {/* treemap canvas */}
          <div className="relative h-[46vh] min-h-[340px] border-b border-steel md:h-[56vh] md:min-h-[420px] md:border-b-0 md:border-r">
            {MODULES.map((m, i) => {
              const b = bucket(m);
              const isHovered = hovered === m.id;
              const changed = mode === "pr" && m.delta !== 0;
              const dimmed = mode === "pr" && m.delta === 0;
              return (
                <motion.button
                  key={m.id}
                  type="button"
                  data-cursor="read"
                  aria-label={`${m.path} — ${m.parsed} kB`}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(m.id)}
                  onBlur={() => setHovered(null)}
                  initial={reduced ? false : { opacity: 0, scale: 0.92 }}
                  animate={
                    inView
                      ? {
                          opacity: isHovered ? 1 : dimmed ? b.opacity * 0.4 : b.opacity,
                          scale: isHovered && !reduced ? 1.04 : 1,
                        }
                      : {}
                  }
                  transition={{
                    opacity: {
                      duration: 0.3,
                      ease: EASE_COMPILE_OUT,
                      delay: reduced ? 0 : i * 0.05,
                    },
                    scale: { duration: 0.25, ease: EASE_COMPILE_OUT },
                  }}
                  style={{
                    left: `calc(${m.rect.x}% + 2px)`,
                    top: `calc(${m.rect.y}% + 2px)`,
                    width: `calc(${m.rect.w}% - 4px)`,
                    height: `calc(${m.rect.h}% - 4px)`,
                    backgroundColor: b.fill,
                    boxShadow: changed
                      ? "inset 0 0 0 1px #FFB43A, 0 0 18px rgba(255,180,58,0.22)"
                      : isHovered && b.hot
                        ? "0 0 24px rgba(255,180,58,0.28)"
                        : undefined,
                    zIndex: isHovered ? 10 : changed ? 5 : 1,
                  }}
                  className="absolute rounded-[2px] text-left"
                >
                  {/* in-block label (only where the rect can carry it) */}
                  {m.rect.w >= 12 && (
                    <span className="pointer-events-none absolute left-2 right-1.5 top-1.5 hidden sm:block">
                      <span
                        className={cn(
                          "micro block truncate",
                          m.parsed >= 120 ? "text-void/90" : "text-bone/70",
                        )}
                      >
                        {m.path}
                      </span>
                      {m.rect.h >= 40 && (
                        <span
                          className={cn(
                            "micro block",
                            m.parsed >= 120 ? "text-void/60" : "text-dim",
                          )}
                        >
                          {fmtKb(m.parsed)} kB
                        </span>
                      )}
                    </span>
                  )}
                  {/* PR delta tag */}
                  {changed && (
                    <span
                      className={cn(
                        "micro absolute bottom-1.5 right-2 rounded-[2px] bg-void/85 px-1 py-0.5",
                        m.delta > 0 ? "text-halo" : "text-node",
                      )}
                    >
                      {m.delta > 0 ? "+" : "−"}
                      {Math.abs(m.delta)}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* module table */}
          <div className="flex flex-col">
            <div className="micro flex items-center justify-between border-b border-steel px-4 py-2 text-dim">
              <span>module</span>
              <span>parsed · gzip</span>
            </div>
            <ul className="max-h-[300px] flex-1 overflow-y-auto md:max-h-none">
              {MODULES.map((m) => {
                const isHovered = hovered === m.id;
                const changed = mode === "pr" && m.delta !== 0;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      data-cursor="read"
                      onMouseEnter={() => setHovered(m.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(m.id)}
                      onBlur={() => setHovered(null)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 border-b border-steel/60 px-4 py-2 text-left font-mono text-[11px] transition-colors duration-150",
                        isHovered ? "bg-carbon-2 text-bone" : "text-ash",
                      )}
                    >
                      <span className="truncate">{m.path}</span>
                      <span className="flex shrink-0 items-center gap-2 tabular-nums">
                        {changed && (
                          <span className={m.delta > 0 ? "text-halo" : "text-node"}>
                            {m.delta > 0 ? "+" : "−"}
                            {Math.abs(m.delta)}
                          </span>
                        )}
                        <span className="text-dim">
                          {fmtKb(m.parsed)} · {m.gzip} kB
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="micro mt-auto px-4 py-2 text-dim">
              heat: block color scales with parsed size
            </div>
          </div>
        </div>
      </LabPanel>
    </section>
  );
}
