/**
 * Career log data — shared by the home log section and the receipt gate invoice.
 * Newest first, every fact verified (design.md §14 / home log).
 */
import { PROJECTS, formatStars, type Project, type ProjectFact } from "@/lib/projects";

export interface LogCommit {
  sha: string;
  /** which lane owns the dot — main = companies, branch = open source */
  lane: "main" | "branch";
  /** renders a `HEAD → main` chip; main lane starts at this dot (HEAD) */
  head?: boolean;
  /** root commit: main lane ends at this dot (no line below) */
  root?: boolean;
  /** fork row: branch lane drops in from the top and merges into the main dot */
  fork?: boolean;
  /** branch lane line runs the full row height (rows at/above the fork) */
  branchLane?: boolean;
  message: string;
  tags: string[];
  date: string;
  /** the organization itself — company site or project repo. The resume
      links the company name here; the home log shows it in the expanded row */
  link?: ProjectFact;
  /** verifiable highlights (star counts, "inspires rsdoctor") — display
      facts only; the organization URL belongs in `link`, not here */
  facts?: ProjectFact[];
  diff: string[];
  /** detail-page route, rendered as `Read More →` */
  linkChip?: { to: string };
}

/**
 * Registry-derived `★` fact for a commit, matched via its detail page
 * (projects.md §data). Star counts live once — in @/lib/projects — and
 * render here through `formatStars`; no commit hardcodes a star string.
 */
function starFact(page: string | undefined): ProjectFact[] {
  const project: Project | undefined = PROJECTS.find((p) => p.page === page);
  return project?.stars ? [{ label: formatStars(project.stars), href: project.github }] : [];
}

/** the full log — newest first, as `git log --graph` prints */
export const COMMITS: LogCommit[] = [
  {
    sha: "f0e4a11",
    lane: "main",
    head: true,
    branchLane: true,
    message: "at(one2x): independent contributor",
    tags: ["Rust", "TypeScript", "CRDT"],
    date: "2025 →",
    link: { label: "one2x.ai ↗", href: "https://one2x.ai" },
    diff: [
      "+ build dynamic workflow engine for agent of medeo.app",
      "+ build ReBAC(Google Zanzibar) system",
      "+ build collaborative video editor for medeo.app (CRDT)",
    ],
  },
  {
    sha: "fe4c0de",
    lane: "branch",
    branchLane: true,
    message: "at(vite-plus): contributor",
    tags: ["Rust", "TypeScript"],
    date: "2026 →",
    link: {
      label: "voidzero-dev/vite-plus ↗",
      href: "https://github.com/voidzero-dev/vite-plus",
    },
    // ★ count lives HERE (not the registry — vite-plus has no site page or
    // /projects card); the resume's open source section derives from it
    facts: [{ label: "★5.5k", href: "https://github.com/voidzero-dev/vite-plus" }],
    diff: [
      "+ VoidZero's unified toolchain — runtime, package manager, and frontend toolchain in one CLI (vp)",
    ],
  },
  {
    sha: "9c3e1d7",
    lane: "main",
    branchLane: true,
    message: "at(toeverything): tech leader · ship AFFiNE",
    tags: ["Rust", "TypeScript", "CRDT"],
    date: "2023 → 2025",
    link: { label: "toeverything/AFFiNE ↗", href: "https://github.com/toeverything/AFFiNE" },
    facts: starFact("/affine"),
    diff: [
      "+ led the dev team",
      "+ built y-octo (Rust CRDT engine)",
      "+ shipped AFFiNE - a collaborative knowledge base",
    ],
    linkChip: { to: "/affine" },
  },
  {
    sha: "e210c17",
    lane: "branch",
    branchLane: true,
    message: "at(napi-rs): co-creator · implemented #[napi]",
    tags: ["Rust"],
    date: "2021 →",
    link: { label: "napi.rs ↗", href: "https://napi.rs" },
    facts: starFact("/napi"),
    diff: ["+ introduce #[napi] macro for Rust → Node.js FFI"],
    linkChip: { to: "/napi" },
  },
  {
    sha: "57b2aa1",
    lane: "main",
    fork: true,
    message: "at(ByteDance): frontend architector · ship Perfsee",
    tags: ["TypeScript", "Rust"],
    date: "2020 → 2023",
    link: { label: "perfsee/perfsee ↗", href: "https://github.com/perfsee/perfsee" },
    facts: [
      ...starFact("/perfsee"),
      { label: "inspires rsdoctor", href: "https://github.com/web-infra-dev/rsdoctor" },
    ],
    diff: [
      "+ lead dev team",
      "+ created perfsee — bundle analysis · flamegraphs · scoring",
      "+ help TikTok, Douyin Live and other teams optimize build & runtime performance",
    ],
    linkChip: { to: "/perfsee" },
  },
  {
    sha: "1a0ff00",
    lane: "main",
    message: "at(LeetCode): frontend engineer",
    tags: ["TypeScript", "GraphQL", "React"],
    date: "2019 → 2020",
    link: { label: "leetcode.cn ↗", href: "https://leetcode.cn" },
    diff: [
      "+ contribute to leetcode.cn",
      "+ ship assessment platform with business partners",
      "+ monorepo governance, devtools",
    ],
  },
  {
    sha: "7d3b9c2",
    lane: "main",
    message: "at(TheNetCircle): frontend engineer",
    tags: ["TypeScript", "Vue"],
    date: "2017 → 2019",
    diff: ["+ dashboard infra"],
  },
  {
    sha: "3f9e0b1",
    lane: "main",
    root: true,
    message: "at(Soochow University): initial commit",
    tags: [],
    date: "→ 2017",
    diff: ["+ software engineering"],
  },
];

/** Parse conventional `at(scope): rest` for invoice-style short names. */
export function parseLogMessage(message: string): { scope: string; rest: string } {
  const m = message.match(/^at\(([^)]+)\):\s*(.*)$/i);
  if (m) return { scope: m[1], rest: m[2] };
  return { scope: message, rest: "" };
}

/** Right-column amount / badge for a log row (stars, HEAD, ROOT). */
export function logInvoiceAmount(c: LogCommit): string {
  if (c.head) return "HEAD";
  if (c.root) return "ROOT";
  const star = c.facts?.find((f) => f.label.startsWith("★"));
  if (star) return star.label.replace("★", "");
  return "—";
}
