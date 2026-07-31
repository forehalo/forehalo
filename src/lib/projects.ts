import { SiAffine } from "@icons-pack/react-simple-icons";

/**
 * SINGLE SOURCE OF TRUTH for the project registry (projects.md §data).
 * Both the `/projects` card index and the /terminal fork (`ls projects`,
 * `show`, `open`) derive their view models from this list — add a project
 * HERE once and both surfaces pick it up:
 *   - card grid: title / tagline / logo, linking to `page`, `github`, or `url`
 *   - terminal: name / tagline / description / facts, `open` targets the
 *     /terminal fork of `page` (derived), or hints `url`/`github`
 * Every fact must be real (design.md §14). Star counts and versions are
 * structured fields (`stars` / `version`); the `★` display is derived via
 * `formatStars`, and @/pages/home/log-data derives its star facts from here.
 */

export interface ProjectFact {
  label: string;
  href?: string;
}

export type ProjectLogo = { kind: "img"; src: string } | { kind: "simple"; Icon: typeof SiAffine };

/**
 * Format a raw star count for display (projects.md §data): ≥1000 → one
 * decimal + lowercase k (7800 → "★7.8k"), else the bare count ("★744").
 * The only place a `★` display string is derived — never hardcode one.
 */
export function formatStars(stars: number): string {
  return stars >= 1000 ? `★${(stars / 1000).toFixed(1)}k` : `★${stars}`;
}

export interface Project {
  /** terminal lookup key (`show <name>`) and default display name */
  name: string;
  /** display name when it differs from the terminal key (card grid) */
  title?: string;
  /** one-sentence intro (card lower half, `ls projects` right column) */
  tagline: string;
  /** longer paragraph for the terminal `show` detail block */
  description: string;
  /** on-site intro page — preferred card target; its /terminal fork route
      is derived as `/terminal${page}` */
  page?: string;
  /** source repo — omitted for private repos (never link those) */
  github?: string;
  /** live deployment, when the project has one */
  url?: string;
  /** raw GitHub star count — display is derived via `formatStars` */
  stars?: number;
  /** latest version tag, for the /terminal man-page forks */
  version?: string;
  facts: ProjectFact[];
  logo: ProjectLogo;
}

export const PROJECTS: Project[] = [
  {
    name: "napi-rs",
    tagline: "Pre-compiled Node.js addons in Rust — one attribute, zero glue.",
    description:
      "Co-creator. Introduced the #[napi] macro, lowering the barrier of binding Rust crates to Node.js native addons and WASI.",
    page: "/napi",
    github: "https://github.com/napi-rs/napi-rs",
    stars: 7800,
    version: "2.16.13",
    facts: [{ label: "Rust" }],
    logo: { kind: "img", src: "/projects/napi-favicon.png" },
  },
  {
    name: "AFFiNE",
    tagline: "A collaborative knowledge base — local-first, CRDT to the core.",
    description:
      "Tech leader 2023 → 2025. Led the dev team, built y-octo (a Rust CRDT engine), and shipped AFFiNE.",
    page: "/affine",
    github: "https://github.com/toeverything/AFFiNE",
    stars: 70600,
    version: "0.25.0",
    facts: [{ label: "Rust" }, { label: "TypeScript" }, { label: "CRDT" }],
    logo: { kind: "simple", Icon: SiAffine },
  },
  {
    name: "Perfsee",
    tagline: "Frontend performance analysis — bundle treemaps, flamegraphs, scoring.",
    description:
      "Created at ByteDance — an analyzer for measuring bundles and runtime performance of web applications; inspires rsdoctor.",
    page: "/perfsee",
    github: "https://github.com/perfsee/perfsee",
    stars: 744,
    version: "1.9.0",
    facts: [{ label: "inspires rsdoctor", href: "https://github.com/web-infra-dev/rsdoctor" }],
    logo: { kind: "img", src: "/projects/perfsee-logo.svg" },
  },
  {
    name: "thatreceipt",
    title: "That Receipt",
    tagline: "Design a cyber thermal paper receipt in the browser.",
    description:
      "A browser toy for cyber thermal receipts — paper grain, faded ink, missing characters, print-head skip lines, crumple wear. Share a link or save a PNG.",
    url: "https://receipt.thatyii.dev",
    facts: [
      { label: "receipt.thatyii.dev ↗", href: "https://receipt.thatyii.dev" },
      { label: "React 19" },
    ],
    logo: { kind: "img", src: "/projects/thatreceipt.svg" },
  },
  {
    name: "thatyii.dev",
    tagline: "This site — a portfolio compiled as a living Rust workspace.",
    description:
      "Pages are crates, sections are .rs files in a compile log, page transitions are a recompile wipe. Hand-rolled chrome and motion, no UI kit.",
    github: "https://github.com/forehalo/forehalo",
    url: "https://thatyii.dev",
    facts: [
      { label: "React 19" },
      { label: "TypeScript" },
      { label: "Tailwind CSS v4" },
      { label: "framer-motion" },
      { label: "Lenis" },
      { label: "thatyii.dev ↗", href: "https://thatyii.dev" },
    ],
    logo: { kind: "img", src: "/projects/avatar-glyph-transparent.svg" },
  },
];
