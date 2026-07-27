import { useState } from "react";
import { GEAR, GEAR_HEADER } from "@/pages/terminal/data/gear";

/**
 * Welcome — classic terminal login banner (terminal.md §welcome). The `Last
 * login` line hugs the left margin like a real tty; the two hero columns
 * beneath it shrink-wrap and center horizontally (md+), while the page
 * container keeps the whole block vertically centered until the REPL grows.
 * A terminal welcome prints INSTANTLY, so
 * there is no typing animation — this also satisfies reduced motion
 * (design.md §9). Left column reprints the home hero identity verbatim
 * (@/pages/home/hero.tsx INTRO_LINES); right column is a neofetch-style
 * gear block from @/pages/terminal/data/gear.
 */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** `Mon Jul 27 14:32:05 2026` — how a login banner prints it */
function loginStamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${WEEKDAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getFullYear()}`;
}

/** figlet-style "Yii" — the name banner a login shell would print */
const YII_ASCII = [
  "__   __   _   _",
  "\\ \\ / /  (_) (_)",
  " \\ V /    _   _",
  "  | |    | | | |",
  "  | |    | | | |",
  "  |_|    |_| |_|",
].join("\n");

export function Welcome() {
  // login timestamp is fixed at mount
  const [now] = useState(() => new Date());

  return (
    <section aria-label="welcome">
      <div className="text-[13px] text-dim">Last login: {loginStamp(now)} on ttys000</div>
      {/* hero block: two shrink-wrapped columns, horizontally centered on md+ */}
      <div className="mt-6 grid gap-10 md:mx-auto md:w-fit md:grid-cols-[auto_auto]">
        {/* identity — same copy as the home hero, printed statically; the
            name renders as ASCII art (sr keeps the plain text) */}
        <div>
          <div className="text-[12px] tracking-[0.14em] text-dim">#[derive(Human)]</div>
          <div className="mb-6 text-[12px] tracking-[0.14em] text-dim">#[alias(forehalo)]</div>
          <h1 className="sr-only">Yii</h1>
          {/* the whole banner leans as one block (skew, not per-glyph
              italic) so the ASCII grid stays intact; stacked 1px shadows in
              forge tokens extrude it into a retro 3D plate */}
          <pre
            aria-hidden
            className="-skew-x-12 text-[13px] leading-[1.2] text-bone origin-bottom-left"
            style={{
              textShadow: [
                "1px 1px 0 var(--steel)",
                "2px 2px 0 var(--steel)",
                "3px 3px 0 var(--dim)",
                "4px 4px 0 var(--dim)",
                "5px 5px 0 var(--dim)",
                "6px 6px 0 var(--void)",
              ].join(", "),
            }}
          >
            {YII_ASCII}
          </pre>
          <div className="mt-4 text-[13px] leading-[1.9] text-dim">i lead teams, write code.</div>
          <div className="text-[13px] leading-[1.9] text-dim">
            i instruct people — and <span className="text-ash">agents</span> —
          </div>
          <div className="text-[13px] leading-[1.9] text-dim">to build, to optimize, to ship,</div>
          <div className="text-[13px] leading-[1.9] text-dim">to live my life.</div>
        </div>

        {/* gear — neofetch style, real device facts (no serials/UUIDs);
            top-aligned with the identity column, not centered against it */}
        <div className="self-start text-[13px] leading-[1.9]">
          <div className="text-halo">{GEAR_HEADER}</div>
          <div aria-hidden className="text-dim">
            {"─".repeat(GEAR_HEADER.length)}
          </div>
          {GEAR.map((g) => (
            <div key={g.key}>
              <span className="text-wasi-cyan">{g.key}</span>
              <span className="text-dim">: </span>
              <span className="text-ash">{g.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
