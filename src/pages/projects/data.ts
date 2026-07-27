import { SiAffine } from "@icons-pack/react-simple-icons";

/**
 * Project card registry for `/projects` (projects.md §cards). Facts stay
 * consistent with @/pages/home/log-data (stars, repos) — every entry has a
 * GitHub URL; entries with an on-site intro page (`page`) link there first,
 * the rest link out to GitHub.
 */

export type ProjectLogo =
  | { kind: "img"; src: string; alt: string }
  | { kind: "simple"; Icon: typeof SiAffine };

export interface ProjectCard {
  name: string;
  /** one-sentence intro (card lower half) */
  tagline: string;
  /** on-site intro page — preferred card target */
  page?: string;
  /** fallback card target when no intro page exists */
  github: string;
  logo: ProjectLogo;
}

export const PROJECT_CARDS: ProjectCard[] = [
  {
    name: "napi-rs",
    tagline: "Pre-compiled Node.js addons in Rust — one attribute, zero glue.",
    page: "/napi",
    github: "https://github.com/napi-rs/napi-rs",
    logo: { kind: "img", src: "/projects/napi-favicon.png", alt: "napi-rs" },
  },
  {
    name: "AFFiNE",
    tagline: "A collaborative knowledge base — local-first, CRDT to the core.",
    page: "/affine",
    github: "https://github.com/toeverything/AFFiNE",
    logo: { kind: "simple", Icon: SiAffine },
  },
  {
    name: "Perfsee",
    tagline: "Frontend performance analysis — bundle treemaps, flamegraphs, scoring.",
    page: "/perfsee",
    github: "https://github.com/perfsee/perfsee",
    // official mark from the repo (bytedance/perfsee, assets/logo.svg)
    logo: { kind: "img", src: "/projects/perfsee-logo.svg", alt: "Perfsee" },
  },
  {
    name: "thatyii.dev",
    tagline: "This site — a portfolio compiled as a living Rust workspace.",
    github: "https://github.com/forehalo/forehalo",
    logo: { kind: "img", src: "/projects/avatar-glyph-transparent.svg", alt: "thatyii.dev" },
  },
];
