import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/section-header";
import { LabPanel } from "@/pages/perfsee/lab-panel";
import { useCountUp } from "@/hooks/use-count-up";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * P4 · Score lab — the lighthouse-style score, self-hosted. A 270° gauge
 * sweeps 0 → 98 (node green, countUp) ringed by gauge ticks; beside it the
 * four lab metrics hold their budgets. Hovering a metric reads its budget
 * line. Figures illustrative.
 */

const TARGET = 98;

const METRICS = [
  { k: "fcp", label: "first contentful paint", value: "0.9 s", budget: "≤ 1.8 s", pct: 50 },
  { k: "lcp", label: "largest contentful paint", value: "1.2 s", budget: "≤ 2.5 s", pct: 48 },
  { k: "tbt", label: "total blocking time", value: "120 ms", budget: "≤ 200 ms", pct: 60 },
  { k: "cls", label: "cumulative layout shift", value: "0.02", budget: "≤ 0.10", pct: 20 },
] as const;

export function ScoreLab() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.35);
  const score = Number(useCountUp(TARGET, { start: inView, duration: 1400 }));
  const [hovered, setHovered] = useState<(typeof METRICS)[number] | null>(null);

  // 270° gauge geometry
  const R = 100;
  const C = 2 * Math.PI * R;
  const ARC = 0.75;
  const p = Math.min(1, score / TARGET);

  // gauge ticks every 5 units, labels every 25 — spread across the 270° arc
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const value = i * 5;
    const angle = (135 + (value / 100) * 270) * (Math.PI / 180);
    const major = value % 25 === 0;
    return {
      value,
      angle,
      major,
      x1: 130 + Math.cos(angle) * (R - 14),
      y1: 130 + Math.sin(angle) * (R - 14),
      x2: 130 + Math.cos(angle) * (R - (major ? 24 : 19)),
      y2: 130 + Math.sin(angle) * (R - (major ? 24 : 19)),
    };
  });
  const tickLabels = [0, 25, 50, 75, 100].map((value) => {
    const angle = (135 + (value / 100) * 270) * (Math.PI / 180);
    return { value, x: 130 + Math.cos(angle) * (R - 36), y: 130 + Math.sin(angle) * (R - 36) };
  });

  const readout = hovered ? (
    <>
      <span className="text-bone">{hovered.k}</span>
      {" · "}
      <span className="text-bone">{hovered.value}</span>
      {" · budget "}
      {hovered.budget}
      {" · "}
      <span className="text-node">pass ✓</span>
    </>
  ) : (
    <>
      {"performance "}
      <span className="text-node">{Math.round(score)} / 100</span>
      {" · 4 of 4 budgets met · median of 5 runs · hover a metric"}
    </>
  );

  return (
    <section
      id="score"
      className="relative mx-auto w-full max-w-[1360px] scroll-mt-14 px-6 py-24 md:px-16 md:py-32"
    >
      <SectionHeader slug="score" title="One number to defend." />

      <LabPanel title="score dial" sample="example-app@main · mobile profile" readout={readout}>
        <div
          ref={ref}
          className="grid items-center gap-8 px-6 py-10 md:grid-cols-2 md:px-10 md:py-14"
        >
          {/* the gauge */}
          <div className="relative mx-auto w-full max-w-[340px]">
            <svg
              viewBox="0 0 260 260"
              className="w-full"
              role="img"
              aria-label={`performance score ${Math.round(score)} of 100`}
            >
              {/* ticks */}
              {ticks.map((t) => (
                <line
                  key={t.value}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.value <= p * 100 ? "var(--node)" : "var(--steel)"}
                  strokeWidth={t.major ? 2 : 1}
                  opacity={t.major ? 0.9 : 0.6}
                />
              ))}
              {/* track */}
              <circle
                cx="130"
                cy="130"
                r={R}
                fill="none"
                stroke="var(--steel)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${C * ARC} ${C}`}
                transform="rotate(135 130 130)"
              />
              {/* value arc — driven by the countUp value, no extra animation */}
              <circle
                cx="130"
                cy="130"
                r={R}
                fill="none"
                stroke="var(--node)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${C * ARC} ${C}`}
                strokeDashoffset={C * ARC * (1 - p)}
                transform="rotate(135 130 130)"
              />
              {tickLabels.map((t) => (
                <text
                  key={t.value}
                  x={t.x}
                  y={t.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--dim)"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {t.value}
                </text>
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="font-mono text-7xl font-bold tabular-nums text-node md:text-8xl">
                  {Math.round(score)}
                </div>
                <div className="micro mt-2 text-dim">performance</div>
              </div>
            </div>
          </div>

          {/* lab metrics */}
          <ul className="flex flex-col gap-4">
            {METRICS.map((m, i) => {
              const isHovered = hovered?.k === m.k;
              return (
                <li key={m.k}>
                  <button
                    type="button"
                    data-cursor="read"
                    onMouseEnter={() => setHovered(m)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(m)}
                    onBlur={() => setHovered(null)}
                    className={cn(
                      "w-full rounded-[2px] border px-4 py-3 text-left transition-colors duration-150",
                      isHovered ? "border-steel-soft bg-carbon-2" : "border-steel/70",
                    )}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="micro text-ash">{m.label}</span>
                      <span
                        className={cn(
                          "font-mono text-[13px] tabular-nums",
                          isHovered ? "text-bone" : "text-ash",
                        )}
                      >
                        {m.value}
                        <span className="ml-2 text-dim">{m.budget}</span>
                      </span>
                    </span>
                    <span className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-steel">
                      <motion.span
                        className="block h-full rounded-full bg-node"
                        initial={reduced ? false : { scaleX: 0 }}
                        animate={reduced || inView ? { scaleX: m.pct / 100 } : {}}
                        transition={{ duration: 0.8, ease: EASE_COMPILE_OUT, delay: 0.3 + i * 0.1 }}
                        style={{ transformOrigin: "left" }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="micro px-1 pt-1 text-dim">
              bars show share of budget consumed — green means headroom
            </li>
          </ul>
        </div>
      </LabPanel>
    </section>
  );
}
