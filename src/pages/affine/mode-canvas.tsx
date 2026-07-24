import { useCallback, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { FileText, Frame, GripVertical } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useScrollTo } from "@/hooks/use-smooth-scroll";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * A2 · Blocks — "one doc, two geometries" (id: blocks).
 * The signature AFFiNE interaction: the same five blocks flip between
 * doc mode (a readable page) and edgeless mode (an infinite canvas where
 * blocks float, dock, and can be dragged). Drag is pointer-event based,
 * transform-only (framer-motion x/y MotionValues — no re-render per frame),
 * clamped to the canvas, with arrow-key nudge as the keyboard fallback.
 * Reduced motion: static canvas, no drag.
 */

interface BlockDef {
  id: string;
  name: string;
  tag: string;
  width: string;
  pos: { x: number; y: number }; // % of the canvas
  title: ReactNode;
  body: ReactNode;
}

const BLOCKS: BlockDef[] = [
  {
    id: "role",
    name: "role — tech leader of the dev team",
    tag: "block:heading",
    width: "w-[min(19rem,74vw)]",
    pos: { x: 5, y: 8 },
    title: "tech leader of the dev team",
    body: "@toeverything · 2023 → 2025 — led the dev team building the knowledge OS.",
  },
  {
    id: "scale",
    name: "scale — 70.6k GitHub stars",
    tag: "block:callout",
    width: "w-[min(15rem,62vw)]",
    pos: { x: 64, y: 6 },
    title: (
      <>
        70.6k <span className="text-halo">★</span>
      </>
    ),
    body: "GitHub stars — one of the most-starred open-source knowledge apps.",
  },
  {
    id: "product",
    name: "product — docs plus whiteboard",
    tag: "block:paragraph",
    width: "w-[min(17rem,68vw)]",
    pos: { x: 12, y: 48 },
    title: "docs + whiteboard",
    body: "Every page is a doc that flips into an edgeless canvas. Blocks all the way down.",
  },
  {
    id: "sync",
    name: "sync — real-time and local-first",
    tag: "block:paragraph",
    width: "w-[min(17rem,68vw)]",
    pos: { x: 58, y: 44 },
    title: "real-time · local-first",
    body: "CRDT-synced collaboration — the doc lives on your machine first, merges without conflicts.",
  },
  {
    id: "engine",
    name: "engine — powered by y-octo",
    tag: "block:link",
    width: "w-[min(18rem,70vw)]",
    pos: { x: 32, y: 74 },
    title: "powered by y-octo",
    body: (
      <>
        my Rust port of Yjs, integrated as the CRDT engine — <EngineStoryLink />
      </>
    ),
  },
];

/** in-page jump to the engine section (the y-octo story lives on this page now) */
function EngineStoryLink() {
  const scrollTo = useScrollTo();
  return (
    <button
      type="button"
      onClick={() => scrollTo("#engine", -64)}
      data-cursor="link"
      className="text-halo underline decoration-steel-soft underline-offset-4 transition-colors hover:decoration-halo"
    >
      the y-octo story ↓
    </button>
  );
}

type Pt = { x: number; y: number };
type GetOffset = (id: string) => Pt | undefined;
type SetOffset = (id: string, pos: Pt) => void;

export function ModeCanvas() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<"doc" | "edgeless">("doc");
  const canvasRef = useRef<HTMLDivElement | null>(null);
  // drag offsets survive mode flips — blocks dock back where you left them
  const offsets = useRef<Record<string, Pt>>({});
  const getOffset = useCallback<GetOffset>((id) => offsets.current[id], []);
  const setOffset = useCallback<SetOffset>((id, pos) => {
    offsets.current[id] = pos;
  }, []);

  return (
    <section
      id="blocks"
      className="relative mx-auto max-w-[1360px] scroll-mt-14 px-6 py-24 md:px-16 md:py-32"
    >
      <SectionHeader slug="blocks" title="one doc, two geometries" />

      {/* mode toggle — the AFFiNE page ⇄ edgeless switch */}
      <div className="mb-8 flex flex-wrap items-center justify-end gap-4">
        <div
          role="tablist"
          aria-label="canvas mode"
          className="flex items-center rounded-[3px] border border-steel bg-carbon p-1"
        >
          {(["doc", "edgeless"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              data-cursor="link"
              className={cn(
                "flex items-center gap-2 rounded-[2px] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-200 ease-compile-out",
                mode === m ? "bg-halo-soft text-halo" : "text-ash hover:text-bone",
              )}
            >
              {m === "doc" ? <FileText size={12} aria-hidden /> : <Frame size={12} aria-hidden />}
              {m}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {mode === "doc" ? (
          <motion.div
            key="doc"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_COMPILE_OUT }}
          >
            <DocView reduced={reduced} />
          </motion.div>
        ) : (
          <motion.div
            key="edgeless"
            initial={reduced ? false : { opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.35, ease: EASE_COMPILE_OUT }}
          >
            <EdgelessView
              reduced={reduced}
              canvasRef={canvasRef}
              getOffset={getOffset}
              setOffset={setOffset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── doc mode: the blocks as a readable page ─────────────────────────── */
function DocView({ reduced }: { reduced: boolean }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 border-b border-steel pb-4">
        <p className="font-grotesk text-[24px] font-bold tracking-[-0.01em] text-bone">
          Yii @ AFFiNE — notes
        </p>
        <p className="micro mt-1 text-dim">doc mode · 5 blocks</p>
      </div>
      <div className="space-y-2">
        {BLOCKS.map((b, i) => (
          <motion.div
            key={b.id}
            className="group flex items-start gap-2 rounded-[3px] border border-transparent px-3 py-3 transition-colors duration-200 hover:border-steel hover:bg-carbon"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_COMPILE_OUT, delay: 0.05 + i * 0.06 }}
          >
            <GripVertical
              size={14}
              aria-hidden
              className="mt-1 shrink-0 text-dim opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
            <div>
              <p className="micro mb-1 text-dim">{b.tag}</p>
              <h3 className="font-grotesk text-[18px] font-bold text-bone">{b.title}</h3>
              <div className="mt-1 text-[15px] leading-relaxed text-ash">{b.body}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── edgeless mode: the blocks loose on an infinite canvas ───────────── */
function EdgelessView({
  reduced,
  canvasRef,
  getOffset,
  setOffset,
}: {
  reduced: boolean;
  canvasRef: RefObject<HTMLDivElement | null>;
  getOffset: GetOffset;
  setOffset: SetOffset;
}) {
  return (
    <>
      <div
        ref={canvasRef}
        className="affine-dotgrid relative h-[72vh] min-h-[540px] overflow-hidden rounded-[3px] border border-steel bg-carbon/40"
      >
        {/* canvas chrome */}
        <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-2">
          <span className="micro rounded-[2px] border border-steel bg-carbon px-1.5 py-0.5 text-dim">
            edgeless ∞
          </span>
          <span className="micro rounded-[2px] border border-steel bg-carbon px-1.5 py-0.5 text-dim">
            100%
          </span>
        </div>
        {BLOCKS.map((b, i) => (
          <EdgelessBlock
            key={b.id}
            def={b}
            index={i}
            canvasRef={canvasRef}
            getOffset={getOffset}
            setOffset={setOffset}
            disabled={reduced}
          />
        ))}
      </div>
      {!reduced && (
        <p className="micro mt-3 text-dim">
          drag blocks to rearrange · focus one and nudge with ← → ↑ ↓ (shift = bigger step)
        </p>
      )}
    </>
  );
}

function EdgelessBlock({
  def,
  index,
  canvasRef,
  getOffset,
  setOffset,
  disabled,
}: {
  def: BlockDef;
  index: number;
  canvasRef: RefObject<HTMLDivElement | null>;
  getOffset: GetOffset;
  setOffset: SetOffset;
  disabled: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [initial] = useState<Pt>(() => getOffset(def.id) ?? { x: 0, y: 0 });
  const x = useMotionValue(initial.x);
  const y = useMotionValue(initial.y);
  const offsetRef = useRef(initial);
  const dragRef = useRef<{ id: number; sx: number; sy: number; bx: number; by: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);

  /** clamp a pixel offset so the block stays inside the canvas */
  const clampOffset = useCallback(
    (nx: number, ny: number) => {
      const c = canvasRef.current;
      const b = ref.current;
      if (!c || !b) return { x: nx, y: ny };
      const cr = c.getBoundingClientRect();
      const br = b.getBoundingClientRect(); // includes the current drag transform
      const o = offsetRef.current;
      const baseLeft = br.left - o.x;
      const baseTop = br.top - o.y;
      const minX = cr.left - baseLeft;
      const maxX = cr.right - baseLeft - br.width;
      const minY = cr.top - baseTop;
      const maxY = cr.bottom - baseTop - br.height;
      return {
        x: Math.min(Math.max(nx, minX), Math.max(minX, maxX)),
        y: Math.min(Math.max(ny, minY), Math.max(minY, maxY)),
      };
    },
    [canvasRef],
  );

  const commit = useCallback(
    (nx: number, ny: number) => {
      const c = clampOffset(nx, ny);
      offsetRef.current = c;
      setOffset(def.id, c);
      x.set(c.x);
      y.set(c.y);
    },
    [clampOffset, def.id, setOffset, x, y],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("a,button")) return; // let links stay links
    ref.current?.setPointerCapture(e.pointerId);
    dragRef.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      bx: offsetRef.current.x,
      by: offsetRef.current.y,
    };
    setDragging(true);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.id) return;
    commit(d.bx + e.clientX - d.sx, d.by + e.clientY - d.sy);
  };
  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  };
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const step = e.shiftKey ? 32 : 8;
    const dir =
      e.key === "ArrowLeft"
        ? [-step, 0]
        : e.key === "ArrowRight"
          ? [step, 0]
          : e.key === "ArrowUp"
            ? [0, -step]
            : e.key === "ArrowDown"
              ? [0, step]
              : null;
    if (!dir) return;
    e.preventDefault();
    commit(offsetRef.current.x + dir[0], offsetRef.current.y + dir[1]);
  };

  return (
    <motion.div
      ref={ref}
      role="group"
      aria-label={disabled ? def.name : `${def.name} — draggable block, use arrow keys to move`}
      tabIndex={disabled ? undefined : 0}
      data-cursor={disabled ? undefined : "move"}
      className={cn(
        "absolute select-none",
        !disabled && "cursor-grab touch-none",
        dragging && "cursor-grabbing",
      )}
      style={{ left: `${def.pos.x}%`, top: `${def.pos.y}%`, x, y, zIndex: dragging ? 20 : 10 }}
      initial={disabled ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE_COMPILE_OUT, delay: 0.06 + index * 0.06 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      {/* float lives on the inner wrapper so it never fights the drag transform */}
      <div
        className={disabled ? undefined : "affine-float"}
        style={{
          animationDuration: `${6.5 + (index % 3) * 1.3}s`,
          animationDelay: `${index * -1.9}s`,
          animationPlayState: dragging ? "paused" : undefined,
        }}
      >
        <div
          className={cn(
            "rounded-[3px] border bg-carbon p-4 transition-colors duration-200",
            def.width,
            dragging ? "border-halo shadow-halo-glow" : "border-steel hover:border-steel-soft",
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="micro text-dim">{def.tag}</span>
            {!disabled && <GripVertical size={12} aria-hidden className="shrink-0 text-dim" />}
          </div>
          <h3 className="font-grotesk text-[16px] font-bold text-bone">{def.title}</h3>
          <div className="mt-1 text-[13px] leading-relaxed text-ash">{def.body}</div>
        </div>
      </div>
    </motion.div>
  );
}
