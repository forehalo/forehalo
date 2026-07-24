import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { SectionHeader } from "@/components/section-header";
import { LabPanel } from "@/pages/perfsee/lab-panel";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { readCssToken } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * P3 · Flame lab — a CI build drawn as a flamegraph, full panel width.
 * Frames heat ash → halo → rust as the cursor sweeps the timeline; hovering
 * a frame reads out self/total time. Frames are a webpack production build
 * of the example app — illustrative.
 */

const BUILD_MS = 6540;

interface Frame {
  x: number;
  w: number;
  label: string;
  self: number;
}

const ROWS: Frame[][] = [
  [{ x: 0, w: 100, label: "webpack production build", self: 12 }],
  [
    { x: 0, w: 44, label: "make · module graph", self: 140 },
    { x: 44, w: 34, label: "seal · chunk graph", self: 96 },
    { x: 78, w: 22, label: "emit · assets", self: 58 },
  ],
  [
    { x: 0, w: 8, label: "resolve loaders", self: 512 },
    { x: 8, w: 36, label: "build modules", self: 74 },
    { x: 44, w: 14, label: "create chunks", self: 388 },
    { x: 58, w: 20, label: "optimize tree", self: 60 },
    { x: 78, w: 14, label: "render assets", self: 402 },
    { x: 92, w: 8, label: "write + hash", self: 486 },
  ],
  [
    { x: 8, w: 14, label: "ts-loader", self: 102 },
    { x: 22, w: 10, label: "css chain", self: 640 },
    { x: 32, w: 12, label: "swc transform", self: 705 },
    { x: 58, w: 10, label: "split chunks", self: 433 },
    { x: 68, w: 10, label: "minimize · terser", self: 118 },
    { x: 78, w: 9, label: "source maps", self: 466 },
    { x: 87, w: 5, label: "compress", self: 318 },
  ],
  [
    { x: 8, w: 8, label: "type check", self: 66 },
    { x: 16, w: 6, label: "transpile", self: 384 },
    { x: 68, w: 6, label: "mangle", self: 287 },
    { x: 74, w: 4, label: "compress", self: 189 },
  ],
  [
    { x: 8, w: 5, label: "fork-ts-checker", self: 244 },
    { x: 13, w: 3, label: "cache restore", self: 152 },
  ],
];

/* ── heat color: continuous ash → halo → rust by cursor proximity ─────── */
function parseColor(c: string): [number, number, number] {
  const hex = c.trim();
  if (hex.startsWith("#") && hex.length >= 7) {
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  }
  const m = hex.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return [0, 0, 0];
}

function colorLerp(a: string, b: string, t: number): string {
  const pa = parseColor(a);
  const pb = parseColor(b);
  const m = pa.map((v, i) => Math.round(v + (pb[i]! - v) * t));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

function heat(f: number): string {
  const ash = readCssToken("--ash", "#8B9098");
  const halo = readCssToken("--halo", "#FFB43A");
  const rust = readCssToken("--rust", "#FF5C28");
  if (f <= 0) return ash;
  if (f < 0.55) return colorLerp(ash, halo, f / 0.55);
  return colorLerp(halo, rust, (f - 0.55) / 0.45);
}

export function FlameLab() {
  const reduced = useReducedMotion();
  // re-read forge tokens when theme class flips
  useTheme();
  const { ref: viewRef, inView } = useInViewOnce<HTMLDivElement>(0.25);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [mx, setMx] = useState<number | null>(null);
  const [hovered, setHovered] = useState<Frame | null>(null);

  const readout = hovered ? (
    <>
      <span className="text-bone">{hovered.label}</span>
      {" — self "}
      <span className="text-bone">{hovered.self} ms</span>
      {" · total "}
      <span className="text-bone">{Math.round(hovered.w * (BUILD_MS / 100))} ms</span>
      {" · "}
      {hovered.w.toFixed(1)}% of build
    </>
  ) : (
    <>
      {"root at the bottom · "}
      <span className="text-bone">{(BUILD_MS / 1000).toFixed(2)} s</span>
      {" total · 6 frames deep · sweep the cursor to heat the stack"}
    </>
  );

  return (
    <section
      id="flame"
      className="relative mx-auto w-full max-w-[1360px] scroll-mt-14 px-6 py-24 md:px-16 md:py-32"
    >
      <SectionHeader slug="flame" title="Where the build hours go." />

      <LabPanel
        title="flamegraph"
        sample="ci job #58132 · webpack production build"
        readout={readout}
      >
        <div ref={viewRef} className="px-4 py-5 md:px-6">
          {/* time axis */}
          <div aria-hidden className="relative mb-3 h-4">
            {[0, 1000, 2000, 3000, 4000, 5000, 6000].map((ms) => (
              <span
                key={ms}
                className="micro absolute top-0 -translate-x-1/2 text-dim"
                style={{ left: `${(ms / BUILD_MS) * 100}%` }}
              >
                {ms === 0 ? "0" : `${ms / 1000}s`}
              </span>
            ))}
            <span className="micro absolute right-0 top-0 text-dim">
              {(BUILD_MS / 1000).toFixed(2)}s
            </span>
          </div>

          {/* frames — root row sits at the bottom */}
          <div
            ref={trackRef}
            className="flex flex-col-reverse justify-start gap-[3px]"
            onMouseMove={(e) => {
              if (reduced) return;
              const r = trackRef.current?.getBoundingClientRect();
              if (r) setMx(((e.clientX - r.left) / r.width) * 100);
            }}
            onMouseLeave={() => {
              setMx(null);
              setHovered(null);
            }}
          >
            {ROWS.map((row, ri) => (
              <div key={ri} className="relative h-9 w-full">
                {row.map((f, fi) => {
                  const center = f.x + f.w / 2;
                  const f1 = mx === null ? 0 : Math.max(0, 1 - Math.abs(center - mx) / 28);
                  const isHovered = hovered === f;
                  const heatF = isHovered ? 1 : f1;
                  return (
                    <motion.button
                      key={fi}
                      type="button"
                      data-cursor="read"
                      aria-label={`${f.label} — total ${Math.round(f.w * (BUILD_MS / 100))} ms`}
                      onMouseEnter={() => setHovered(f)}
                      onFocus={() => setHovered(f)}
                      onBlur={() => setHovered(null)}
                      initial={reduced ? false : { scaleX: 0 }}
                      animate={!reduced && inView ? { scaleX: 1 } : {}}
                      transition={{
                        duration: 0.7,
                        ease: EASE_COMPILE_OUT,
                        delay: ri * 0.09 + fi * 0.02,
                      }}
                      style={{
                        left: `${f.x}%`,
                        width: `calc(${f.w}% - 2px)`,
                        transformOrigin: "left",
                        backgroundColor: reduced ? readCssToken("--ash", "#8B9098") : heat(heatF),
                        opacity: reduced ? 0.42 : 0.32 + heatF * 0.68,
                      }}
                      className={cn(
                        "absolute top-0 h-full rounded-[1px] text-left",
                        !reduced && "transition-[background-color] duration-200",
                        isHovered && "z-10 outline-solid outline-1 outline-bone/40",
                      )}
                    >
                      {f.w >= 6 && (
                        <span
                          className={cn(
                            "micro pointer-events-none absolute left-1.5 top-1/2 block max-w-[95%] -translate-y-1/2 truncate",
                            heatF > 0.5 && !reduced ? "text-void" : "text-bone/70",
                          )}
                        >
                          {f.label}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </LabPanel>
    </section>
  );
}
