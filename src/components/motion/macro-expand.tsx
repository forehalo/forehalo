import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_COMPILE_OUT, EASE_EXIT_IN } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * macroExpand (design.md §6): an annotated block unfolds — attribute line
 * flashes halo, then content height animates 0→auto with inner content fading
 * up 16px, stagger 60ms per child, 500ms total. Reverse on collapse.
 *
 * Controlled component: parent owns `open`. Children may be an array (each
 * child staggers) or a single node.
 */
export function MacroExpand({
  open,
  children,
  className,
  stagger = 0.06,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return open ? <div className={className}>{children}</div> : null;
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="macro-expand"
          className={className}
          style={{ overflow: "hidden" }}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: { duration: 0.5, ease: EASE_COMPILE_OUT },
          }}
          exit={{ height: 0, opacity: 0, transition: { duration: 0.35, ease: EASE_EXIT_IN } }}
        >
          <motion.div
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: stagger, delayChildren: 0.08 } },
            }}
          >
            {(Array.isArray(children) ? children : [children]).map((child, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_COMPILE_OUT } },
                }}
              >
                {child}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
