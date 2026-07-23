import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useToast } from "@/components/toaster";
import { useMotionPref } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Command Palette (design.md §8.3) — `~` or ⌘K / Ctrl+K opens; ESC closes.
 * Fuzzy-find with matched chars in halo. Fully keyboard navigable.
 * Open it from anywhere via `useCommandPalette().toggle()`.
 */

interface Cmd {
  id: string;
  group: string;
  label: string;
  /** renders a state toggle switch at the right side of the row */
  toggle?: boolean;
  run: () => void;
}

interface PaletteCtx {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const Ctx = createContext<PaletteCtx>({
  open: () => {},
  close: () => {},
  toggle: () => {},
  isOpen: false,
});

export function useCommandPalette() {
  return useContext(Ctx);
}

/** subsequence fuzzy match; returns matched indices or null */
function fuzzy(query: string, text: string): number[] | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const idx: number[] = [];
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      idx.push(ti);
      qi++;
    }
  }
  return qi === q.length ? idx : null;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const value = useMemo(() => ({ open, close, toggle, isOpen }), [open, close, toggle, isOpen]);

  // global keybinding
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.key === "`" || e.key === "~") && !typing) {
        e.preventDefault();
        toggle();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, close]);

  return createElement(
    Ctx.Provider,
    { value },
    <>
      {children}
      <PaletteOverlay />
    </>,
  );
}

function PaletteOverlay() {
  const { isOpen, close } = useContext(Ctx);
  const navigate = useNavigate();
  const toast = useToast();
  const { reduced, setOverride } = useMotionPref();

  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSel(0);
      // focus after open animation starts
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const go = useCallback(
    (path: string) => {
      close();
      void navigate(path);
    },
    [close, navigate],
  );

  const commands = useMemo<Cmd[]>(
    () => [
      { id: "open-home", group: "open", label: "open: Index", run: () => go("/") },
      { id: "open-napi", group: "open", label: "open: #[napi]", run: () => go("/napi") },
      { id: "open-affine", group: "open", label: "open: AFFiNE", run: () => go("/affine") },
      { id: "open-perfsee", group: "open", label: "open: Perfsee", run: () => go("/perfsee") },
      {
        id: "copy-email",
        group: "copy",
        label: "copy: email",
        run: async () => {
          try {
            await navigator.clipboard.writeText("contact@thatyii.dev");
            toast("✓ copied to clipboard");
          } catch {
            toast("✗ clipboard unavailable");
          }
          close();
        },
      },
      {
        id: "motion-toggle",
        group: "motion",
        label: "motion",
        toggle: true,
        run: () => {
          const next = reduced ? "full" : "reduced";
          setOverride(next);
          toast(`motion → ${next}`);
          close();
        },
      },
      {
        id: "theme-void",
        group: "theme",
        label: "theme: void",
        run: () => {
          toast("error[E0407]: light mode is not a member of trait Forge");
          close();
        },
      },
    ],
    [go, toast, reduced, setOverride, close],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands.map((c) => ({ cmd: c, match: null as number[] | null }));
    const out: { cmd: Cmd; match: number[] | null }[] = [];
    for (const c of commands) {
      const m = fuzzy(query, c.label);
      if (m) out.push({ cmd: c, match: m });
    }
    return out;
  }, [commands, query]);

  useEffect(() => setSel(0), [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(filtered.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[sel]?.cmd.run();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-9990 flex items-start justify-center bg-void/60 pt-[14vh] backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={close}
          role="dialog"
          aria-modal="true"
          aria-label="command palette"
        >
          <motion.div
            className="w-[min(560px,92vw)] overflow-hidden rounded-[3px] border border-steel bg-carbon-2 shadow-halo-glow"
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.2, ease: EASE_COMPILE_OUT }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* input */}
            <div className="flex items-center gap-2 border-b border-steel px-4 py-3">
              <span className="font-mono text-[13px] text-halo">❯</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="type a command… (open / copy / motion / theme)"
                className="w-full bg-transparent font-mono text-[13px] text-bone placeholder:text-dim focus:outline-hidden"
                aria-label="command input"
              />
              <kbd className="micro rounded-[2px] border border-steel px-1.5 py-0.5 text-dim">
                esc
              </kbd>
            </div>

            <ul className="max-h-[46vh] overflow-y-auto py-2" role="listbox">
              {filtered.length === 0 && (
                <li className="px-4 py-3 font-mono text-[12px] text-dim">
                  no matching symbols — try `open`
                </li>
              )}
              {filtered.map(({ cmd, match }, i) => (
                <li key={cmd.id} role="option" aria-selected={i === sel}>
                  <button
                    className={cn(
                      "flex w-full items-baseline justify-between gap-4 px-4 py-2 text-left font-mono text-[12px] transition-colors",
                      i === sel ? "bg-halo-soft text-bone" : "text-ash hover:bg-halo-soft/50",
                    )}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => cmd.run()}
                    data-cursor="link"
                  >
                    <span>
                      <Highlighted text={cmd.label} match={match} />
                    </span>
                    {cmd.toggle && (
                      <span
                        aria-hidden
                        className={cn(
                          "relative h-4 w-7 shrink-0 rounded-full border transition-colors",
                          reduced ? "border-halo bg-halo-soft" : "border-steel bg-carbon",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full transition-all",
                            reduced ? "left-[calc(100%-0.875rem)] bg-halo" : "left-0.5 bg-dim",
                          )}
                        />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-steel px-4 py-2">
              <span className="micro text-dim">↑↓ navigate · ↵ run · esc close</span>
              <span className="micro text-dim">Yii</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Highlighted({ text, match }: { text: string; match: number[] | null }) {
  if (!match) return <>{text}</>;
  const set = new Set(match);
  return (
    <>
      {text.split("").map((ch, i) => (
        <span key={i} className={set.has(i) ? "text-halo" : undefined}>
          {ch}
        </span>
      ))}
    </>
  );
}
