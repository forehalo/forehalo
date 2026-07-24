import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";

/**
 * CollabDoc — the exhibit of the sync section on /affine (was the /y-octo
 * page hero) ("many cursors, one document,
 * zero conflicts"). Harvested from home/Presence.tsx and elevated: no scroll
 * pin, no scrub — the shared note starts fully written and stays live while
 * in view. Three simulated collaborators (Brooooooklyn / fengmk2 / pengx17)
 * each rewrite one line at a time — word-boundary backspaces, then
 * word-by-word fluent typing — so the document reads as coherent prose at
 * every moment. The merge log lands one line per batch:
 * `↬ update merged · 3 origins · 0 conflicts · Nms`.
 * The visitor joins as "you" (cyan caret) and clicks to drop a mark.
 * Reduced motion: static fully-written snapshot, no caret motion.
 */

const LINES = [
  "Three collaborators type into the same note at the same time.",
  "Every keystroke becomes an operation carrying a unique id.",
  "Replicas swap operations in any order — and still converge.",
  "No leader, no lock, no referee. Nothing to resolve by hand.",
  "This is the trick y-octo pulls off in Rust, inside AFFiNE.",
];

const FULL_TEXT = LINES.join("\n");

/* fluent alternates each collaborator cycles through (index 0 = original) */
const VARIANTS: string[][] = [
  [
    LINES[0],
    "Everyone types at once; nobody waits for a lock.",
    "Three cursors, one paragraph — no turn-taking.",
  ],
  [
    LINES[1],
    "Each edit is an operation that commutes with every other.",
    "Operations are addressed by id, never by position.",
  ],
  [
    LINES[2],
    "Apply the same set of ops in any order: the same document.",
    "Merges land in microseconds, byte-for-byte identical.",
  ],
  [
    LINES[3],
    "No server plays referee — convergence is structural.",
    "Zero conflicts is not a promise; it is the data structure.",
  ],
  [
    LINES[4],
    "y-octo ports this trick to Rust — AFFiNE runs on it.",
    "AFFiNE applies these updates through y-octo, in Rust.",
  ],
];

const COLLABS = [
  { name: "Brooooooklyn", color: "#FF5C28" },
  { name: "fengmk2", color: "#8CC84B" },
  { name: "pengx17", color: "#FFB43A" },
];

/* char offset of each line start inside FULL_TEXT */
const LINE_STARTS: number[] = (() => {
  const starts: number[] = [];
  let acc = 0;
  for (const l of LINES) {
    starts.push(acc);
    acc += l.length + 1;
  }
  return starts;
})();

interface Step {
  line: number;
  who: number;
  text: string;
}

/**
 * Deterministic edit script: 15 rounds. Each round one collaborator rewrites
 * one line — word-boundary backspaces to empty, then word-by-word typing of
 * the next variant. Every intermediate document is fluent prose with a single
 * active caret. Each line cycles through all 3 variants, so the script ends
 * exactly back on FULL_TEXT and loops seamlessly.
 */
const SCRIPT: Step[] = (() => {
  const steps: Step[] = [];
  const current = [...LINES];
  const varIdx = [0, 0, 0, 0, 0];
  for (let r = 0; r < 15; r++) {
    const line = r % LINES.length;
    const who = r % COLLABS.length;
    varIdx[line] += 1;
    const to = VARIANTS[line][varIdx[line] % VARIANTS[line].length];
    const fromWords = current[line].split(" ");
    for (let k = fromWords.length - 1; k >= 0; k--) {
      steps.push({ line, who, text: fromWords.slice(0, k).join(" ") });
    }
    const toWords = to.split(" ");
    for (let k = 1; k <= toWords.length; k++) {
      steps.push({ line, who, text: toWords.slice(0, k).join(" ") });
    }
    current[line] = to;
  }
  return steps;
})();

interface Px {
  x: number;
  y: number;
  h: number;
}

interface MergeEntry {
  id: number;
  origins: number;
  ms: number;
}

/** carets parked at the ends of lines 0 / 2 / 4 for the resting snapshot */
const PARKED = [
  LINE_STARTS[0] + LINES[0].length,
  LINE_STARTS[2] + LINES[2].length,
  LINE_STARTS[4] + LINES[4].length,
];

export function CollabDoc() {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const { ref: viewRef, inView } = useInViewOnce<HTMLDivElement>(0.25);

  const [doc, setDoc] = useState(FULL_TEXT);
  const [caretPos, setCaretPos] = useState<number[]>(PARKED);
  const [caretPx, setCaretPx] = useState<(Px | null)[]>([null, null, null]);
  const [active, setActive] = useState(-1);
  const [ops, setOps] = useState(reduced ? SCRIPT.length : 0);
  const [log, setLog] = useState<MergeEntry[]>(() =>
    reduced ? [{ id: 0, origins: 3, ms: 11 }] : [],
  );
  const [you, setYou] = useState<Px | null>(null);
  const [mark, setMark] = useState<Px | null>(null);
  const liveRef = useRef({ lines: [...LINES], opIdx: 0 });

  /* live loop: apply scripted word-steps, land merge-log lines
   * (reduced motion: statics are the lazy initial state above — no loop) */
  useEffect(() => {
    if (!inView || reduced) return;
    const state = liveRef.current;
    state.lines = [...LINES];
    state.opIdx = 0;
    const id = window.setInterval(() => {
      const step = SCRIPT[state.opIdx % SCRIPT.length];
      state.opIdx++;
      state.lines[step.line] = step.text;
      setDoc(state.lines.join("\n"));
      setActive(step.who);
      setOps((n) => n + 1);
      setCaretPos((prev) => {
        const next = [...prev];
        // the typer's caret sits at the end of the fragment just written
        next[step.who] = LINE_STARTS[step.line] + step.text.length;
        // parked carets occasionally drift to another line end (presenceDrift)
        for (let i = 0; i < 3; i++) {
          if (i !== step.who && Math.random() < 0.14) {
            const l = Math.floor(Math.random() * LINES.length);
            next[i] = LINE_STARTS[l] + state.lines[l].length;
          }
        }
        return next;
      });
      if (state.opIdx % 8 === 0) {
        const ms = 6 + Math.floor(Math.random() * 11);
        setLog((l) => [...l.slice(-2), { id: state.opIdx, origins: 3, ms }]);
      }
    }, 130);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  /* measure caret pixel positions from char offsets (Range API) */
  const measure = useCallback((offset: number): Px | null => {
    const el = paraRef.current;
    const card = cardRef.current;
    const node = el?.firstChild;
    if (!el || !card || !node) return null;
    const len = node.textContent?.length ?? 0;
    if (len === 0) return null;
    const o = Math.max(0, Math.min(offset, len));
    try {
      const range = document.createRange();
      range.setStart(node, o);
      range.collapse(true);
      const r = range.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      return { x: r.left - c.left, y: r.top - c.top, h: r.height || 18 };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setCaretPx(caretPos.map((p) => measure(p)));
    });
    return () => cancelAnimationFrame(id);
  }, [caretPos, doc, measure]);

  /* visitor presence inside the card: join as "you", others yield */
  const onCardMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const c = card.getBoundingClientRect();
    setYou({ x: e.clientX - c.left, y: e.clientY - c.top, h: 18 });
  };
  const onCardLeave = () => {
    setYou(null);
  };
  const onCardClick = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const c = card.getBoundingClientRect();
    setMark({ x: e.clientX - c.left, y: e.clientY - c.top, h: 18 });
    setLog((l) => [...l.slice(-2), { id: Date.now(), origins: 4, ms: 9 }]);
    window.setTimeout(() => setMark(null), 1800);
  };

  /* yield: carets drift aside politely when the visitor is near */
  const yielded = (px: Px | null): Px | null => {
    if (!px || !you) return px;
    const d = Math.hypot(px.x - you.x, px.y - you.y);
    if (d < 48) {
      const push = ((48 - d) / 48) * 28;
      return { ...px, x: px.x + (px.x >= you.x ? push : -push) };
    }
    return px;
  };

  return (
    <motion.div
      ref={viewRef}
      initial={reduced ? false : { opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE_COMPILE_OUT }}
      className="flex flex-col"
    >
      {/* document card */}
      <div
        ref={cardRef}
        data-cursor="sync"
        onMouseMove={onCardMove}
        onMouseLeave={onCardLeave}
        onClick={onCardClick}
        className="relative w-full cursor-text rounded-[3px] border border-steel bg-carbon-2 p-6 shadow-halo-glow md:p-10"
        role="presentation"
      >
        {/* card chrome */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-steel pb-3">
          <span className="font-mono text-[11px] text-ash">
            shared-note.md <span className="ml-2 text-dim">demo replay</span>
          </span>
          <div className="flex items-center gap-2">
            {COLLABS.map((c, i) => (
              <motion.span
                key={c.name}
                initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.3, duration: 0.3 }}
                className="micro rounded-full border px-2 py-0.5"
                style={{ color: c.color, borderColor: `${c.color}55` }}
              >
                {c.name}
              </motion.span>
            ))}
            {you && (
              <span className="micro rounded-full border border-wasi-cyan/60 px-2 py-0.5 text-wasi-cyan">
                you
              </span>
            )}
          </div>
        </div>

        {/* the document being edited */}
        <p
          ref={paraRef}
          className="min-h-[9em] whitespace-pre-wrap font-mono text-[14px] leading-[1.8] text-bone/90 md:text-[15px]"
        >
          {doc}
        </p>

        {/* collaborator carets + name flags */}
        {caretPx.map((px, i) => {
          const p = yielded(px);
          if (!p) return null;
          const c = COLLABS[i];
          const typing = i === active;
          return (
            <div
              key={c.name}
              aria-hidden
              className="pointer-events-none absolute transition-all duration-300 ease-compile-out"
              style={{ left: p.x, top: p.y }}
            >
              <div
                className={typing ? "w-[2px]" : "w-[2px] animate-caret-blink"}
                style={{ height: p.h, backgroundColor: c.color }}
              />
              <div
                className="absolute -top-5 left-0 whitespace-nowrap rounded-[2px] px-1 py-px font-mono"
                // fixed dark ink on bright signal chips — not theme void (paper in light)
                style={{ fontSize: 9, color: "#07080A", backgroundColor: c.color }}
              >
                {c.name}
              </div>
            </div>
          );
        })}

        {/* visitor "you" caret */}
        {you && (
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: you.x, top: you.y }}
          >
            <div className="w-[2px] bg-wasi-cyan" style={{ height: you.h }} />
            <div
              className="absolute -top-5 left-0 rounded-[2px] bg-wasi-cyan px-1 py-px font-mono text-[9px]"
              // fixed dark ink on cyan chip (light wasi-cyan fails with void/paper)
              style={{ color: "#07080A" }}
            >
              you
            </div>
          </div>
        )}

        {/* "you were here" marker */}
        {mark && (
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: mark.x, top: mark.y }}
          >
            <span className="micro whitespace-nowrap text-wasi-cyan/70">▍you were here</span>
          </div>
        )}
      </div>

      {/* merge log strip */}
      <div className="mt-4 w-full">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-[0.08em] text-dim">
          <span>merge.log</span>
          <span className="tabular-nums">
            ops applied <span className="text-ash">{ops}</span>
            <span className="mx-2">·</span>
            conflicts <span className="text-node">0</span>
          </span>
        </div>
        <div className="space-y-1" aria-live="polite">
          {log.map((l) => (
            <motion.div
              key={l.id}
              initial={reduced ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="micro text-dim"
            >
              ↬ update merged · {l.origins} origins · <span className="text-node">0 conflicts</span>{" "}
              · {l.ms}ms
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
