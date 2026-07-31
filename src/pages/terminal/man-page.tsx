import type { ReactNode } from "react";
import { Fragment } from "react";
import { Link } from "react-router";
import { DocHeader, DocKv, DocList, DocSection } from "@/pages/terminal/doc";
import { PagerHint, usePager } from "@/pages/terminal/pager";

/**
 * Generic man-page renderer for the /terminal project forks (terminal.md
 * §doc) — one skeleton for every fork: DocHeader (title + tagline), the
 * ordered DocSection blocks, the SEE ALSO block and the pager footer.
 * Content is a per-project data literal (@/pages/terminal/projects/man-*);
 * crate facts (tagline / stars / version) are formatted by the page from
 * the route registry (@/lib/crates → @/lib/projects) and passed in via
 * ManFacts. Text only — nothing animates, so no reduced-motion gating is
 * needed here.
 */

/** crate facts a fork page derives from its crate and hands to the data literal */
export interface ManFacts {
  /** one-line tagline under the man-page title — crate.project.tagline */
  tagline?: string;
  /** formatted star count — per-page suffix rules ("★7.8k", "744★") */
  stars: string;
  /** latest crate version tag */
  version: string;
}

/** key/value row for a `kv` block — DocKv: cyan key, ash value */
export interface ManKvRow {
  k: string;
  children: ReactNode;
}

/** one body unit inside a DocSection */
export type ManBlock =
  | { type: "p"; className?: string; children: ReactNode }
  | { type: "list"; className?: string; items: ReactNode[] }
  | { type: "kv"; className?: string; rows: ManKvRow[] }
  | { type: "node"; children: ReactNode };

/** one DocSection: `## ` heading + ordered blocks */
export interface ManSection {
  title: string;
  blocks: ManBlock[];
}

/** one SEE ALSO link — `to` derived from the crate registry, label per-page copy */
export interface ManSeeAlsoEntry {
  key: string;
  to: string;
  label: string;
}

/** SEE ALSO block — `list` renders "+ " bulleted DocList rows, `inline` a comma-joined paragraph */
export interface ManSeeAlso {
  layout: "list" | "inline";
  entries: ManSeeAlsoEntry[];
}

/** per-project man-page content literal, rendered by <ManPage/> */
export interface ManPage {
  /** uppercase man-page title, e.g. "NAPI-RS(1)" */
  title: string;
  /** body sections in order — NAME, DESCRIPTION, … */
  sections: ManSection[];
  /** SEE ALSO — sibling forks + terminal(1) */
  seeAlso: ManSeeAlso;
}

function BlockView({ block }: { block: ManBlock }) {
  switch (block.type) {
    case "p":
      return <p className={block.className}>{block.children}</p>;
    case "list":
      if (!block.className) return <DocList items={block.items} />;
      return (
        <div className={block.className}>
          <DocList items={block.items} />
        </div>
      );
    case "kv": {
      const rows = block.rows.map((row) => (
        <DocKv key={row.k} k={row.k}>
          {row.children}
        </DocKv>
      ));
      return block.className ? <div className={block.className}>{rows}</div> : <>{rows}</>;
    }
    case "node":
      return <>{block.children}</>;
  }
}

function SeeAlso({ seeAlso }: { seeAlso: ManSeeAlso }) {
  return (
    <DocSection title="SEE ALSO">
      {seeAlso.layout === "list" ? (
        <DocList
          items={seeAlso.entries.map((entry) => (
            <Link key={entry.key} to={entry.to} className="text-halo underline">
              {entry.label}
            </Link>
          ))}
        />
      ) : (
        <p>
          {seeAlso.entries.map((entry, i) => (
            <Fragment key={entry.key}>
              <Link to={entry.to} className="text-halo underline">
                {entry.label}
              </Link>
              {i < seeAlso.entries.length - 1 ? ", " : null}
            </Fragment>
          ))}
        </p>
      )}
    </DocSection>
  );
}

/** man-page skeleton — header, sections, SEE ALSO, pager footer (terminal.md §pager) */
export function ManPage({ page, facts }: { page: ManPage; facts: ManFacts }) {
  // less(1) keys: j/k scroll, q quits to /terminal (terminal.md §pager)
  usePager();
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-6 font-mono md:px-10">
      {/* 靠左居中: vertically centered while the doc fits, top-aligned once it scrolls */}
      <div className="max-w-3xl">
        <DocHeader title={page.title} tagline={facts.tagline} />
        {page.sections.map((section) => (
          <DocSection key={section.title} title={section.title}>
            {section.blocks.map((block, i) => (
              // eslint-disable-next-line react/no-array-index-key -- static doc content
              <BlockView key={i} block={block} />
            ))}
          </DocSection>
        ))}
        <SeeAlso seeAlso={page.seeAlso} />
        <PagerHint />
      </div>
    </div>
  );
}
