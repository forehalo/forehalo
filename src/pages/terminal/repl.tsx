import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { createShell } from "@/pages/terminal/cli";
import { tokenize } from "@/pages/terminal/shell";

/**
 * Repl — the interactive shell of the /terminal home fork (terminal.md §repl).
 * History is an ordered list of echoed input lines (with prompt) and output
 * nodes. On mount it automatically runs `help` (product requirement, guarded
 * by a ref so it fires once). Keyboard: Enter runs, ArrowUp/Down cycle past
 * inputs, Tab completes the current token against shell.candidates(),
 * Ctrl+L clears. Decorative motion is essentially absent; the auto-scroll
 * behavior is gated on useReducedMotion() per design.md §9.
 */

interface InputEntry {
  id: number;
  kind: "input";
  text: string;
}
interface OutputEntry {
  id: number;
  kind: "output";
  node: ReactNode;
}
type Entry = InputEntry | OutputEntry;

/** `yii@thatyii ~ %` — the path segment is halo */
function Prompt() {
  return (
    <span className="shrink-0 select-none">
      <span className="text-ash">yii@thatyii</span> <span className="text-halo">~</span>
      <span className="text-dim"> %</span>
    </span>
  );
}

export function Repl() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const [pastInputs, setPastInputs] = useState<string[]>([]);
  /** index into pastInputs while cycling; -1 = editing the current line */
  const [cursor, setCursor] = useState(-1);
  const idRef = useRef(0);
  const bootedRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const shell = useMemo(
    () =>
      createShell({
        emit: (node) =>
          setEntries((prev) => [...prev, { id: ++idRef.current, kind: "output", node }]),
        navigate,
        clear: () => setEntries([]),
      }),
    [navigate],
  );

  const runInput = useCallback(
    async (input: string) => {
      setEntries((prev) => [...prev, { id: ++idRef.current, kind: "input", text: input }]);
      if (input.trim()) setPastInputs((prev) => [...prev, input]);
      await shell.run(input);
    },
    [shell],
  );

  // boot: echo + run `help` once per mount
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    void runInput("help");
  }, [runInput]);

  // keep the latest entry in view (instant under reduced motion)
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: reduced ? "auto" : "smooth" });
  }, [entries, reduced]);

  /** Tab: complete the current token to the sole candidate or common prefix */
  const complete = useCallback(() => {
    const trailingSpace = /\s$/.test(value);
    const tokens = tokenize(value);
    const fragment = trailingSpace ? "" : (tokens.pop() ?? "");
    const matches = shell.candidates().filter((c) => c.startsWith(fragment));
    if (matches.length === 0) return;

    let replacement: string;
    if (matches.length === 1) {
      replacement = matches[0];
    } else {
      let prefix = matches[0];
      for (const m of matches.slice(1)) {
        while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1);
      }
      if (prefix.length <= fragment.length) return; // ambiguous — no-op
      replacement = prefix;
    }
    const head = tokens.join(" ");
    setValue(head ? `${head} ${replacement}` : replacement);
  }, [value, shell]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = value;
      setValue("");
      setCursor(-1);
      void runInput(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (pastInputs.length === 0) return;
      const next = cursor === -1 ? pastInputs.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(pastInputs[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === -1) return;
      const next = cursor + 1;
      if (next >= pastInputs.length) {
        setCursor(-1);
        setValue("");
      } else {
        setCursor(next);
        setValue(pastInputs[next]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  };

  return (
    // click-to-focus lives on the page container (src/pages/terminal.tsx),
    // so the whole window focuses the input unless text is selected
    <div className="mt-8 text-[13px] leading-[1.9]">
      {entries.map((e) =>
        e.kind === "input" ? (
          <div key={e.id} className="flex gap-2 whitespace-pre-wrap">
            <Prompt />
            <span className="text-bone">{e.text}</span>
          </div>
        ) : (
          <div key={e.id}>{e.node}</div>
        ),
      )}
      <div className="flex items-center gap-2">
        <Prompt />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setCursor(-1);
          }}
          onKeyDown={onKeyDown}
          autoFocus
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="terminal input"
          data-term-input
          className="min-w-0 flex-1 bg-transparent text-bone outline-none"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}
