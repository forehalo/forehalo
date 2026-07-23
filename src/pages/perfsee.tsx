import { useEffect } from "react";
import { ReportHero } from "@/pages/perfsee/report-hero";
import { BundleLab } from "@/pages/perfsee/bundle-lab";
import { FlameLab } from "@/pages/perfsee/flame-lab";
import { ScoreLab } from "@/pages/perfsee/score-lab";
import { LegacyOutro } from "@/pages/perfsee/legacy-outro";

/**
 * PERFSEE — `/perfsee` · the measurement lab.
 * ByteDance's frontend performance analysis platform, created & led by
 * Yii (2020–2023). The page is framed as an analysis
 * report: cover (P1) → the three instruments elevated from the home HUD —
 * bundle treemap (P2), CI flamegraph (P3), score dial (P4) — → legacy (P5),
 * sealed 2026-06-18, lineage onward to rsdoctor.
 */

const META_TITLE = "perfsee — the measurement lab · Yii";
const META_DESC =
  "Perfsee — the frontend performance & bundle analysis platform Liu Yi created and led at ByteDance. Bundle treemaps, CI flamegraphs, self-hosted scoring. Now integrated into rsdoctor.";

export default function Perfsee() {
  // page meta
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
      <ReportHero />
      <SectionRule slug="bundle" />
      <BundleLab />
      <SectionRule slug="flame" />
      <FlameLab />
      <SectionRule slug="score" />
      <ScoreLab />
      <SectionRule slug="legacy" />
      <LegacyOutro />
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
