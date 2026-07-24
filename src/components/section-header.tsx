import { motion } from "framer-motion";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * SectionHeader: title (display-lg) with an optional badge. The single
 * section marker (`//` + rule + slug + rule, dashes rendered as DOM lines)
 * lives on the section-boundary rule rendered by each page — the header
 * renders no marker of its own, so a section never shows two. Animates:
 * title words rise 24px stagger 70ms.
 *
 * `index` / `subline` are accepted for call-site compatibility but no longer
 * rendered (leader numbers and serif sublines were removed).
 */
export function SectionHeader({
  title,
  badge,
  compact = false,
  start = true,
  mono = false,
  instant = false,
  className,
}: {
  /** @deprecated leader numbers removed — ignored */
  index?: string;
  /** @deprecated accepted for call-site compatibility — no longer rendered */
  slug?: string;
  title: string;
  /** @deprecated serif sublines removed — ignored */
  subline?: string;
  badge?: React.ReactNode;
  /** smaller title + tighter margin — for sections sharing the first screen */
  compact?: boolean;
  /** gate the reveal on an external trigger (e.g. after the hero intro) */
  start?: boolean;
  /** monospace title — for command-style headers (git log --graph …) */
  mono?: boolean;
  /** skip word-rise (already revealed this session / reduced motion) */
  instant?: boolean;
  className?: string;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.3);
  const reduced = useReducedMotion();
  const words = title.split(" ");
  const show = inView && start;
  const staticTitle = reduced || instant;

  return (
    <div className={cn(compact ? "mb-5" : "mb-12", className)}>
      <div ref={ref}>
        {badge && <div className="mb-4 flex items-center gap-3">{badge}</div>}
        <h2
          className={cn("font-bold text-bone", mono ? "font-mono" : "font-grotesk")}
          style={{
            fontSize: compact ? "clamp(24px, 3vw, 36px)" : "clamp(44px, 7vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          {staticTitle
            ? title
            : words.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: 24, opacity: 0 }}
                    animate={show ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.6, ease: EASE_COMPILE_OUT, delay: 0.15 + i * 0.07 }}
                  >
                    {w}
                  </motion.span>
                  {i < words.length - 1 && <span>&nbsp;</span>}
                </span>
              ))}
        </h2>
      </div>
    </div>
  );
}
