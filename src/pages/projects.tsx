import { useEffect } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/section-header";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { PROJECTS, type Project, type ProjectLogo } from "@/lib/projects";

/**
 * PROJECTS — `/projects` (projects.md §index). A card index of the projects,
 * up to three columns: logo centered on the left, name top-right, one-line
 * tagline bottom-right. Cards prefer the on-site intro page; projects
 * without one link straight to GitHub. Data comes from the shared registry
 * in @/lib/projects — nothing project-specific lives in this file.
 * Reached from the TopBar's Layers (collection) button.
 */

const META_TITLE = "projects · Yii";
const META_DESC =
  "Projects by Yii — napi-rs, AFFiNE, Perfsee, and thatyii.dev itself. Cards link to the on-site intro pages or GitHub.";

export default function Projects() {
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
    <div className="mx-auto w-full max-w-[1360px] px-6 py-10 md:px-16 md:py-14">
      <SectionHeader
        compact
        title="Projects"
        badge={<span className="micro text-dim">$ ls ~/projects</span>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((card, i) => (
          <ProjectCardView key={card.name} card={card} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProjectCardView({ card, index }: { card: Project; index: number }) {
  const reduced = useReducedMotion();

  const body = (
    <>
      {/* bare logo at the old plate's size — no background, centered
          against the two-line text block */}
      <span className="grid size-11 shrink-0 place-items-center self-center">
        <Logo logo={card.logo} name={card.name} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-bone transition-colors group-hover:text-halo">
          {card.name}
        </span>
        <span className="mt-1 block text-[12px] leading-relaxed text-ash">{card.tagline}</span>
      </span>
    </>
  );

  // h-full: the grid stretches the motion wrapper per row; the card must
  // fill it too, or single-line taglines render shorter than their row
  const className =
    "group flex h-full gap-4 rounded-[2px] border border-steel bg-carbon p-4 transition-colors hover:border-steel-soft";
  // intro page first; GitHub only when no page exists (projects.md §cards)
  const link = card.page ? (
    <Link to={card.page} data-cursor="link" className={className}>
      {body}
    </Link>
  ) : (
    <a href={card.github} target="_blank" rel="noreferrer" data-cursor="link" className={className}>
      {body}
    </a>
  );

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_COMPILE_OUT, delay: index * 0.06 }}
    >
      {link}
    </motion.div>
  );
}

function Logo({ logo, name }: { logo: ProjectLogo; name: string }) {
  switch (logo.kind) {
    case "img":
      return <img src={logo.src} alt={name} className="size-full object-contain" />;
    case "simple":
      return <logo.Icon size={40} color="currentColor" className="text-ash" />;
  }
}
