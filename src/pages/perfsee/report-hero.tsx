import { motion } from "framer-motion";
import { CompilePrint } from "@/components/motion/compile-print";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { PROJECTS, formatStars } from "@/lib/projects";
import { EASE_COMPILE_OUT } from "@/lib/motion";

/**
 * P1 · Report hero — the page opens as the cover of an analysis report.
 * A carbon report sheet: mono report chrome (target / branch / job), the
 * PERFSEE wordmark set as a measured artifact, and a fact grid
 * (role, org, era, stars, language). Star count comes from the shared
 * registry (projects.md §data) — never hardcoded.
 */

/** the registry entry behind this report */
const PERFSEE = PROJECTS.find((p) => p.page === "/perfsee");

const FACTS: { k: string; v: string; accent?: boolean }[] = [
  { k: "role", v: "creator · leader" },
  { k: "org", v: "ByteDance" },
  { k: "era", v: "2020–2023" },
  // this report renders the star after the number ("744★") — formatStars
  // prefixes it, so strip the prefix and re-add the star at the end
  { k: "stars", v: `${formatStars(PERFSEE?.stars ?? 0).slice(1)}★`, accent: true },
  { k: "language", v: "TypeScript · Rust" },
];

export function ReportHero() {
  const reduced = useReducedMotion();

  return (
    <section
      id="report"
      className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[1360px] scroll-mt-14 flex-col justify-center px-6 py-16 md:px-16"
    >
      {/* the report sheet */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_COMPILE_OUT }}
        className="relative rounded-[3px] border border-steel bg-carbon"
      >
        {/* report chrome */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-steel px-5 py-2.5 md:px-8">
          <span className="hud text-[10px] text-halo">analysis report</span>
          <span className="micro text-dim">target: example-app</span>
          <span className="micro text-dim">branch: main</span>
          <span className="micro text-dim">job #58132</span>
          <span className="micro ml-auto text-dim">self-hosted · ci artifact</span>
        </div>

        <div className="relative px-5 py-10 md:px-8 md:py-14">
          {/* wordmark */}
          <h1 className="font-grotesk font-bold uppercase leading-[0.92] tracking-[-0.03em] text-bone">
            <span className="block text-[clamp(56px,11vw,150px)]">Perfsee</span>
          </h1>
          <CompilePrint
            as="p"
            text="frontend performance analysis platform — three instruments follow: treemap · flamegraph · score dial. illustrative data, real story."
            stagger={0.03}
            delay={reduced ? 0 : 0.35}
            className="mt-5 font-mono text-[13px] text-ash md:text-[15px]"
          />

          {/* fact grid */}
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-steel bg-steel sm:grid-cols-3 lg:grid-cols-5">
            {FACTS.map((f, i) => (
              <motion.div
                key={f.k}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_COMPILE_OUT, delay: 0.5 + i * 0.06 }}
                className="bg-carbon px-4 py-3"
              >
                <dt className="micro text-dim">{f.k}</dt>
                <dd
                  className={`mt-1 font-mono text-[13px] ${f.accent ? "text-halo" : "text-bone"}`}
                >
                  {f.v}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </motion.div>
    </section>
  );
}
