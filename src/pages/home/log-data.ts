/**
 * Career log data — shared by the home log section and the receipt gate invoice.
 * Newest first, every fact verified (design.md §14 / home log).
 */

export interface FactChip {
  label: string;
  href?: string;
}

export interface LogCommit {
  sha: string;
  /** which lane owns the dot — main = companies, branch = napi-rs */
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
  facts?: FactChip[];
  diff: string[];
  /** detail-page route, rendered as `Read More →` */
  linkChip?: { to: string };
}

/** the full log — newest first, as `git log --graph` prints */
export const COMMITS: LogCommit[] = [
  {
    sha: "f0e4a11",
    lane: "main",
    head: true,
    branchLane: true,
    message: "at(one2x): independent contributor",
    tags: ["Rust", "CRDT"],
    date: "2025 →",
    facts: [{ label: "one2x.ai ↗", href: "https://one2x.ai" }],
    diff: ["+ new chapter — building at one2x"],
  },
  {
    sha: "9c3e1d7",
    lane: "main",
    branchLane: true,
    message: "at(toeverything): tech leader · ship AFFiNE",
    tags: ["Rust", "TypeScript", "CRDT"],
    date: "2023 → 2025",
    facts: [{ label: "★70.6k", href: "https://github.com/toeverything/AFFiNE" }],
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
    facts: [{ label: "★7.8k", href: "https://github.com/napi-rs/napi-rs" }],
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
    facts: [
      { label: "★744", href: "https://github.com/perfsee/perfsee" },
      { label: "inspires rsdoctor", href: "https://github.com/web-infra-dev/rsdoctor" },
    ],
    diff: [
      "+ lead dev team",
      "+ created perfsee — bundle analysis · flamegraphs · scoring",
      "+ guide teams to optimize build & runtime performance of webapps",
    ],
    linkChip: { to: "/perfsee" },
  },
  {
    sha: "1a0ff00",
    lane: "main",
    message: "at(LeetCode): frontend engineer",
    tags: ["TypeScript", "GraphQL", "React"],
    date: "2019 → 2020",
    facts: [{ label: "leetcode.cn ↗", href: "https://leetcode.cn" }],
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
    facts: [],
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
