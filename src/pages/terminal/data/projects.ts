/**
 * Terminal view of the shared project registry (terminal.md §data) — DERIVED
 * from @/lib/projects, the single source of truth. Never edit entries here;
 * add projects to the registry and both surfaces update. `route` is the
 * /terminal fork of the project's on-site page (absent when it has none).
 */
import { PROJECTS as REGISTRY, type ProjectFact } from "@/lib/projects";

export type { ProjectFact };

export interface ProjectEntry {
  name: string;
  tagline: string;
  description: string;
  facts: ProjectFact[];
  /** /terminal fork route — absent when the project has no fork page */
  route?: string;
}

export const PROJECTS: ProjectEntry[] = REGISTRY.map((p) => ({
  name: p.name,
  tagline: p.tagline,
  description: p.description,
  facts: p.facts,
  route: p.page ? `/terminal${p.page}` : undefined,
}));

/** Case-insensitive lookup for `show` / `open`. */
export function findProject(name: string): ProjectEntry | undefined {
  const needle = name.toLowerCase();
  return PROJECTS.find((p) => p.name.toLowerCase() === needle);
}
