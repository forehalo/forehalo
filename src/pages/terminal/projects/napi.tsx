import { crateByPath } from "@/lib/crates";
import { formatStars } from "@/lib/projects";
import { ManPage, type ManFacts } from "@/pages/terminal/man-page";
import { napiManPage } from "@/pages/terminal/projects/man-napi";

/** this fork's crate — identity from the route registry, never a re-searched literal */
const crate = crateByPath("/napi")!;
/** registry facts — formatted here, never hardcoded */
const facts: ManFacts = {
  tagline: crate.project?.tagline,
  stars: crate.project?.stars ? formatStars(crate.project.stars) : "",
  version: crate.project?.version ?? "",
};

/**
 * /terminal/napi — the napi project page re-rendered as a man page
 * (terminal.md §projects). Content lives in the data literal
 * (@/pages/terminal/projects/man-napi), rendered by the shared ManPage
 * skeleton; stars and crate version are formatted here from the route
 * registry (@/lib/crates → @/lib/projects). Text only — nothing animates,
 * so no reduced-motion gating is needed.
 */
export default function TerminalNapi() {
  return <ManPage page={napiManPage(facts)} facts={facts} />;
}
