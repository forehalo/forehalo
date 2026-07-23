import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";

/** Minimal mono-styled toast (design system flavored). `toast("✓ …")`. */
const ToastCtx = createContext<(msg: string) => void>(() => {});

let idSeq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  const timers = useRef<number[]>([]);

  const push = useCallback((msg: string) => {
    const id = ++idSeq;
    setItems((xs) => [...xs.slice(-2), { id, msg }]);
    const t = window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 2600);
    timers.current.push(t);
  }, []);

  return createElement(
    ToastCtx.Provider,
    { value: push },
    <>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-10000 flex flex-col items-end gap-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: EASE_COMPILE_OUT }}
              className="rounded-[2px] border border-steel bg-carbon-2 px-3 py-2 font-mono text-[12px] text-bone shadow-halo-glow"
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>,
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
