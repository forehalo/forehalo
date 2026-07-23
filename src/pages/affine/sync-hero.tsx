import { motion } from "framer-motion";
import { CollabDoc } from "@/pages/affine/collab-doc";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";

/**
 * A6 · Sync — "many cursors, one document" (id: sync, was Y1 on /y-octo).
 * A mid-page section (merged from the retired /y-octo page — no longer a
 * 100vh hero): the display claim "Many cursors. One document. Zero
 * conflicts." — then the live multi-cursor document, bigger and more alive
 * than its home-page cameo. Reduced motion: everything static.
 */

const TITLE_LINES: { words: { t: string; halo?: boolean }[] }[] = [
  { words: [{ t: "Many" }, { t: "cursors." }] },
  { words: [{ t: "One" }, { t: "document." }] },
  {
    words: [
      { t: "Zero", halo: true },
      { t: "conflicts.", halo: true },
    ],
  },
];

export function SyncHero() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.1);

  let wordIdx = 0;
  return (
    <section
      id="sync"
      className="relative mx-auto max-w-[1360px] scroll-mt-14 overflow-hidden px-6 py-24 md:px-16 md:py-32"
    >
      <div ref={ref} className="w-full">
        {/* display title — word rise, "zero conflicts" in halo (h2: CanvasHero owns the page h1) */}
        <h2
          className="font-grotesk font-bold text-bone"
          style={{
            fontSize: "clamp(40px, 7.5vw, 104px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          {TITLE_LINES.map((line, li) => (
            <span key={li} className="block">
              {line.words.map((w) => {
                const d = 0.15 + wordIdx++ * 0.07;
                return (
                  <span key={w.t} className="inline-block overflow-hidden pb-1 align-bottom">
                    <motion.span
                      className={w.halo ? "inline-block text-halo" : "inline-block"}
                      initial={reduced ? false : { y: 26, opacity: 0 }}
                      animate={inView ? { y: 0, opacity: 1 } : {}}
                      transition={{ duration: 0.6, ease: EASE_COMPILE_OUT, delay: d }}
                    >
                      {w.t}
                    </motion.span>
                    <span>&nbsp;</span>
                  </span>
                );
              })}
            </span>
          ))}
        </h2>

        {/* the claim, in prose */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE_COMPILE_OUT, delay: 0.6 }}
          className="mt-8 max-w-2xl font-mono text-[13px] leading-relaxed text-ash"
        >
          y-octo is a Yjs-compatible CRDT rewritten in Rust — written at AFFiNE, then wired back
          into AFFiNE as its collaboration engine. CRDTs let many collaborators merge edits without
          a central referee. Watch:
        </motion.p>

        {/* the exhibit */}
        <div className="mt-10 w-full max-w-[920px]">
          <CollabDoc />
        </div>
      </div>
    </section>
  );
}
