import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * CollabDoc — the exhibit of the sync section on /affine (was the /y-octo
 * page hero) ("many cursors, one document,
 * zero conflicts"). Harvested from home/Presence.tsx and elevated: no scroll
 * pin, no scrub — the shared note starts fully written and stays live while
 * in view. Four simulated collaborators (Brooooooklyn / Yii / Hwang / Evan)
 * each rewrite one line at a time — word-boundary backspaces, then
 * word-by-word fluent typing — so the document reads as coherent prose at
 * every moment. The merge log lands one line per batch:
 * `↬ update merged · N origins · 0 conflicts · Nms`.
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

/** Display names + X avatars (snapshotted under public/avatars/). */
const COLLABS = [
  {
    name: "Brooooooklyn",
    color: "#FF5C28",
    avatar: "/avatars/brooooooklyn.jpg", // @Brooooook_lyn
  },
  {
    name: "Yii",
    color: "#8CC84B",
    avatar: "/avatars/yii.jpg", // @forehalo
  },
  {
    name: "Hwang",
    color: "#FFB43A",
    avatar: "/avatars/hwang.jpg", // @42Hwang
  },
  {
    name: "Evan",
    color: "#5B9DFF",
    avatar: "/avatars/evan.jpg", // @ewind_dev
  },
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

/** carets parked at line ends for the resting snapshot (one per collaborator) */
const PARKED = [
  LINE_STARTS[0] + LINES[0].length,
  LINE_STARTS[1] + LINES[1].length,
  LINE_STARTS[3] + LINES[3].length,
  LINE_STARTS[4] + LINES[4].length,
];

export function CollabDoc() {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const { ref: viewRef, inView } = useInViewOnce<HTMLDivElement>(0.25);

  const [doc, setDoc] = useState(FULL_TEXT);
  const [caretPos, setCaretPos] = useState<number[]>(PARKED);
  const [caretPx, setCaretPx] = useState<(Px | null)[]>(() => COLLABS.map(() => null));
  const [active, setActive] = useState(-1);
  const [ops, setOps] = useState(reduced ? SCRIPT.length : 0);
  const [log, setLog] = useState<MergeEntry[]>(() =>
    reduced ? [{ id: 0, origins: COLLABS.length, ms: 11 }] : [],
  );
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
        for (let i = 0; i < COLLABS.length; i++) {
          if (i !== step.who && Math.random() < 0.14) {
            const l = Math.floor(Math.random() * LINES.length);
            next[i] = LINE_STARTS[l] + state.lines[l].length;
          }
        }
        return next;
      });
      if (state.opIdx % 8 === 0) {
        const ms = 6 + Math.floor(Math.random() * 11);
        setLog((l) => [...l.slice(-2), { id: state.opIdx, origins: COLLABS.length, ms }]);
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
      // Layout not ready yet (common on first paint / while the card fades in).
      if (c.width === 0 || c.height === 0) return null;
      if (r.height === 0 && r.width === 0 && r.top === 0 && r.left === 0) return null;
      return { x: r.left - c.left, y: r.top - c.top, h: r.height || 18 };
    } catch {
      return null;
    }
  }, []);

  // Only enable CSS position transitions after a caret has already been placed.
  // First paint must not interpolate from (0,0) — that flashes from the card's
  // top-left. Subsequent moves (typing) keep the smooth glide.
  const placedRef = useRef(COLLABS.map(() => false));
  const [smooth, setSmooth] = useState(() => COLLABS.map(() => false));

  useLayoutEffect(() => {
    let cancelled = false;
    const apply = () => {
      if (cancelled) return;
      const next = caretPos.map((p) => measure(p));
      setCaretPx(next);
      const nextSmooth = next.map((px, i) => {
        if (px == null) {
          placedRef.current[i] = false;
          return false;
        }
        // second+ consecutive placement may transition
        const wasPlaced = placedRef.current[i];
        placedRef.current[i] = true;
        return wasPlaced;
      });
      setSmooth(nextSmooth);
    };
    // Double rAF: wait for layout after doc text commit (and card enter anim).
    const a = requestAnimationFrame(() => {
      requestAnimationFrame(apply);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(a);
    };
  }, [caretPos, doc, measure, inView]);

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
        className="relative w-full rounded-[3px] border border-steel bg-carbon-2 p-6 shadow-halo-glow md:p-10"
      >
        {/* card chrome */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-steel pb-3">
          <span className="font-mono text-[11px] text-ash">shared-note.md</span>
          <div className="flex items-center gap-2">
            {COLLABS.map((c, i) => (
              <motion.span
                key={c.name}
                initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.3, duration: 0.3 }}
                className="micro inline-flex h-5 items-center gap-1 rounded-full border pr-2 pl-0"
                style={{ color: c.color, borderColor: `${c.color}55` }}
              >
                <img
                  src={c.avatar}
                  alt=""
                  width={20}
                  height={20}
                  className="h-full w-5 shrink-0 rounded-full object-cover"
                  draggable={false}
                />
                {c.name}
              </motion.span>
            ))}
          </div>
        </div>

        {/* the document being edited */}
        <p
          ref={paraRef}
          className="min-h-[9em] whitespace-pre-wrap font-mono text-[14px] leading-[1.8] text-bone/90 md:text-[15px]"
        >
          {doc}
        </p>

        {/* collaborator carets + name chips */}
        {caretPx.map((px, i) => {
          if (!px) return null;
          const c = COLLABS[i];
          const typing = i === active;
          return (
            <div
              key={c.name}
              aria-hidden
              className={cn(
                "pointer-events-none absolute",
                smooth[i] && "transition-[left,top] duration-300 ease-compile-out",
              )}
              style={{ left: px.x, top: px.y }}
            >
              <div
                className={typing ? "w-[2px]" : "w-[2px] animate-caret-blink"}
                style={{ height: px.h, backgroundColor: c.color }}
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
