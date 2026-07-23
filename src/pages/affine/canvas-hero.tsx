import { motion } from "framer-motion";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { ArrowUpRight } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";

/**
 * A1 · Hero — "the knowledge canvas" (id: canvas).
 * AFFiNE set huge over the surface it is made of: a dot-grid canvas fading
 * into the void. The 70.6k★ count-up is the scale moment; the repo link
 * sits right under the description.
 */

const TITLE = "AFFiNE";

export function CanvasHero() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLElement>(0.25);
  const stars = useCountUp(70.6, { start: inView, decimals: 1, duration: 1300 });

  return (
    <section
      ref={ref}
      id="canvas"
      className="relative -mt-14 flex min-h-dvh flex-col justify-center overflow-hidden px-6 pt-14 md:px-16"
    >
      {/* the canvas beneath everything — dot grid fading into the void */}
      <div
        aria-hidden
        className="affine-dotgrid absolute inset-0 opacity-45 mask-[radial-gradient(ellipse_70%_60%_at_50%_45%,black_25%,transparent_78%)]"
      />

      <div className="relative mx-auto w-full max-w-[1360px]">
        <h1
          className="font-grotesk font-bold text-bone"
          style={{
            fontSize: "clamp(64px, 12vw, 168px)",
            lineHeight: 0.92,
            letterSpacing: "-0.03em",
          }}
          aria-label="AFFiNE"
        >
          {reduced
            ? TITLE
            : TITLE.split("").map((ch, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="inline-block overflow-hidden pb-1 align-bottom"
                >
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%" }}
                    animate={inView ? { y: 0 } : {}}
                    transition={{ duration: 0.7, ease: EASE_COMPILE_OUT, delay: 0.1 + i * 0.05 }}
                  >
                    {ch}
                  </motion.span>
                </span>
              ))}
        </h1>

        <motion.p
          className="mt-8 max-w-2xl text-[17px] leading-relaxed text-bone/80"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE_COMPILE_OUT, delay: 0.45 }}
        >
          An open-source knowledge OS — the Notion/Miro alternative where every page is blocks.
          Write it as a doc, flip it into an edgeless whiteboard, sync it live with your team.
          Local-first, CRDT to the core.
        </motion.p>

        {/* the scale moment */}
        <motion.div
          className="mt-12"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE_COMPILE_OUT, delay: 0.6 }}
        >
          <p
            className="font-mono font-bold tabular-nums text-halo"
            style={{ fontSize: "clamp(44px, 7vw, 88px)", lineHeight: 1 }}
          >
            {stars}k<span className="align-top text-[0.5em]">★</span>
          </p>
        </motion.div>

        {/* repo link */}
        <motion.div
          className="mt-6"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: EASE_COMPILE_OUT, delay: 0.7 }}
        >
          <a
            href="https://github.com/toeverything/AFFiNE"
            target="_blank"
            rel="noreferrer"
            data-cursor="link"
            className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ash transition-colors hover:text-halo"
          >
            <SiGithub size={12} aria-hidden />
            toeverything/AFFiNE
            <ArrowUpRight size={12} aria-hidden />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
