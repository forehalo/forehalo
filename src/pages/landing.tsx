import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { encodeQrMatrix, SITE_QR_PAYLOAD } from "@/lib/qr";
import { INNER_HOME_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { COMMITS, logInvoiceAmount, parseLogMessage, type LogCommit } from "@/pages/home/log-data";
import { LANDING_VISIT_MAX, recordLandingVisit } from "@/pages/landing/visit-count";
import "@/pages/landing/receipt.css";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";

/**
 * Receipt gate — `/`.
 * Full-viewport black void + centered white thermal strip. Document flow +
 * native scroll only (Layout disables Lenis on this route). The reference
 * barcode is a live QR for `https://thatyii.dev`; click / keyboard enters
 * the compiled-identity home at INNER_HOME_PATH.
 *
 * Visit count (`fh-landing-visits`, 0–10) only scales thermal fade/missing
 * intensity — paper color stays fixed. See ThermalPrint + visit-count.ts.
 */

const SCAN_LABEL = "click to scan";

/** Wear level for this paint (0 fresh → 10 heavily faded thermal). */
const WearCtx = createContext(0);

export default function Landing() {
  const wear = useMemo(() => recordLandingVisit(), []);
  const wearT = wear / LANDING_VISIT_MAX;

  // Native document scroll (Lenis is not constructed on `/` — see Layout).
  return (
    <WearCtx.Provider value={wear}>
      <div className="min-h-dvh bg-black">
        <div className="flex min-h-dvh items-start justify-center px-3 py-6 sm:items-center sm:py-10">
          <article
            className="receipt-paper relative w-full max-w-[20rem] shrink-0 px-5 pb-7 pt-5 sm:max-w-[22rem] sm:px-6"
            aria-label="entry receipt"
            data-wear={wear}
            style={
              {
                ["--receipt-wear" as string]: String(wearT),
              } satisfies CSSProperties
            }
          >
            <WhiteSpeckles wear={wear} />
            <div className="receipt-ink">
              <QrHeader />
              <ReceiptBody />
              <Wordmark />
            </div>
          </article>
        </div>
      </div>
    </WearCtx.Provider>
  );
}

/** Sparse thermal flecks — a few white dots, stable per wear seed. */
function WhiteSpeckles({ wear }: { wear: number }) {
  const dots = useMemo(() => {
    // 8–14 dots (slightly more when worn) — keep sparse
    const n = 8 + Math.floor((wear / LANDING_VISIT_MAX) * 6);
    const list: { left: string; top: string; size: number; opacity: number }[] = [];
    for (let i = 0; i < n; i++) {
      const hx = hash01(0x71a2 + wear * 97 + i * 31);
      const hy = hash01(0x9e37 + wear * 53 + i * 17);
      const hs = hash01(0xface + wear * 11 + i * 19);
      const ho = hash01(0xbeef + wear * 7 + i * 13);
      list.push({
        left: `${4 + hx * 92}%`,
        top: `${3 + hy * 94}%`,
        size: 1 + hs * 3, // 1–4px
        opacity: 0.35 + ho * 0.4,
      });
    }
    return list;
  }, [wear]);

  return (
    <span aria-hidden className="receipt-speckles">
      {dots.map((d, i) => (
        <span
          key={i}
          className="receipt-speckle"
          style={
            {
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              opacity: d.opacity,
            } satisfies CSSProperties
          }
        />
      ))}
    </span>
  );
}

/* ── thermal glyph defects (scale with visit wear) ──────────────────── */

type Defect = "ok" | "ghost" | "faint" | "gap" | "top" | "bottom" | "smudge";

/** Deterministic 32-bit hash → [0,1) so defects stay stable across re-renders. */
function hash01(seed: number): number {
  let x = (seed ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 0x100000000;
}

/** wearT 0→10 visits as 0..1 — more defects, and gaps only when worn. */
function defectAt(lineSeed: number, index: number, wearT: number): Defect {
  const r = hash01(lineSeed * 131 + index * 17 + 7);
  // fresh ~7%, max wear ~28% of glyphs
  const rate = 0.07 + wearT * 0.21;
  if (r > rate) return "ok";

  const kind = hash01(lineSeed * 59 + index * 41 + 3);
  // full drop only after a few visits; grows to ~30% of worn glyphs
  const gapShare = wearT < 0.25 ? 0 : (wearT - 0.25) * 0.4;
  if (kind < gapShare) return "gap";
  if (kind < gapShare + 0.22) return "ghost";
  if (kind < gapShare + 0.45) return "faint";
  if (kind < gapShare + 0.62) return "top";
  if (kind < gapShare + 0.78) return "bottom";
  return "smudge";
}

function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Thermal print with visit-scaled wear. Low visits: soft fade only.
 * High visits: more ghosts, mid-line skips, occasional full gaps.
 * Full original text stays in aria-label.
 */
function ThermalPrint({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "div";
}) {
  const wear = useContext(WearCtx);
  const wearT = wear / LANDING_VISIT_MAX;
  const seed = useMemo(() => seedFrom(text), [text]);

  const glyphs = useMemo(() => {
    const chars = Array.from(text);
    let lastDefect = false;
    // at high wear, allow adjacent defects sometimes (thermal blotches)
    const allowAdjacent = wearT > 0.55;
    return chars.map((ch, i) => {
      if (ch === " " || ch === "\u00a0") {
        lastDefect = false;
        return { ch, defect: "ok" as Defect, key: i };
      }
      let defect = defectAt(seed, i, wearT);
      if (defect !== "ok" && lastDefect && !allowAdjacent) defect = "ok";
      // even when adjacent allowed, never two full gaps in a row
      if (defect === "gap" && lastDefect) {
        const prev = chars[i - 1];
        if (prev && prev !== " " && defectAt(seed, i - 1, wearT) === "gap") {
          defect = "ghost";
        }
      }
      lastDefect = defect !== "ok";
      return { ch, defect, key: i };
    });
  }, [text, seed, wearT]);

  // mid-line skip: ~20% fresh → ~58% at max wear
  const midSkipRate = 0.2 + wearT * 0.38;
  const midSkip = text.trim().length >= 4 && hash01(seed ^ 0x5f3759df) < midSkipRate;
  // thicker skip band when worn (still ≤ 2px)
  const skipH = 0.7 + wearT * 0.9 + hash01(seed ^ 22) * (0.4 + wearT * 0.3);
  const midSkipStyle = midSkip
    ? ({
        ["--skip-top" as string]: `${40 + hash01(seed ^ 11) * (12 + wearT * 8)}%`,
        ["--skip-h" as string]: `${Math.min(2, skipH)}px`,
        ["--skip-left" as string]: `${2 + hash01(seed ^ 33) * (12 + wearT * 10)}%`,
        ["--skip-right" as string]: `${2 + hash01(seed ^ 44) * (12 + wearT * 10)}%`,
      } satisfies CSSProperties)
    : undefined;

  return (
    <Tag
      className={cn(className, midSkip && "receipt-line--mid-skip")}
      style={midSkipStyle}
      aria-label={text}
    >
      {glyphs.map(({ ch, defect, key }) => (
        <span
          key={key}
          aria-hidden
          className={cn("receipt-glyph", defect !== "ok" && `receipt-glyph--${defect}`)}
        >
          {ch}
        </span>
      ))}
    </Tag>
  );
}

/* ── QR header (replaces barcode + circular cutout) ─────────────────── */

function QrHeader() {
  const reduced = useReducedMotion();
  const [coarse, setCoarse] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Track pointer while hovering — document-level so we keep clientX/Y even
  // if child layers intercept move events inside the QR cutout.
  useEffect(() => {
    if (!hovering || reduced || coarse) return;
    const onMove = (e: globalThis.MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [hovering, reduced, coarse]);

  const matrix = useMemo(() => encodeQrMatrix(SITE_QR_PAYLOAD, "H"), []);
  const followCursor = hovering && !reduced && !coarse && cursor !== null;

  // static fallback when cursor-follow is inappropriate
  const showStaticLabel = coarse || reduced;

  const onEnter = useCallback((e: MouseEvent) => {
    setHovering(true);
    setCursor({ x: e.clientX, y: e.clientY });
  }, []);

  const onLeave = useCallback(() => {
    setHovering(false);
    setCursor(null);
  }, []);

  // Portal to body: ancestors use filter/z-index and turn `fixed` into a
  // local containing block, which pulled the label off the real cursor.
  // Style matches thermal receipt ink/paper (not a dark UI chip).
  const cursorLabel =
    followCursor &&
    createPortal(
      <span
        aria-hidden
        className="receipt-scan-hint pointer-events-none fixed z-10050"
        style={
          {
            left: cursor.x + 14,
            top: cursor.y + 14,
          } satisfies CSSProperties
        }
      >
        {SCAN_LABEL}
      </span>,
      document.body,
    );

  return (
    <div className="receipt-qr relative mb-4">
      <Link
        to={INNER_HOME_PATH}
        data-cursor="link"
        aria-label={`${SCAN_LABEL} — enter site`}
        className="group relative mx-auto flex size-[11rem] items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1ea] sm:size-[12.5rem]"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
      >
        <QrSvg matrix={matrix} className="size-full" />
        {/* Center logo — keep ≤~30% of area so ECC-H can still recover.
            36% diameter ≈ 10% area; cutout lives inside the QR quiet pad. */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 flex size-[36%] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-[#f4f1ea] ring-1 ring-black/15"
        >
          <img
            src="/avatars/yii-ascii.png"
            alt=""
            width={217}
            height={225}
            draggable={false}
            className="receipt-avatar-ascii size-full scale-110 object-cover object-center select-none"
          />
        </span>
      </Link>

      {cursorLabel}

      {showStaticLabel && (
        <p className={cn("receipt-scan-hint receipt-scan-hint--static mt-2", hovering && "is-hot")}>
          {SCAN_LABEL}
        </p>
      )}
    </div>
  );
}

function QrSvg({
  matrix,
  className,
}: {
  matrix: ReturnType<typeof encodeQrMatrix>;
  className?: string;
}) {
  // Quiet zone: light modules must stay clear of dark ink. Spec wants 4;
  // 3 is enough on light receipt stock (paper continues around the SVG).
  // No filled SVG plate — paper shows through so the code sits on the receipt.
  const margin = 3;
  const dim = matrix.size + margin * 2;
  const cells: ReactNode[] = [];
  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      if (!matrix.get(r, c)) continue;
      cells.push(
        <rect key={`${r}-${c}`} x={c + margin} y={r + margin} width={1} height={1} fill="#000" />,
      );
    }
  }
  return (
    <svg
      viewBox={`0 0 ${dim} ${dim}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {cells}
    </svg>
  );
}

/* ── body blocks ────────────────────────────────────────────────────── */

/** Full-width receipt separator — glyphs flex across the paper content box. */
function DottedRule() {
  return (
    <ThermalPrint
      text={"*".repeat(36)}
      as="div"
      className="receipt-dotted-rule my-3 font-mono text-[9px] leading-none text-black"
    />
  );
}

function ReceiptBody() {
  const now = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}  ${hh}:${mm}`;
  }, []);

  return (
    <div className="font-mono text-[10px] uppercase leading-[1.55] tracking-[0.08em] text-black sm:text-[11px]">
      <div className="text-center">
        <ThermalPrint text="Yii // thatyii.dev" as="div" />
        <ThermalPrint
          text={`${now}  terminal 01`}
          as="div"
          className="mt-0.5 text-[9px] tracking-[0.06em] text-neutral-600"
        />
        <ThermalPrint
          text="inv #compiled  operator: admin"
          as="div"
          className="text-[9px] tracking-[0.06em] text-neutral-600"
        />
      </div>

      <DottedRule />

      <Block label="member name" lines={["Yii / forehalo"]} />

      <Block label="way" className="mt-2.5" lines={["scan to enter official website"]} />

      <DottedRule />

      <LogInvoice />

      <DottedRule />

      <ThermalPrint text="thank you, kindly" as="div" className="text-center tracking-[0.14em]" />
    </div>
  );
}

function Block({
  label,
  lines,
  className,
}: {
  label: string;
  lines: string[];
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <ThermalPrint text={label} as="div" className="mb-1 tracking-[0.2em] text-neutral-500" />
      <div className="normal-case tracking-[0.04em]">
        {lines.map((line) => (
          <ThermalPrint key={line} text={line} as="div" />
        ))}
      </div>
    </div>
  );
}

/**
 * Third receipt block — career log as purchase-invoice line items.
 * Data is the same COMMITS list as home `/home` log section.
 *
 * Layout per item (invoice-like):
 *   left: org/project          right: x1
 *   left: role / description
 *   right: sha · period · badge
 */
function LogInvoice() {
  return (
    <div>
      {/* section titles stay centered; item rows handle their own L/R align */}
      <ThermalPrint text="career" as="div" className="w-full text-center" />
      <div className="mt-2.5 space-y-2.5">
        {COMMITS.map((c) => (
          <InvoiceLine key={c.sha} commit={c} />
        ))}
      </div>

      <ThermalPrint text="-----" as="div" className="mt-2.5 w-full text-center" />
      <ThermalPrint text="subtotal" as="div" className="mt-2.5 w-full text-center" />
      <ThermalPrint
        text={`${COMMITS.length} commits`}
        as="div"
        className="mt-0.5 w-full text-center"
      />
      <ThermalPrint text="total due" as="div" className="mt-2.5 w-full text-center" />
      <ThermalPrint text="attention" as="div" className="mt-0.5 w-full text-center" />
      <ThermalPrint
        text="balance of curiosity due on delivery"
        as="div"
        className="mt-2.5 w-full text-center text-[9px] normal-case tracking-[0.04em] text-neutral-600"
      />
    </div>
  );
}

function InvoiceLine({ commit: c }: { commit: LogCommit }) {
  const { scope, rest } = parseLogMessage(c.message);
  const amount = logInvoiceAmount(c);
  const detail = rest || "—";
  const meta = `${c.sha} · ${c.date} · ${amount}`;

  return (
    <div className="w-full normal-case tracking-[0.04em]">
      <div className="flex w-full items-baseline justify-between gap-3 uppercase tracking-[0.08em]">
        <ThermalPrint text={scope} as="span" className="min-w-0 flex-1 text-left" />
        <ThermalPrint text="x1" as="span" className="shrink-0 text-right" />
      </div>
      <ThermalPrint
        text={detail}
        as="div"
        className="mt-0.5 text-left text-[9px] text-neutral-700"
      />
      <ThermalPrint
        text={meta}
        as="div"
        className="mt-0.5 text-right text-[9px] tracking-[0.06em] text-neutral-500"
      />
    </div>
  );
}

/* ── bold bottom wordmark ───────────────────────────────────────────── */

function Wordmark() {
  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      <span
        aria-hidden
        className="inline-block size-4 rounded-full bg-[#1a1814] ring-2 ring-[#1a1814] ring-offset-2 ring-offset-[#f4f1ea] sm:size-5"
      />
      <ThermalPrint
        text="Yii"
        as="span"
        className="font-grotesk text-[1.5rem] font-bold uppercase leading-none tracking-tight text-black sm:text-[1.75rem]"
      />
    </div>
  );
}
