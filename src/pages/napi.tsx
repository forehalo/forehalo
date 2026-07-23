import { useEffect } from "react";
import { HeroAttribute } from "@/pages/napi/hero-attribute";
import { Expander } from "@/pages/napi/expander";
import { Anatomy } from "@/pages/napi/anatomy";
import "@/pages/napi/napi.css";

/**
 * NAPI — `/napi` · crates/napi.rs (napi.md).
 * The flagship contribution told as the artifact it is — a proc macro. The
 * page is structured like the macro's own pipeline:
 *   annotation (N1 the attribute — also carries the napi.rs/repo links) →
 *   expansion (N2 the Expander, pinned before/after morph) →
 *   anatomy (N3 annotated callouts).
 */

const META_TITLE = "#[napi] — the macro that binds Rust to Node · Yii";
const META_DESC =
  "Most of the #[napi] proc macro in napi-rs v2 was implemented by Liu Yi. The story of the attribute that made Rust→Node.js native addons ergonomic.";

export default function Napi() {
  // page meta (napi.md §Meta)
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
      <HeroAttribute />
      <SectionRule slug="expansion" />
      <Expander />
      <SectionRule slug="anatomy" />
      <Anatomy />
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
