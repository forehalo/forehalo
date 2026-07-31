import { crateByPath, TERMINAL_HOME_PATH } from "@/lib/crates";
import { DocLink } from "@/pages/terminal/doc";
import type { ManFacts, ManPage } from "@/pages/terminal/man-page";

/** sibling fork routes for SEE ALSO — derived from the registry */
const NAPI_FORK = crateByPath("/napi")!.fork.route;
const PERFSEE_FORK = crateByPath("/perfsee")!.fork.route;

/** the y-octo compat readout, printed verbatim from the engine section */
const COMPAT_LOG = [
  "$ cargo test --test yjs_compat",
  "running 4 tests",
  "test codec::yjs_update_roundtrip ... ok",
  "test map::concurrent_writes_converge ... ok",
  "test gc::tombstones_collect ... ok",
  "test sync::three_replicas_one_state ... ok",
  "",
  "test result: ok. 4 passed · 0 failed · 0 conflicts",
];

/**
 * /terminal/affine man-page data (terminal.md §projects). Every fact is
 * harvested from the original page (@/pages/affine.tsx + @/pages/affine/*):
 * the hero copy, the five blocks of the mode canvas, the sync claim ("many
 * cursors, one document, zero conflicts"), the y-octo engine story and its
 * (illustrative) cargo-test compat readout, the META_DESC role summary,
 * plus version and star count coming in as ManFacts, formatted by the page
 * from the shared registry (@/lib/projects, via the route registry).
 * Pure text — the terminal fork drops the canvas/cursor exhibits.
 */
export function affineManPage(facts: ManFacts): ManPage {
  return {
    title: "AFFiNE(1)",
    sections: [
      {
        title: "NAME",
        blocks: [
          {
            type: "p",
            children: <>affine — a collaborative knowledge base · v{facts.version}</>,
          },
        ],
      },
      {
        title: "DESCRIPTION",
        blocks: [
          {
            type: "p",
            children:
              "An open-source knowledge OS — the Notion/Miro alternative where every page is blocks. Write it as a doc, flip it into an edgeless whiteboard, sync it live with your team. Local-first, CRDT to the core.",
          },
          {
            type: "p",
            className: "mt-2",
            children:
              "I was tech leader of the AFFiNE dev team (2023 → 2025): server-side features — MCP server, access tokens, subscriptions — CI/release infra, and integrating y-octo as the CRDT engine.",
          },
        ],
      },
      {
        title: "Y-OCTO / CRDT ENGINE",
        blocks: [
          {
            type: "p",
            children:
              "Many cursors. One document. Zero conflicts. y-octo is a Yjs-compatible CRDT rewritten in Rust — written at AFFiNE, then wired back into AFFiNE as its collaboration engine, the CRDT underneath every doc and every edgeless canvas. CRDTs let many collaborators merge edits without a central referee.",
          },
          {
            type: "list",
            className: "mt-2",
            items: [
              "every keystroke becomes an operation carrying a unique id",
              "replicas swap operations in any order — and still converge",
              "no leader, no lock, no referee — nothing to resolve by hand",
              "merges land in microseconds, byte-for-byte identical",
            ],
          },
          {
            type: "p",
            className: "mt-2 text-dim",
            children: "compat — y-octo against the Yjs test suite:",
          },
          {
            type: "node",
            children: (
              <pre className="mt-1 text-[12px] leading-[1.9] text-dim">{COMPAT_LOG.join("\n")}</pre>
            ),
          },
        ],
      },
      {
        title: "HIGHLIGHTS",
        blocks: [
          {
            type: "list",
            items: [
              "led the dev team at toeverything, 2023 → 2025",
              "shipped AFFiNE — a collaborative knowledge base",
              "built y-octo (Rust CRDT engine), integrated back into AFFiNE",
              "server-side features: MCP server, access tokens, subscriptions",
              "CI / release infra",
              <>
                <span className="text-halo">{facts.stars}</span> on GitHub — one of the most-starred
                open-source knowledge apps
              </>,
            ],
          },
        ],
      },
      {
        title: "LINKS",
        blocks: [
          {
            type: "kv",
            className: "space-y-0",
            rows: [
              {
                k: "repo",
                children: (
                  <DocLink href="https://github.com/toeverything/AFFiNE">
                    github.com/toeverything/AFFiNE
                  </DocLink>
                ),
              },
              {
                k: "engine",
                children: (
                  <DocLink href="https://github.com/y-crdt/y-octo">
                    github.com/y-crdt/y-octo
                  </DocLink>
                ),
              },
              { k: "version", children: facts.version },
            ],
          },
        ],
      },
    ],
    seeAlso: {
      layout: "inline",
      entries: [
        { key: "napi", to: NAPI_FORK, label: "napi-rs(1)" },
        { key: "perfsee", to: PERFSEE_FORK, label: "perfsee(1)" },
        { key: "terminal", to: TERMINAL_HOME_PATH, label: "terminal(1)" },
      ],
    },
  };
}
