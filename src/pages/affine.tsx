import { useEffect } from "react";
import { CanvasHero } from "@/pages/affine/canvas-hero";
import { ModeCanvas } from "@/pages/affine/mode-canvas";
import { SyncHero } from "@/pages/affine/sync-hero";
import { EngineLink } from "@/pages/affine/engine-link";
import { PROJECTS, formatStars } from "@/lib/projects";
import "@/pages/affine/affine.css";

/**
 * AFFiNE — `/affine` (the knowledge canvas).
 * The page is built from the product's own nature: blocks on an infinite
 * canvas. canvas (hero) → blocks (the same content flipped doc ⇄ edgeless,
 * draggable on the canvas) → sync (live collab doc) → engine (y-octo repo +
 * compat readout). The sync run is the retired /y-octo page, merged in
 * mid-page.
 */

const META_TITLE = "AFFiNE — the knowledge canvas · Yii";
/** the registry entry behind this page — the star count is derived */
const AFFINE = PROJECTS.find((p) => p.page === "/affine");
const META_DESC = `Liu Yi was tech leader of the AFFiNE dev team (2023 → 2025): server-side features — MCP server, access tokens, subscriptions — CI/release infra, and integrating y-octo as the CRDT engine. ${AFFINE?.stars ? `${formatStars(AFFINE.stars).slice(1)} stars` : ""}.`;

export default function Affine() {
  // page meta (restored on unmount)
  useEffect(() => {
    const prevTitle = document.title;
    const desc = document.querySelector('meta[name="description"]');
    const prevDesc = desc?.getAttribute("content") ?? null;
    document.title = META_TITLE;
    desc?.setAttribute("content", META_DESC);
    return () => {
      document.title = prevTitle;
      if (desc && prevDesc !== null) desc.setAttribute("content", prevDesc);
    };
  }, []);

  return (
    <>
      <CanvasHero />
      <SectionRule slug="blocks" />
      <ModeCanvas />
      <SectionRule slug="sync" />
      <SyncHero />
      <SectionRule slug="engine" />
      <EngineLink />
    </>
  );
}

/** every section boundary: `//` + a rendered rule + the slug + one continuous
 * 1px rule. The dashes are DOM lines, not hyphen glyphs, so nothing shows gaps. */
function SectionRule({ slug }: { slug: string }) {
  return (
    <div aria-hidden className="mx-auto flex max-w-[1360px] items-center gap-3 px-6 md:px-16">
      <span className="micro shrink-0 text-dim">{"//"}</span>
      <div className="h-px w-6 shrink-0 bg-steel" />
      <span className="micro shrink-0 text-dim">{slug}</span>
      <div className="h-px flex-1 bg-steel" />
    </div>
  );
}
