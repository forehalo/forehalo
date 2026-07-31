import { crateByPath } from "@/lib/crates";
import { formatStars } from "@/lib/projects";
import { ManPage, type ManFacts } from "@/pages/terminal/man-page";
import { perfseeManPage } from "@/pages/terminal/projects/man-perfsee";

/** this fork's crate — identity from the route registry, never a re-searched literal */
const crate = crateByPath("/perfsee")!;
/** registry facts — formatted here, never hardcoded */
const facts: ManFacts = {
  tagline: crate.project?.tagline,
  // perfsee renders the star AFTER the number ("744★") — formatStars prefixes
  // it, so strip the prefix and re-add the star at the end
  stars: crate.project?.stars ? `${formatStars(crate.project.stars).slice(1)}★` : "",
  version: crate.project?.version ?? "",
};

/**
 * /terminal/perfsee — man-page fork of /perfsee (terminal.md §projects).
 * Content lives in the data literal (@/pages/terminal/projects/man-perfsee),
 * rendered by the shared ManPage skeleton; version and star count are
 * formatted here from the shared registry (@/lib/projects, via the route
 * registry). Nothing animates, so no reduced-motion gating is needed.
 */
export default function TerminalPerfsee() {
  return <ManPage page={perfseeManPage(facts)} facts={facts} />;
}
