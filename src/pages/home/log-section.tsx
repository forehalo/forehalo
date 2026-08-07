import { MacroExpand } from "@/components/motion/macro-expand";
import { SectionHeader } from "@/components/section-header";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router";
import { COMMITS, type LogCommit } from "@/pages/home/log-data";

/**
 * Home §2 · The Log — the career as `git log --graph --author="Yii"`.
 *
 * Two lanes, rendered as a real graph gutter (design.md §14 data, newest
 * first, every fact verified):
 *
 *   ● main    (x≈14px, steel line, halo dots) — the companies: one2x (HEAD),
 *             toeverything, bytedance, leetcode, netcircle, root commit.
 *   ○ branch  (x≈36px, rust line + dots)     — the open source lane: vite-plus
 *             (newest) and napi-rs, forked out of the ByteDance era (57b2aa1
 *             draws the diagonal merge) and still active — the lane runs
 *             flush to the top edge of the log.
 *
 * The gutter is plain absolutely-positioned divs (w-px line segments +
 * 8px dots at ~top 17px, optically centered on the commit's first text
 * line) plus one tiny inline SVG for the fork diagonal — no big SVG, so
 * lane lines stretch seamlessly when a row's macroExpand grows the row.
 * Hover/click a row → macroExpand unfolds the diff panel full-width
 * (under the gutter), its content indented to the commit column.
 * (Expansion grows the page downward only — home pins its vertical
 * centering to the collapsed height, so unfolding never re-centers
 * the page under the cursor.)
 *
 * Commit rows live in `log-data.ts` (shared with the receipt invoice).
 */

/* lane geometry — main at x=14, branch (open source, rust) at x=36, dot center y=26 */
const MAIN_X = "left-[14px]";
const BRANCH_X = "left-[36px]";

/** hover-expansion is a mouse luxury: on touch, a tap fires mouseenter AND
 * click (open then instantly close). Gate hover handlers to fine pointers;
 * click-to-toggle works everywhere. */
const FINE_POINTER =
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function LogSection({
  start = true,
  skipReveal = false,
}: {
  start?: boolean;
  /** home intro already played (localStorage) — no stagger enter */
  skipReveal?: boolean;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.15);
  const [open, setOpen] = useState<number | null>(null);
  const show = skipReveal || (inView && start);

  return (
    <section
      id="log"
      className="relative mx-auto w-full max-w-[1360px] scroll-mt-20 px-6 pt-6 pb-10 md:px-16 md:pt-8 md:pb-12"
    >
      <SectionHeader
        slug="log"
        title={'git log --graph --author="Yii"'}
        compact
        mono
        start={start}
        instant={skipReveal}
      />

      <motion.div
        ref={ref}
        initial={skipReveal ? false : "hidden"}
        animate={show ? "show" : "hidden"}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: skipReveal ? 0 : 0.06 },
          },
        }}
        className="overflow-hidden rounded-[3px] border border-steel bg-carbon"
      >
        {COMMITS.map((c, i) => (
          <div
            key={c.sha}
            onMouseLeave={() => FINE_POINTER && setOpen(null)}
            className={cn("relative", i > 0 && "border-t border-steel")}
          >
            <GraphGutter c={c} />
            <motion.button
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: skipReveal
                    ? { duration: 0 }
                    : { duration: 0.45, ease: EASE_COMPILE_OUT },
                },
              }}
              onClick={() => setOpen((cur) => (cur === i ? null : i))}
              onMouseEnter={() => FINE_POINTER && setOpen(i)}
              data-cursor="expand"
              aria-expanded={open === i}
              className={cn(
                "flex w-full flex-wrap items-baseline gap-x-4 gap-y-1 py-3 pl-[68px] pr-4 text-left transition-colors md:pr-6",
                "hover:bg-carbon-2",
              )}
            >
              <span className="inline-flex items-center gap-2 font-mono text-[13px] text-halo">
                {c.sha}
                {c.head && <span className="micro text-wasi-cyan">HEAD → main</span>}
              </span>
              {/* mobile: one consistent 3-line structure — sha+date / message /
                  tags+stars — instead of ragged wraps (md+: single line) */}
              <span className="min-w-0 flex-1 font-mono text-[13px] text-bone/90 max-md:order-3 max-md:basis-full md:truncate">
                <CommitMessage message={c.message} />
              </span>
              <span className="flex gap-1.5 max-md:order-4">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="micro rounded-[2px] border border-steel-soft px-1.5 py-0.5 text-ash"
                  >
                    [{t}]
                  </span>
                ))}
              </span>
            </motion.button>
            <MacroExpand open={open === i}>
              <div className="border-t border-dashed border-steel-soft bg-void py-3 pl-[68px] pr-6">
                {/* the era lives in the details, not the row */}
                <div className="micro mb-2 text-dim">{c.date}</div>
                <div className="font-mono text-[12px] leading-relaxed">
                  {c.diff.map((line, j) => (
                    <div key={j} className={line.startsWith("-") ? "text-danger" : "text-node"}>
                      {line}
                    </div>
                  ))}
                </div>
                {/* org link + facts + story link as plain content — no chips */}
                {(c.link || (c.facts?.length ?? 0) > 0 || c.linkChip) && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[12px]">
                    {c.link && (
                      <a
                        href={c.link.href}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="link"
                        className="text-halo transition-colors duration-200 hover:text-bone"
                      >
                        {c.link.label}
                      </a>
                    )}
                    {c.facts?.map((f) =>
                      f.href ? (
                        <a
                          key={f.label}
                          href={f.href}
                          target="_blank"
                          rel="noreferrer"
                          data-cursor="link"
                          className="text-halo transition-colors duration-200 hover:text-bone"
                        >
                          {f.label}
                        </a>
                      ) : (
                        <span key={f.label} className="text-ash">
                          {f.label}
                        </span>
                      ),
                    )}
                    {c.linkChip && (
                      <Link
                        to={c.linkChip.to}
                        data-cursor="link"
                        className="text-halo transition-colors duration-200 hover:text-bone"
                      >
                        Read More →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </MacroExpand>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── graph gutter: per-row lane segments (lines stretch with macroExpand) ── */
function GraphGutter({ c }: { c: LogCommit }) {
  const branch = c.lane === "branch";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14">
      {/* main lane line — HEAD: dot down · root: top to dot · else full height */}
      <span
        className={cn(
          "absolute w-px bg-steel-soft",
          MAIN_X,
          c.head ? "bottom-0 top-[25px]" : c.root ? "top-0 h-[17px]" : "inset-y-0",
        )}
      />
      {/* branch lane (rust) — fork row draws the diagonal merge, no line below */}
      {c.fork ? (
        <svg
          className={cn("absolute top-0", MAIN_X)}
          width="23"
          height="22"
          viewBox="0 0 23 22"
          fill="none"
        >
          <path
            d="M22.5 0 V8 L0.5 20"
            stroke="var(--color-rust)"
            strokeOpacity="0.6"
            strokeWidth="1"
          />
        </svg>
      ) : (
        c.branchLane && <span className={cn("absolute inset-y-0 w-px bg-rust/60", BRANCH_X)} />
      )}
      {/* the commit dot on its lane */}
      <span
        className={cn(
          "absolute top-[17px] h-2 w-2 rounded-full",
          branch ? "left-[32px] bg-rust" : "left-[10px] bg-halo",
        )}
      />
    </div>
  );
}

/* ── conventional-commit message: dim type · halo scope · glowing #[attr] ── */
function CommitMessage({ message }: { message: string }) {
  const m = message.match(/^(\w+)(\(([^)]+)\))?:\s(.*)$/);
  const type = m?.[1];
  const scope = m?.[3];
  const rest = m?.[4] ?? message;
  const parts = rest.split(/(#\[[^\]]+\])/g);
  return (
    <>
      {type && <span className="text-dim">{type}</span>}
      {scope && <span className="text-halo">({scope})</span>}
      {type && <span className="text-dim">: </span>}
      {parts.map((p, i) =>
        p.startsWith("#[") ? (
          <span key={i} className="text-halo [text-shadow:0_0_10px_rgba(255,180,58,0.45)]">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
