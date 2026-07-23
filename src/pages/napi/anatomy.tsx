import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/section-header";
import { AttributeChip } from "@/components/attribute-chip";
import { MacroExpand } from "@/components/motion/macro-expand";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * N3 · Anatomy of the Macro (napi.md §N3).
 * The AFTER code block with annotated callout lines — 1px steel SVG elbows
 * drawn from each token to margin notes (stroke-dashoffset draw, 500ms,
 * staggered 120ms by vertical order). Then the capability chips grid —
 * each chip hover-expands a one-line explanation via macroExpand.
 * On <lg the SVG elbows are hidden and notes stack beneath the code.
 */

type TokenId = "attr" | "name" | "args" | "ret" | "body";

const NOTES: { id: TokenId; text: React.ReactNode }[] = [
  {
    id: "attr",
    text: (
      <>
        <span className="text-halo">proc_macro_attribute</span> · parses your fn with{" "}
        <span className="text-bone/80">syn</span>, emits the whole N-API surface
      </>
    ),
  },
  {
    id: "name",
    text: (
      <>
        name exported to JS as-is — or rename with{" "}
        <span className="text-halo">#[napi(js_name = "add")]</span>
      </>
    ),
  },
  { id: "args", text: <>Rust ⇄ JS type marshalling, generated per platform</> },
  { id: "ret", text: <>return value converted; errors become JS exceptions</> },
  { id: "body", text: <>your code. unchanged. that's the point.</> },
];

export function Anatomy() {
  return (
    <section id="anatomy" className="relative scroll-mt-14 py-24">
      <div className="mx-auto max-w-[1360px] px-6 md:px-16">
        <SectionHeader slug="anatomy" title="What four characters generate" />
        <CalloutDiagram />
        <CapabilityChips />
      </div>
    </section>
  );
}

/* ── code block + SVG elbow callouts ────────────────────────────────────── */

function CalloutDiagram() {
  const reduced = useReducedMotion();
  const { ref: viewRef, inView } = useInViewOnce<HTMLDivElement>(0.35);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tokenRefs = useRef<Partial<Record<TokenId, HTMLSpanElement | null>>>({});
  const noteRefs = useRef<Partial<Record<TokenId, HTMLDivElement | null>>>({});
  const [paths, setPaths] = useState<string[]>([]);
  const [hovered, setHovered] = useState<TokenId | null>(null);

  // measure token → note geometry, rebuild on resize
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const compute = () => {
      const box = container.getBoundingClientRect();
      const next: string[] = [];
      for (const n of NOTES) {
        const tok = tokenRefs.current[n.id];
        const note = noteRefs.current[n.id];
        if (!tok || !note) return;
        const t = tok.getBoundingClientRect();
        const r = note.getBoundingClientRect();
        const x1 = t.right - box.left + 6;
        const y1 = t.top + t.height / 2 - box.top;
        const x2 = r.left - box.left - 10;
        const y2 = r.top + r.height / 2 - box.top;
        const elbowX = x1 + 28;
        next.push(`M ${x1} ${y1} H ${elbowX} V ${y2} H ${x2}`);
      }
      setPaths(next);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(container);
    window.addEventListener("resize", compute);
    // token positions shift when the mono font swaps in — recompute after load
    let alive = true;
    void document.fonts?.ready.then(() => {
      if (alive) compute();
    });
    return () => {
      alive = false;
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, []);

  const tok = (id: TokenId, className: string, children: React.ReactNode) => (
    <span
      ref={(el) => {
        tokenRefs.current[id] = el;
      }}
      className={cn(
        className,
        "rounded-[2px] px-0.5 transition-colors duration-200",
        hovered === id && "bg-halo-soft",
      )}
    >
      {children}
    </span>
  );

  return (
    <motion.div
      ref={viewRef}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE_COMPILE_OUT }}
    >
      <div ref={containerRef} className="relative grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* the AFTER code block */}
        <div className="rounded-[3px] border border-steel bg-carbon" data-cursor="read">
          <div className="border-b border-steel px-4 py-2">
            <span className="font-mono text-[11px] text-ash">sum.rs</span>
          </div>
          <div className="px-4 py-4 font-mono text-[14px] leading-[2.1]">
            <div className="whitespace-pre">
              {tok("attr", "text-halo [text-shadow:0_0_8px_rgba(255,180,58,0.45)]", "#[napi]")}
            </div>
            <div className="whitespace-pre">
              <span className="text-halo">fn</span> {tok("name", "text-bone", "sum")}
              <span className="text-ash">(</span>
              {tok(
                "args",
                "",
                <>
                  <span className="text-bone/80">a</span>
                  <span className="text-ash">: </span>
                  <span className="text-wasi-cyan">i32</span>
                  <span className="text-ash">, </span>
                  <span className="text-bone/80">b</span>
                  <span className="text-ash">: </span>
                  <span className="text-wasi-cyan">i32</span>
                </>,
              )}
              <span className="text-ash">) </span>
              {tok(
                "ret",
                "",
                <>
                  <span className="text-ash">-&gt; </span>
                  <span className="text-wasi-cyan">i32</span>
                </>,
              )}
              <span className="text-ash"> {"{"}</span>
            </div>
            <div className="whitespace-pre">
              {"  "}
              {tok("body", "text-bone/80", "a + b")}
            </div>
            <div className="whitespace-pre">
              <span className="text-ash">{"}"}</span>
            </div>
          </div>
        </div>

        {/* margin notes */}
        <div className="flex flex-col justify-center gap-5">
          {NOTES.map((n) => (
            <div
              key={n.id}
              ref={(el) => {
                noteRefs.current[n.id] = el;
              }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              data-cursor="expand"
              className={cn(
                "font-mono text-[12px] leading-relaxed transition-colors duration-200",
                hovered === n.id ? "text-bone" : "text-ash",
              )}
            >
              <span className="micro mr-2 text-dim">&gt;</span>
              {n.text}
            </div>
          ))}
        </div>

        {/* elbow callouts (desktop only) */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        >
          {paths.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke="var(--steel)"
              strokeWidth="1"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 0.5, ease: EASE_COMPILE_OUT, delay: 0.2 + i * 0.12 }}
            />
          ))}
        </svg>
      </div>
    </motion.div>
  );
}

/* ── capability chips grid ──────────────────────────────────────────────── */

interface Capability {
  key: string;
  chip: React.ReactNode;
  gloss: string;
}

const CAPABILITIES: Capability[] = [
  {
    key: "async",
    chip: (
      <>
        <AttributeChip name="napi" pulseDelay={0.4} />{" "}
        <span className="font-mono text-[12px] text-bone/80">async fn</span>
      </>
    ),
    gloss: "→ Promise — the JS runtime awaits your Future",
  },
  {
    key: "struct",
    chip: (
      <>
        <AttributeChip name="napi" pulseDelay={1.1} />{" "}
        <span className="font-mono text-[12px] text-bone/80">struct</span>
      </>
    ),
    gloss: "→ JS class — methods, getters, factories",
  },
  {
    key: "factory",
    chip: <AttributeChip name="napi" arg="factory" pulseDelay={1.8} />,
    gloss: "constructors from Rust — new YourStruct() straight from JS",
  },
  {
    key: "ts_return_type",
    chip: <AttributeChip name="napi" arg="ts_return_type" pulseDelay={2.5} />,
    gloss: "override the emitted .d.ts when inference isn't enough",
  },
  {
    key: "tsfn",
    chip: <TypeChip label="ThreadsafeFunction" />,
    gloss: "call back into JS from any Rust thread, safely",
  },
  {
    key: "wasi",
    chip: <TypeChip label="WASI target" />,
    gloss: "the same macro compiles to wasm32-wasi — Node optional",
  },
];

function TypeChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      data-cursor="expand"
      className="inline-flex items-baseline rounded-[2px] border border-steel px-1.5 py-0.5 font-mono text-[12px] text-wasi-cyan transition-colors duration-200 hover:border-wasi-cyan/60"
    >
      {label}
    </button>
  );
}

function CapabilityChips() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.25);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <motion.div
      ref={ref}
      className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {CAPABILITIES.map((c) => (
        <motion.div
          key={c.key}
          variants={{
            hidden: reduced ? {} : { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_COMPILE_OUT } },
          }}
          className="halo-glow-hover rounded-[3px] border border-steel bg-carbon p-4"
          onMouseEnter={() => setOpen(c.key)}
          onMouseLeave={() => setOpen((v) => (v === c.key ? null : v))}
          onFocus={() => setOpen(c.key)}
          onBlur={() => setOpen((v) => (v === c.key ? null : v))}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 text-left"
            onClick={() => setOpen((v) => (v === c.key ? null : c.key))}
            aria-expanded={open === c.key}
            data-cursor="expand"
          >
            {c.chip}
          </button>
          <MacroExpand open={open === c.key}>
            <p className="pt-2 font-mono text-[11px] leading-relaxed text-ash">
              <span className="text-dim">// </span>
              {c.gloss}
            </p>
          </MacroExpand>
        </motion.div>
      ))}
    </motion.div>
  );
}
