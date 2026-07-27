import type { ReactNode } from "react";
import { useNavigate } from "react-router";

/**
 * TerminalWindow — the macOS window chrome of the /terminal fork
 * (terminal.md §window). Full viewport, void background, mono. The traffic
 * lights are literal macOS hexes (OS chrome, not theme tokens — the only
 * sanctioned hardcoded colors in the fork); red is a real button that
 * "closes the terminal" back to `/`, yellow/green are decorative.
 */
export function TerminalWindow({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-dvh flex-col bg-void font-mono text-bone">
      <header className="relative flex h-10 shrink-0 items-center border-b border-steel bg-carbon">
        <div className="ml-4 flex items-center gap-2">
          <button
            type="button"
            aria-label="close terminal"
            onClick={() => navigate("/")}
            className="h-3 w-3 rounded-full bg-[#ff5f57]"
          />
          <span aria-hidden className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="pointer-events-none absolute inset-x-0 truncate px-16 text-center text-[12px] text-ash">
          {title}
        </span>
      </header>
      <main id="main" className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
