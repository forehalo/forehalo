import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * compilePrint (design.md §6): text appears token-by-token (NOT a char-by-char
 * typewriter): each token blips in with a 2px rise + opacity 0→1, ~12ms/token
 * stagger. Used for code, labels, headlines' mono prefixes.
 *
 * Pass `tokens` to control splitting (code), or `text` (split on spaces).
 * `start` gates the animation (sequence sections after mount, etc).
 */
export function CompilePrint({
  text,
  tokens,
  delay = 0,
  stagger = 0.012,
  start = true,
  className,
  tokenClassName,
  as = "span",
}: {
  text?: string;
  tokens?: ReactNode[];
  delay?: number;
  stagger?: number;
  start?: boolean;
  className?: string;
  tokenClassName?: string;
  as?: "span" | "div" | "p";
}) {
  const reduced = useReducedMotion();
  const parts = useMemo<ReactNode[]>(() => {
    if (tokens) return tokens;
    if (!text) return [];
    // split on whitespace but keep the whitespace as its own tokens
    return text.split(/(\s+)/).filter((t) => t.length > 0);
  }, [text, tokens]);

  const Tag = as === "div" ? motion.div : as === "p" ? motion.p : motion.span;

  if (reduced) {
    return (
      <Tag className={className}>
        {parts.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      animate={start ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {parts.map((t, i) => (
        <motion.span
          key={i}
          className={tokenClassName}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          variants={{
            hidden: { opacity: 0, y: 2 },
            show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE_COMPILE_OUT } },
          }}
        >
          {t}
        </motion.span>
      ))}
    </Tag>
  );
}
