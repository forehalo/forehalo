import { crateByPath, TERMINAL_HOME_PATH } from "@/lib/crates";
import { DocLink } from "@/pages/terminal/doc";
import type { ManFacts, ManPage } from "@/pages/terminal/man-page";

/** sibling fork routes for SEE ALSO — derived from the registry */
const NAPI_FORK = crateByPath("/napi")!.fork.route;
const AFFINE_FORK = crateByPath("/affine")!.fork.route;

/**
 * /terminal/perfsee man-page data (terminal.md §projects). Pure text
 * retelling of the measurement lab; every fact is lifted from
 * src/pages/perfsee/* (report cover facts, the three instruments, legacy
 * outro), with version and star count coming in as ManFacts, formatted by
 * the page from the shared registry (@/lib/projects, via the route
 * registry). Nothing animates, so no reduced-motion gating is needed.
 */
export function perfseeManPage(facts: ManFacts): ManPage {
  return {
    title: "PERFSEE(1)",
    sections: [
      {
        title: "NAME",
        blocks: [
          {
            type: "p",
            children:
              "perfsee — frontend performance analysis platform. bundle treemap · flamegraph · score dial. self-hosted, runs in ci.",
          },
        ],
      },
      {
        title: "DESCRIPTION",
        blocks: [
          {
            type: "p",
            children:
              "Perfsee is ByteDance's frontend performance analysis platform — an analyzer for measuring bundles and runtime performance of web applications. Yii created and led the project at ByteDance (2020–2023), where he worked as frontend architect and guided teams to optimize the build & runtime performance of webapps.",
          },
          {
            type: "kv",
            className: "mt-2",
            rows: [
              { k: "role", children: "creator · leader" },
              { k: "org", children: "ByteDance" },
              { k: "era", children: "2020–2023" },
              { k: "version", children: facts.version },
              { k: "stars", children: facts.stars },
              { k: "language", children: "TypeScript · Rust" },
            ],
          },
        ],
      },
      {
        title: "CAPABILITIES",
        blocks: [
          {
            type: "p",
            className: "mb-2",
            children: "three instruments, one report per build:",
          },
          {
            type: "list",
            items: [
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
            ],
          },
        ],
      },
      {
        title: "LEGACY",
        blocks: [
          {
            type: "p",
            children: (
              <>
                The project has been integrated into{" "}
                <DocLink href="https://github.com/web-infra-dev/rsdoctor">rsdoctor</DocLink> — the
                measurement lives on inside the next toolchain. Perfsee inspires rsdoctor.
              </>
            ),
          },
        ],
      },
      {
        title: "LINKS",
        blocks: [
          {
            type: "kv",
            rows: [
              {
                k: "repo",
                children: (
                  <DocLink href="https://github.com/bytedance/perfsee">bytedance/perfsee</DocLink>
                ),
              },
              {
                k: "successor",
                children: (
                  <DocLink href="https://github.com/web-infra-dev/rsdoctor">
                    web-infra-dev/rsdoctor
                  </DocLink>
                ),
              },
            ],
          },
        ],
      },
    ],
    seeAlso: {
      layout: "list",
      entries: [
        { key: "napi", to: NAPI_FORK, label: "NAPI-RS(1)" },
        { key: "affine", to: AFFINE_FORK, label: "AFFINE(1)" },
        { key: "terminal", to: TERMINAL_HOME_PATH, label: "terminal(1)" },
      ],
    },
  };
}
