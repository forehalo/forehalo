import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * LabPanel — the shared instrument chrome for the /perfsee measurement lab.
 * A carbon panel with a mono header strip (instrument name · sample id ·
 * `demo replay`), the instrument body, and a live readout strip at the
 * bottom that children drive through `readout`.
 */
export function LabPanel({
  title,
  sample,
  readout,
  children,
  className,
  controls,
}: {
  /** instrument name, e.g. "bundle treemap" */
  title: string;
  /** sample identifier shown on the right of the header */
  sample: string;
  /** live readout line rendered in the footer strip */
  readout: ReactNode;
  /** optional interactive controls rendered in the header */
  controls?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.18);
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE_COMPILE_OUT }}
      className={cn(
        "relative overflow-hidden rounded-[3px] border border-steel bg-carbon",
        className,
      )}
    >
      {/* header strip */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-steel px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-halo" />
          <span className="hud text-[10px] text-ash">{title}</span>
          {controls}
        </div>
        <div className="flex items-center gap-3">
          <span className="micro text-dim">{sample}</span>
          <span className="micro rounded-[2px] border border-steel px-1.5 py-0.5 text-dim">
            demo replay
          </span>
        </div>
      </div>

      {/* instrument body */}
      {children}

      {/* readout strip */}
      <div className="flex min-h-9 items-center border-t border-steel px-4 py-2">
        <span className="micro text-ash">{readout}</span>
      </div>
    </motion.div>
  );
}
