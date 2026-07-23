import type { CSSProperties } from "react";

/**
 * PageBackdrop — static forge plate behind every route.
 *
 * Design intent (static only — no canvas, no rAF):
 *   1. Ambient wells — a whisper of halo (warm) and wasi-cyan (cool) so the
 *      void has temperature, not flat fill.
 *   2. Modular engineering grid — major 96px + minor 24px, mask-faded toward
 *      the content center so type stays clean and the plate reads at the edges.
 *   3. Registration marks — print/CAD crop brackets at the four corners.
 *   4. Blueprint hatch — a single soft diagonal field in the lower-right,
 *      like a section mark on a drawing.
 *   5. Edge vignette — pulls focus inward without competing with chrome.
 *
 * Grain still lives in Layout (above content). This layer is z-0 only.
 */
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1 · ambient wells */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 72% 52% at 88% 8%, rgba(255,180,58,0.06), transparent 58%)",
            "radial-gradient(ellipse 55% 48% at 6% 92%, rgba(111,227,249,0.028), transparent 52%)",
            "radial-gradient(ellipse 50% 40% at 50% 110%, rgba(255,92,40,0.02), transparent 55%)",
          ].join(", "),
        }}
      />

      {/* 2 · modular grid (edge-weighted) — solid majors + dashed minors */}
      <div
        className="absolute inset-0"
        style={{
          // quieter under the reading column; stronger toward frame edges
          maskImage:
            "radial-gradient(ellipse 72% 68% at 50% 42%, transparent 12%, rgba(0,0,0,0.35) 48%, black 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 72% 68% at 50% 42%, transparent 12%, rgba(0,0,0,0.35) 48%, black 82%)",
        }}
      >
        {/* major 96px solid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "linear-gradient(to right, rgba(42,47,56,0.5) 1px, transparent 1px)",
              "linear-gradient(to bottom, rgba(42,47,56,0.5) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "96px 96px",
          }}
        />
        {/* minor 24px dashed (SVG pattern — CSS gradients can't dash cleanly) */}
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="forge-minor-dash" width="24" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M24 0v24M0 24h24"
                fill="none"
                stroke="rgba(42,47,56,0.55)"
                strokeWidth="1"
                strokeDasharray="2.5 3.5"
                vectorEffect="non-scaling-stroke"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#forge-minor-dash)" />
        </svg>
      </div>

      {/* 3 · registration / crop marks */}
      <RegistrationMarks />

      {/* 4 · blueprint hatch (lower-right only) */}
      <div
        className="absolute -right-16 -bottom-24 size-[min(52vw,480px)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-42deg, transparent 0 9px, rgba(139,144,152,0.55) 9px 10px)",
          opacity: 0.07,
          maskImage: "radial-gradient(ellipse 70% 70% at 60% 60%, black 0%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 60% 60%, black 0%, transparent 72%)",
        }}
      />

      {/* 5 · edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 40%, transparent 40%, rgba(7,8,10,0.55) 100%)",
        }}
      />
    </div>
  );
}

/* L-brackets at each corner — 1px steel, 18×18, inset so TopBar still owns the top */
function RegistrationMarks() {
  const arm = 18;
  const thick = 1;
  const inset = 20;
  const color = "rgba(42, 47, 56, 0.85)"; // steel-soft at ~85%

  const mark = (pos: CSSProperties, h: "left" | "right", v: "top" | "bottom") => (
    <span
      key={`${h}-${v}`}
      className="absolute"
      style={{
        width: arm,
        height: arm,
        ...pos,
        boxShadow: "none",
        background: "transparent",
        // two sides of the L via borders
        borderTop: v === "top" ? `${thick}px solid ${color}` : undefined,
        borderBottom: v === "bottom" ? `${thick}px solid ${color}` : undefined,
        borderLeft: h === "left" ? `${thick}px solid ${color}` : undefined,
        borderRight: h === "right" ? `${thick}px solid ${color}` : undefined,
      }}
    />
  );

  return (
    <>
      {mark({ top: inset + 40 /* clear TopBar */, left: inset }, "left", "top")}
      {mark({ top: inset + 40, right: inset }, "right", "top")}
      {mark({ bottom: inset, left: inset }, "left", "bottom")}
      {mark({ bottom: inset, right: inset }, "right", "bottom")}
    </>
  );
}
