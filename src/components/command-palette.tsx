import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { useToast } from "@/components/toaster";
import { useMotionPref } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import type { ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Command Palette (design.md §8.3) — `~` or ⌘K / Ctrl+K opens; ESC closes.
 * Fuzzy-find with matched chars in halo. Fully keyboard navigable.
 * Open it from anywhere via `useCommandPalette().toggle()`.
 */

const THEME_OPTIONS = ["system", "light", "dark"] as const satisfies readonly ThemePreference[];

interface Cmd {
  id: string;
  group: string;
  label: string;
  /** extra tokens for fuzzy match (e.g. theme aliases) */
  search?: string;
  /** renders a state toggle switch at the right side of the row */
  toggle?: boolean;
  /** three-part theme slide switch (system / light / dark) */
  themeSwitch?: boolean;
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
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSel(0);
      // focus after open animation starts
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  // Lock page scroll while open without Lenis.stop() — Lenis preventDefaults
  // every wheel while stopped, which also freezes the palette list. Instead:
  // capture wheel, scroll the list ourselves, and never let the event reach
  // Lenis / the document.
  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const list = listRef.current;
      if (!list || !list.contains(e.target as Node)) return;
      // Normalize line/page deltas so mouse wheels still move the list.
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= list.clientHeight;
      list.scrollTop += dy;
    };

    const onTouchMove = (e: TouchEvent) => {
      const list = listRef.current;
      if (list && list.contains(e.target as Node)) return;
      e.preventDefault();
    };

    // Capture so we run before Lenis's window wheel listener.
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
    };
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
      { id: "open-home", group: "open", label: "open: Home", run: () => go("/") },
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
        id: "theme",
        group: "theme",
        label: "theme",
        search: "theme system light dark appearance",
        themeSwitch: true,
        run: () => {
          // ↵ cycles system → light → dark (palette stays open)
          const cur = parseThemePref(theme);
          const i = THEME_OPTIONS.indexOf(cur);
          const next = THEME_OPTIONS[(i + 1) % THEME_OPTIONS.length] ?? "system";
          setTheme(next);
          toast(`theme → ${next}`);
        },
      },
    ],
    [go, toast, reduced, setOverride, close, setTheme, theme],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands.map((c) => ({ cmd: c, match: null as number[] | null }));
    const out: { cmd: Cmd; match: number[] | null }[] = [];
    for (const c of commands) {
      const m = fuzzy(query, c.label) ?? (c.search ? fuzzy(query, c.search) : null);
      // Prefer label-match indices for highlight; fall back to empty match for search-only hits.
      if (m) {
        const labelMatch = fuzzy(query, c.label);
        out.push({ cmd: c, match: labelMatch });
      }
    }
    return out;
  }, [commands, query]);

  useEffect(() => setSel(0), [query]);

  const applyTheme = useCallback(
    (next: ThemePreference) => {
      setTheme(next);
      toast(`theme → ${next}`);
    },
    [setTheme, toast],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    const active = filtered[sel]?.cmd;
    if (active?.themeSwitch && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      const cur = parseThemePref(theme);
      const i = THEME_OPTIONS.indexOf(cur);
      const next =
        e.key === "ArrowRight"
          ? (THEME_OPTIONS[(i + 1) % THEME_OPTIONS.length] ?? "system")
          : (THEME_OPTIONS[(i - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length] ?? "system");
      applyTheme(next);
      return;
    }
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

            <ul
              ref={listRef}
              className="max-h-[46vh] overflow-y-auto overscroll-contain py-2"
              role="listbox"
            >
              {filtered.length === 0 && (
                <li className="px-4 py-3 font-mono text-[12px] text-dim">
                  no matching symbols — try `open`
                </li>
              )}
              {filtered.map(({ cmd, match }, i) => (
                <li key={cmd.id} role="option" aria-selected={i === sel}>
                  <button
                    className={cn(
                      "flex w-full items-center justify-between gap-4 px-4 py-2 text-left font-mono text-[12px] transition-colors",
                      i === sel ? "bg-halo-soft text-bone" : "text-ash hover:bg-halo-soft/50",
                    )}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => cmd.run()}
                    data-cursor="link"
                  >
                    <span>
                      <Highlighted text={cmd.label} match={match} />
                      {cmd.themeSwitch && (
                        <span className="ml-2 text-dim">
                          · {parseThemePref(theme)}
                          {theme === "system" && resolvedTheme ? ` (${resolvedTheme})` : ""}
                        </span>
                      )}
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
                    {cmd.themeSwitch && (
                      <ThemeSlideSwitch
                        value={parseThemePref(theme)}
                        onChange={applyTheme}
                        reduced={reduced}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-steel px-4 py-2">
              <span className="micro text-dim">↑↓ navigate · ←→ theme · ↵ run · esc close</span>
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

function parseThemePref(theme: string | undefined): ThemePreference {
  if (theme === "light" || theme === "dark" || theme === "system") return theme;
  return "system";
}

/**
 * Three-part theme control: system · light · dark.
 * Sliding halo pill tracks the active segment with distance-aware spring motion.
 */
function ThemeSlideSwitch({
  value,
  onChange,
  reduced,
}: {
  value: ThemePreference;
  onChange: (v: ThemePreference) => void;
  reduced: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prevIndex = useRef(0);
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  const index = Math.max(0, THEME_OPTIONS.indexOf(value));

  const measure = useCallback(() => {
    const btn = btnRefs.current[index];
    const track = trackRef.current;
    if (!btn || !track) return;
    setPill({ left: btn.offsetLeft, width: btn.offsetWidth, ready: true });
  }, [index]);

  useLayoutEffect(() => {
    measure();
  }, [measure, value]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure]);

  const dist = Math.abs(index - prevIndex.current);
  useEffect(() => {
    prevIndex.current = index;
  }, [index]);

  // Far jumps (system ↔ dark) get a longer, softer glide; adjacent hops snap tighter.
  const spring = reduced
    ? { duration: 0 }
    : {
        type: "spring" as const,
        stiffness: dist > 1 ? 260 : 520,
        damping: dist > 1 ? 26 : 36,
        mass: dist > 1 ? 0.7 : 0.45,
      };

  return (
    <div
      ref={trackRef}
      role="radiogroup"
      aria-label="theme preference"
      className="relative grid h-6 shrink-0 grid-cols-3 items-stretch rounded-[2px] border border-steel bg-carbon p-0.5"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {pill.ready && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-0.5 bottom-0.5 rounded-[1px] border border-halo/50 bg-halo-soft"
          initial={false}
          animate={{
            left: pill.left,
            width: pill.width,
            scale: dist > 1 ? [1, 0.96, 1] : 1,
          }}
          transition={spring}
        />
      )}
      {THEME_OPTIONS.map((opt, i) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            data-cursor="link"
            className={cn(
              "relative z-1 px-1.5 font-mono text-[10px] tracking-[0.04em] transition-colors duration-200",
              active ? "text-halo" : "text-dim hover:text-ash",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onChange(opt);
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
