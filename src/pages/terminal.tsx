import { Welcome } from "@/pages/terminal/welcome";
import { Repl } from "@/pages/terminal/repl";

/**
 * /terminal — the home fork as a macOS terminal session (terminal.md §home).
 * Thin composer like src/pages/home.tsx: login banner (Welcome) above the
 * REPL. Content is top-aligned like a real tty, both overall (this
 * container) and within the hero (the gear column aligns with the identity
 * column's top); once the history outgrows the window, the TerminalWindow
 * scroll slot takes over.
 */
export default function TerminalHome() {
  // clicking anywhere in the window focuses the shell input — unless the
  // click left a text selection (the visitor is copying, not typing)
  const focusShellInput = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    document.querySelector<HTMLElement>("[data-term-input]")?.focus();
  };

  return (
    <div
      className="flex min-h-full flex-col justify-start px-6 py-6 md:px-10"
      onClick={focusShellInput}
    >
      <Welcome />
      <Repl />
    </div>
  );
}
