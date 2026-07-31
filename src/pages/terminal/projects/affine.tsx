import { Link } from "react-router";
import { formatStars } from "@/lib/projects";
import { DocHeader, DocKv, DocLink, DocList, DocSection } from "@/pages/terminal/doc";
import { PagerHint, usePager } from "@/pages/terminal/pager";
import { PROJECTS } from "@/pages/terminal/data/projects";

const entry = PROJECTS.find((p) => p.route === "/terminal/affine");
/** stars/version are registry facts — formatted here, never hardcoded */
const stars = entry?.stars ? formatStars(entry.stars) : "";
const version = entry?.version ?? "";

/**
 * /terminal/affine — man-page fork of /affine (terminal.md §projects).
 * Every fact is harvested from the original page (@/pages/affine.tsx +
 * @/pages/affine/*): the hero copy, the five blocks of the mode canvas, the
 * sync claim ("many cursors, one document, zero conflicts"), the y-octo
 * engine story and its (illustrative) cargo-test compat readout, the
 * META_DESC role summary, plus version and star count from the shared
 * registry (@/lib/projects, via the terminal adapter).
 * Pure text — the terminal fork drops the canvas/cursor exhibits.
 */

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

export default function TerminalAffine() {
  // less(1) keys: j/k scroll, q quits to /terminal (terminal.md §pager)
  usePager();
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-6 font-mono md:px-10">
      <div className="max-w-3xl">
        <DocHeader title="AFFiNE(1)" tagline={entry?.tagline} />

        <DocSection title="NAME">
          <p>affine — a collaborative knowledge base · v{version}</p>
        </DocSection>

        <DocSection title="DESCRIPTION">
          <p>
            An open-source knowledge OS — the Notion/Miro alternative where every page is blocks.
            Write it as a doc, flip it into an edgeless whiteboard, sync it live with your team.
            Local-first, CRDT to the core.
          </p>
          <p className="mt-2">
            I was tech leader of the AFFiNE dev team (2023 → 2025): server-side features — MCP
            server, access tokens, subscriptions — CI/release infra, and integrating y-octo as the
            CRDT engine.
          </p>
        </DocSection>

        <DocSection title="Y-OCTO / CRDT ENGINE">
          <p>
            Many cursors. One document. Zero conflicts. y-octo is a Yjs-compatible CRDT rewritten in
            Rust — written at AFFiNE, then wired back into AFFiNE as its collaboration engine, the
            CRDT underneath every doc and every edgeless canvas. CRDTs let many collaborators merge
            edits without a central referee.
          </p>
          <div className="mt-2">
            <DocList
              items={[
                "every keystroke becomes an operation carrying a unique id",
                "replicas swap operations in any order — and still converge",
                "no leader, no lock, no referee — nothing to resolve by hand",
                "merges land in microseconds, byte-for-byte identical",
              ]}
            />
          </div>
          <p className="mt-2 text-dim">compat — y-octo against the Yjs test suite:</p>
          <pre className="mt-1 text-[12px] leading-[1.9] text-dim">{COMPAT_LOG.join("\n")}</pre>
        </DocSection>

        <DocSection title="HIGHLIGHTS">
          <DocList
            items={[
              "led the dev team at toeverything, 2023 → 2025",
              "shipped AFFiNE — a collaborative knowledge base",
              "built y-octo (Rust CRDT engine), integrated back into AFFiNE",
              "server-side features: MCP server, access tokens, subscriptions",
              "CI / release infra",
              <>
                <span className="text-halo">{stars}</span> on GitHub — one of the most-starred
                open-source knowledge apps
              </>,
            ]}
          />
        </DocSection>

        <DocSection title="LINKS">
          <div className="space-y-0">
            <DocKv k="repo">
              <DocLink href="https://github.com/toeverything/AFFiNE">
                github.com/toeverything/AFFiNE
              </DocLink>
            </DocKv>
            <DocKv k="engine">
              <DocLink href="https://github.com/y-crdt/y-octo">github.com/y-crdt/y-octo</DocLink>
            </DocKv>
            <DocKv k="version">{version}</DocKv>
          </div>
        </DocSection>

        <DocSection title="SEE ALSO">
          <p>
            <Link to="/terminal/napi" className="text-halo underline">
              napi-rs(1)
            </Link>
            {", "}
            <Link to="/terminal/perfsee" className="text-halo underline">
              perfsee(1)
            </Link>
            {", "}
            <Link to="/terminal" className="text-halo underline">
              terminal(1)
            </Link>
          </p>
        </DocSection>

        <PagerHint />
      </div>
    </div>
  );
}
