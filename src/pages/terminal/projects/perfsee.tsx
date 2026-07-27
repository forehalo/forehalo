import { Link } from "react-router";
import { DocHeader, DocKv, DocLink, DocList, DocSection } from "@/pages/terminal/doc";
import { PagerHint, usePager } from "@/pages/terminal/pager";
import { PROJECTS } from "@/pages/terminal/data/projects";

const entry = PROJECTS.find((p) => p.route === "/terminal/perfsee");

/**
 * /terminal/perfsee — man-page fork of /perfsee (terminal.md §projects).
 * Pure text retelling of the measurement lab; every fact is lifted from
 * src/pages/perfsee/* (report cover facts, the three instruments, legacy
 * outro) plus the crate version from PAGE_LOG in @/components/layout.tsx.
 * 靠左居中: vertically centered while the doc fits, top-aligned once it
 * scrolls. Nothing animates, so no reduced-motion gating is needed.
 */
export default function TerminalPerfsee() {
  // less(1) keys: j/k scroll, q quits to /terminal (terminal.md §pager)
  usePager();
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-6 font-mono md:px-10">
      <div className="max-w-3xl">
        <DocHeader title="PERFSEE(1)" tagline={entry?.tagline} />

        <DocSection title="NAME">
          <p>
            perfsee — frontend performance analysis platform. bundle treemap · flamegraph · score
            dial. self-hosted, runs in ci.
          </p>
        </DocSection>

        <DocSection title="DESCRIPTION">
          <p>
            Perfsee is ByteDance&apos;s frontend performance analysis platform — an analyzer for
            measuring bundles and runtime performance of web applications. Yii created and led the
            project at ByteDance (2020–2023), where he worked as frontend architect and guided teams
            to optimize the build &amp; runtime performance of webapps.
          </p>
          <div className="mt-2">
            <DocKv k="role">creator · leader</DocKv>
            <DocKv k="org">ByteDance</DocKv>
            <DocKv k="era">2020–2023</DocKv>
            <DocKv k="version">1.9.0</DocKv>
            <DocKv k="stars">744★</DocKv>
            <DocKv k="language">TypeScript · Rust</DocKv>
          </div>
        </DocSection>

        <DocSection title="CAPABILITIES">
          <p className="mb-2">three instruments, one report per build:</p>
          <DocList
            items={[
              <>
                <span className="text-bone">bundle treemap</span> — every kilobyte, on the record.
                parsed &amp; gzip size per module, and the signature move: a bundle diff on every
                PR, changed modules flagged with their ±kB deltas.
              </>,
              <>
                <span className="text-bone">flamegraph</span> — where the build hours go. the ci
                build drawn as a flamegraph; each frame reads out self/total time.
              </>,
              <>
                <span className="text-bone">score dial</span> — one number to defend.
                lighthouse-style performance scoring, self-hosted; lab metrics (fcp · lcp · tbt ·
                cls) held against their budgets.
              </>,
            ]}
          />
        </DocSection>

        <DocSection title="LEGACY">
          <p>
            The project has been integrated into{" "}
            <DocLink href="https://github.com/web-infra-dev/rsdoctor">rsdoctor</DocLink> — the
            measurement lives on inside the next toolchain. Perfsee inspires rsdoctor.
          </p>
        </DocSection>

        <DocSection title="LINKS">
          <DocKv k="repo">
            <DocLink href="https://github.com/bytedance/perfsee">bytedance/perfsee</DocLink>
          </DocKv>
          <DocKv k="successor">
            <DocLink href="https://github.com/web-infra-dev/rsdoctor">
              web-infra-dev/rsdoctor
            </DocLink>
          </DocKv>
        </DocSection>

        <DocSection title="SEE ALSO">
          <DocList
            items={[
              <Link key="napi" to="/terminal/napi" className="text-halo underline">
                NAPI-RS(1)
              </Link>,
              <Link key="affine" to="/terminal/affine" className="text-halo underline">
                AFFINE(1)
              </Link>,
              <Link key="terminal" to="/terminal" className="text-halo underline">
                terminal(1)
              </Link>,
            ]}
          />
        </DocSection>

        <PagerHint />
      </div>
    </div>
  );
}
