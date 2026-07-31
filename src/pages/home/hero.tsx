import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { INTRO_REVEAL_HOLD, introRevealAt } from "@/pages/home/intro-session";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * S1 · Hero — "Compiled Identity" (home.md §S1, compact — shares the first
 * screen with the log section below, so no full-viewport height, no scroll
 * cue). The intro types itself line by line — `#[derive(Human)]`, the name,
 * then the verse — and the page's log section reveals only after the typing
 * finishes (onIntroDone). Scroll: content parallax-lifts 0.85× over the
 * first 60vh.
 */

export function Hero({
  start,
  onIntroDone,
  skipIntro = false,
}: {
  start: boolean;
  onIntroDone?: () => void;
  /** already played (localStorage) — print final state, no type-in */
  skipIntro?: boolean;
}) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  // parallax hand-off to S2 (0.85× lift over the first 60vh)
  const { scrollY } = useScroll();
  const lift = useTransform(
    scrollY,
    [0, typeof window !== "undefined" ? window.innerHeight * 0.6 : 600],
    [0, -90],
  );

  return (
    <section id="hero" ref={sectionRef} className="relative overflow-hidden py-4 md:py-6">
      {/* foreground — nudged right of the log column's left edge */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-[1360px] px-6 md:px-16 lg:pl-32"
        style={reduced || skipIntro ? undefined : { y: lift }}
      >
        <TypeIntro start={start} reduced={reduced} skipIntro={skipIntro} onDone={onIntroDone} />
      </motion.div>
    </section>
  );
}

/* ── the typing intro ───────────────────────────────────────────────────
 * One shared caret types the lines top to bottom: attribute, name, verse.
 * Untyped characters render `invisible` (not removed) so the layout never
 * shifts; reduced motion prints everything at once and signals done. */

interface TypeSegment {
  text: string;
  className?: string;
}
interface TypeLine {
  segments: TypeSegment[];
  className: string;
  heading?: boolean;
  /** ms per character */
  speed: number;
  /** pause after this line (ms) — defaults to LINE_BREAK_PAUSE */
  pauseAfter?: number;
}

/* Rhythm, not duration: boilerplate prints like compiler output (18ms),
 * the name lands as a punch (80ms), the verse keeps a readable voice (22ms).
 * One deliberate breath before the verse (400ms); every other pause is cut. */
const INTRO_LINES: TypeLine[] = [
  {
    segments: [{ text: "#[derive(Human)]" }],
    className: "font-mono text-[12px] tracking-[0.14em] text-dim",
    speed: 18,
  },
  {
    segments: [{ text: "#[alias(forehalo)]" }],
    className: "mb-6 font-mono text-[12px] tracking-[0.14em] text-dim",
    speed: 18,
  },
  {
    segments: [{ text: "Yii" }],
    className: "font-grotesk font-bold text-bone",
    heading: true,
    speed: 80,
    pauseAfter: 400,
  },
  {
    segments: [{ text: "i lead teams, write code." }],
    className: "mt-4 font-mono text-[13px] leading-[1.9] text-dim",
    speed: 22,
  },
  {
    segments: [
      { text: "i instruct people — and " },
      { text: "agents", className: "text-ash" },
      { text: " —" },
    ],
    className: "font-mono text-[13px] leading-[1.9] text-dim",
    speed: 22,
  },
  {
    segments: [{ text: "to build, to optimize, to ship," }],
    className: "font-mono text-[13px] leading-[1.9] text-dim",
    speed: 22,
  },
  {
    segments: [{ text: "to live my life." }],
    className: "font-mono text-[13px] leading-[1.9] text-dim",
    speed: 22,
  },
];

const LINE_LENGTHS = INTRO_LINES.map((l) => l.segments.reduce((n, s) => n + s.text.length, 0));
const TOTAL_CHARS = LINE_LENGTHS.reduce((a, b) => a + b, 0);
/** pause between lines (ms) */
const LINE_BREAK_PAUSE = 140;
/** the log reveal starts once the `to build, …` line has fully typed… */
const REVEAL_AT = introRevealAt(TOTAL_CHARS, LINE_LENGTHS[LINE_LENGTHS.length - 1]);
/** …and the final line holds until the reveal has finished (≈1s) */
const REVEAL_HOLD = INTRO_REVEAL_HOLD;

function TypeIntro({
  start,
  reduced,
  skipIntro = false,
  onDone,
}: {
  start: boolean;
  reduced: boolean;
  skipIntro?: boolean;
  onDone?: () => void;
}) {
  // skip / reduced: full text immediately (no caret, no type-in).
  // Latch at mount — if skipIntro/reduced flips true mid-type (e.g. parent
  // re-reads localStorage after onDone), do not abort the remaining lines.
  const instant = reduced || skipIntro;
  const [typed, setTyped] = useState(instant ? TOTAL_CHARS : 0);
  const animateRef = useRef(!instant);
  const doneRef = useRef(false);

  useEffect(() => {
    if (typed >= REVEAL_AT && !doneRef.current) {
      doneRef.current = true;
      onDone?.();
    }
    if (typed >= TOTAL_CHARS) return;
    if (!start || !animateRef.current) return;
    // hold the last line until the log reveal below has finished
    if (typed === REVEAL_AT) {
      const t = window.setTimeout(() => setTyped((c) => c + 1), REVEAL_HOLD);
      return () => window.clearTimeout(t);
    }
    // which line is being typed → its speed; pause at line breaks
    let offset = 0;
    let delay = INTRO_LINES[0].speed;
    for (let i = 0; i < INTRO_LINES.length; i++) {
      const lineEnd = offset + LINE_LENGTHS[i];
      if (typed < lineEnd) {
        delay = INTRO_LINES[i].speed;
        break;
      }
      if (typed === lineEnd) {
        delay = INTRO_LINES[i].pauseAfter ?? LINE_BREAK_PAUSE;
        break;
      }
      offset = lineEnd;
    }
    const t = window.setTimeout(() => setTyped((c) => c + 1), delay);
    return () => window.clearTimeout(t);
  }, [typed, start, onDone]);

  // walk the lines, slicing each at the global typed count
  let offset = 0;
  return (
    <div>
      {INTRO_LINES.map((line, li) => {
        const lineLen = LINE_LENGTHS[li];
        const lineTyped = Math.max(0, Math.min(typed - offset, lineLen));
        const active = typed >= offset && typed < offset + lineLen;
        const isLast = li === INTRO_LINES.length - 1;
        offset += lineLen;

        // the caret sits exactly at the typing boundary — between the last
        // typed char and the invisible remainder — not at the line's full width
        const showCaret = animateRef.current && (active || (isLast && typed >= TOTAL_CHARS));
        // zero-height outer box (width only) so the caret never grows the
        // line box — the painted bar is absolutely positioned from the baseline
        const caret = (
          <span aria-hidden className="relative ml-0.5 inline-block w-[0.12em]">
            <span className="absolute bottom-0 left-0 h-[0.85em] w-full animate-pulse bg-halo" />
          </span>
        );

        let segOffset = 0;
        const body = line.segments.map((seg, si) => {
          const segTyped = Math.max(0, Math.min(lineTyped - segOffset, seg.text.length));
          const isLastSeg = si === line.segments.length - 1;
          const boundaryHere =
            showCaret &&
            ((lineTyped >= segOffset && lineTyped < segOffset + seg.text.length) ||
              (isLastSeg && lineTyped === segOffset + seg.text.length));
          segOffset += seg.text.length;
          return (
            <span key={si} className={seg.className}>
              {seg.text.slice(0, segTyped)}
              {boundaryHere && caret}
              <span className="invisible">{seg.text.slice(segTyped)}</span>
            </span>
          );
        });

        return line.heading ? (
          <h1
            key={li}
            className={line.className}
            style={{
              fontSize: "clamp(40px, 6vw, 84px)",
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
            }}
          >
            {body}
          </h1>
        ) : (
          <div key={li} className={line.className}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
