import { motion } from "framer-motion";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { ArrowUpRight } from "lucide-react";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";

/**
 * P5 · Legacy — the report's last page. One simple statement: the project
 * has been integrated into rsdoctor. Repo links close the lab.
 */

const REPO_LINK_CLS =
  "inline-flex items-center gap-1.5 font-mono text-[12px] text-ash transition-colors hover:text-halo";

export function LegacyOutro() {
  const { ref, inView } = useInViewOnce<HTMLElement>(0.4);
  const reduced = useReducedMotion();

  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.5, ease: EASE_COMPILE_OUT, delay },
  });

  return (
    <section
      ref={ref}
      id="legacy"
      className="relative mx-auto flex min-h-[70vh] w-full max-w-[1360px] scroll-mt-14 flex-col items-center justify-center px-6 py-24 text-center md:px-16"
    >
      <motion.p
        {...rise(0.15)}
        className="mt-6 max-w-[560px] font-grotesk text-[16px] leading-[1.7] text-bone/80 md:text-[18px]"
      >
        The project has been integrated into{" "}
        <a
          href="https://github.com/web-infra-dev/rsdoctor"
          target="_blank"
          rel="noreferrer"
          data-cursor="link"
          className="text-halo underline decoration-steel-soft underline-offset-4 transition-colors hover:decoration-halo"
        >
          rsdoctor
        </a>{" "}
        — the measurement lives on inside the next toolchain.
      </motion.p>

      {/* repo links */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        <motion.div {...rise(0.44)}>
          <a
            href="https://github.com/bytedance/perfsee"
            target="_blank"
            rel="noreferrer"
            data-cursor="link"
            className={REPO_LINK_CLS}
          >
            <SiGithub size={12} aria-hidden />
            bytedance/perfsee
            <ArrowUpRight size={12} aria-hidden />
          </a>
        </motion.div>
        <motion.div {...rise(0.52)}>
          <a
            href="https://github.com/web-infra-dev/rsdoctor"
            target="_blank"
            rel="noreferrer"
            data-cursor="link"
            className={REPO_LINK_CLS}
          >
            <SiGithub size={12} aria-hidden />
            web-infra-dev/rsdoctor
            <ArrowUpRight size={12} aria-hidden />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
