import type { ComponentType } from "react";
import { INNER_HOME_PATH, PROJECTS_PATH, TERMINAL_HOME_PATH } from "@/lib/routes";
import { PROJECTS, type Project } from "@/lib/projects";

/**
 * ROUTE REGISTRY — the single module that owns "what pages exist"
 * (design.md §6, §10, terminal.md). Every crate is ONE entry here; the
 * route table (app.tsx), the recompile-wipe labels (Layout), the command
 * palette / footer links, the terminal window titles and the /terminal
 * fork routes all DERIVE from CRATES — adding a crate means one edit here
 * (+ its page files), nothing else.
 *
 * The stable route paths (INNER_HOME_PATH, PROJECTS_PATH,
 * TERMINAL_HOME_PATH) are DEFINED in @/lib/routes — scripts/verify-qr.mjs
 * reads that file as text, so the literals must stay there — and
 * re-exported here so chrome imports all route facts from one module.
 */

export { INNER_HOME_PATH, PROJECTS_PATH, TERMINAL_HOME_PATH };

/** static lazy chunk loader — each crate keeps its own code-split chunk */
export type CrateLoader = () => Promise<{ default: ComponentType }>;

export interface CrateFork {
  /** /terminal fork route, e.g. "/terminal/napi" */
  route: string;
  /** TerminalWindow title for this fork (terminal.md §layout) */
  title: string;
  /** lazy chunk loader for the fork page */
  load: CrateLoader;
}

export interface Crate {
  /** on-site page path, e.g. "/napi" */
  path: string;
  /** display label — command palette + footer ("#[napi]", "AFFiNE", "Perfsee") */
  label: string;
  /** crate name in the recompile-wipe log (design.md §6) */
  crate: string;
  /** latest version tag — derived from Project.version (projects.md §data) */
  version?: string;
  /** project facts backing this crate (man-page tagline / stars / version) */
  project?: Project;
  /** lazy chunk loader for the site page */
  load: CrateLoader;
  /** the /terminal fork of this page */
  fork: CrateFork;
}

/** project facts for the crate's page path — undefined when no project maps */
const projectFor = (path: string): Project | undefined => PROJECTS.find((p) => p.page === path);

export const CRATES: Crate[] = [
  {
    path: "/napi",
    label: "#[napi]",
    crate: "napi",
    version: projectFor("/napi")?.version,
    project: projectFor("/napi"),
    load: () => import("@/pages/napi"),
    fork: {
      route: "/terminal/napi",
      title: "yii@thatyii:~/projects/napi-rs",
      load: () => import("@/pages/terminal/projects/napi"),
    },
  },
  {
    path: "/affine",
    label: "AFFiNE",
    crate: "AFFiNE",
    version: projectFor("/affine")?.version,
    project: projectFor("/affine"),
    load: () => import("@/pages/affine"),
    fork: {
      route: "/terminal/affine",
      title: "yii@thatyii:~/projects/affine",
      load: () => import("@/pages/terminal/projects/affine"),
    },
  },
  {
    path: "/perfsee",
    label: "Perfsee",
    crate: "perfsee",
    version: projectFor("/perfsee")?.version,
    project: projectFor("/perfsee"),
    load: () => import("@/pages/perfsee"),
    fork: {
      route: "/terminal/perfsee",
      title: "yii@thatyii:~/projects/perfsee",
      load: () => import("@/pages/terminal/projects/perfsee"),
    },
  },
];

/** look up a crate by its on-site page path — undefined for chrome paths */
export function crateByPath(path: string): Crate | undefined {
  return CRATES.find((c) => c.path === path);
}
