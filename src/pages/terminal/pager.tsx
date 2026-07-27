import { useEffect } from "react";
import { useNavigate } from "react-router";
import { TERMINAL_HOME_PATH } from "@/lib/routes";

/**
 * Pager — less(1)/man(1) behavior for the /terminal info docs
 * (terminal.md §pager): `j` / `k` scroll the TerminalWindow scroll slot one
 * line down / up, `q` quits back to the shell (/terminal). Scrolling is
 * instant — a pager has no tween, which also satisfies reduced motion
 * (design.md §9). Keys are ignored while a modifier is held or while typing
 * in a field (the docs render none, but stay safe).
 */

/** one doc line: text-[12px] × leading-[1.9] ≈ 23px */
const LINE_PX = 24;

/** the TerminalWindow content slot owns scrolling for every fork page */
function scrollSlot(): HTMLElement | null {
  return document.getElementById("main");
}

export function usePager() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      if (e.key === "j") {
        scrollSlot()?.scrollBy({ top: LINE_PX, behavior: "auto" });
      } else if (e.key === "k") {
        scrollSlot()?.scrollBy({ top: -LINE_PX, behavior: "auto" });
      } else if (e.key === "q") {
        void navigate(TERMINAL_HOME_PATH);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);
}

/** less(1)-style status line printed at the bottom of a paged doc */
export function PagerHint() {
  return (
    <div aria-hidden className="mt-8 border-t border-steel pt-2 text-[11px] text-dim">
      j/k scroll · q quit
    </div>
  );
}
