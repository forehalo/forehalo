import { crateByPath } from "@/lib/crates";
import { formatStars } from "@/lib/projects";
import { ManPage, type ManFacts } from "@/pages/terminal/man-page";
import { affineManPage } from "@/pages/terminal/projects/man-affine";

/** this fork's crate — identity from the route registry, never a re-searched literal */
const crate = crateByPath("/affine")!;
/** registry facts — formatted here, never hardcoded */
const facts: ManFacts = {
  tagline: crate.project?.tagline,
  stars: crate.project?.stars ? formatStars(crate.project.stars) : "",
  version: crate.project?.version ?? "",
};

/**
 * /terminal/affine — man-page fork of /affine (terminal.md §projects).
 * Content lives in the data literal (@/pages/terminal/projects/man-affine),
 * rendered by the shared ManPage skeleton; stars and version are formatted
 * here from the shared registry (@/lib/projects, via the route registry).
 * Pure text — the terminal fork drops the canvas/cursor exhibits.
 */
export default function TerminalAffine() {
  return <ManPage page={affineManPage(facts)} facts={facts} />;
}
