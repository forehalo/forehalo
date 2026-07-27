/**
 * Project registry for the terminal fork (terminal.md §data) — every fact is
 * real and consistent with @/pages/home/log-data (star counts, roles, dates).
 * `route` points at the project's /terminal fork page; thatyii.dev has none
 * because it IS the current site.
 */

export interface ProjectFact {
  label: string;
  href?: string;
}

export interface ProjectEntry {
  name: string;
  tagline: string;
  description: string;
  facts: ProjectFact[];
  /** /terminal fork route — absent when the project has no fork page */
  route?: string;
}

export const PROJECTS: ProjectEntry[] = [
  {
    name: "thatyii.dev",
    tagline: "this site — a personal portfolio compiled as a Rust workspace",
    description:
      "Pages are crates, sections are .rs files in a compile log, page transitions are a recompile wipe. Hand-rolled chrome and motion, no UI kit.",
    facts: [
      { label: "React 19" },
      { label: "TypeScript" },
      { label: "Tailwind CSS v4" },
      { label: "framer-motion" },
      { label: "Lenis" },
      { label: "thatyii.dev ↗", href: "https://thatyii.dev" },
    ],
    // no route — it IS the current site
  },
  {
    name: "napi-rs",
    tagline: "Rust → Node.js FFI, lowered to a procedural macro",
    description:
      "Co-creator. Introduced the #[napi] macro, lowering the barrier of binding Rust crates to Node.js native addons and WASI.",
    facts: [{ label: "★7.8k", href: "https://github.com/napi-rs/napi-rs" }, { label: "Rust" }],
    route: "/terminal/napi",
  },
  {
    name: "AFFiNE",
    tagline: "a collaborative knowledge base",
    description:
      "Tech leader 2023 → 2025. Led the dev team, built y-octo (a Rust CRDT engine), and shipped AFFiNE.",
    facts: [
      { label: "★70.6k", href: "https://github.com/toeverything/AFFiNE" },
      { label: "Rust" },
      { label: "TypeScript" },
      { label: "CRDT" },
    ],
    route: "/terminal/affine",
  },
  {
    name: "Perfsee",
    tagline: "bundle analysis · flamegraphs · scoring",
    description:
      "Created at ByteDance — an analyzer for measuring bundles and runtime performance of web applications; inspires rsdoctor.",
    facts: [
      { label: "★744", href: "https://github.com/perfsee/perfsee" },
      { label: "inspires rsdoctor", href: "https://github.com/web-infra-dev/rsdoctor" },
    ],
    route: "/terminal/perfsee",
  },
];

/** Case-insensitive lookup for `show` / `open`. */
export function findProject(name: string): ProjectEntry | undefined {
  const needle = name.toLowerCase();
  return PROJECTS.find((p) => p.name.toLowerCase() === needle);
}
