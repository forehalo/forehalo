import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { Layers } from "lucide-react";
import { useCommandPalette } from "@/components/command-palette";
import { INNER_HOME_PATH, PROJECTS_PATH } from "@/lib/crates";
import { cn } from "@/lib/utils";

/**
 * Navbar — the design's TopBar (§8.2).
 *
 * Positioning: TopBar is `fixed` (56px) — Layout adds matching top padding to
 * its content slot. Pages must not add their own offsets. (Receipt landing `/`
 * hides this bar entirely via Layout.)
 *
 * Material: fully transparent at rest (reads as part of the forge plate).
 * After scroll (>24px): `forge-liquid-glass` — ultra-translucent tint,
 * blur + saturate + brightness refraction, multi-layer inset light. Tokens in
 * `src/index.css` (`--nav-glass-*`) flip with light/dark.
 *
 * Page routes live in the command palette / footer — the single exception is
 * the projects index, which earns a TopBar button (Layers = collection).
 * Horizontal padding is fixed `--forge-inset` so brand / chrome align with the
 * forge plate registration marks (corner L-brackets).
 */

export function Navbar() {
  return <TopBar />;
}

/* ── §8.2 TopBar ──────────────────────────────────────────────────────── */

function TopBar() {
  const { pathname } = useLocation();
  const { toggle } = useCommandPalette();
  const [scrolled, setScrolled] = useState(false);
  const onIdentityHome = pathname === INNER_HOME_PATH;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        /* do not use Tailwind backdrop-blur-* here — it rewrites backdrop-filter
           via --tw-backdrop-* composites and fights the real glass stack in prod */
        "fixed inset-x-0 top-0 z-9000 h-14 transition-[background-color,box-shadow] duration-300 ease-out print:hidden",
        scrolled ? "forge-liquid-glass" : "border-0 bg-transparent shadow-none",
      )}
    >
      <div
        className="relative flex h-full items-center justify-between gap-4"
        style={{ paddingLeft: "var(--forge-inset)", paddingRight: "var(--forge-inset)" }}
      >
        {/* left: branding → identity home (hidden there — the hero owns the name) */}
        {!onIdentityHome ? (
          <Link
            to={INNER_HOME_PATH}
            data-cursor="link"
            className="hud shrink-0 text-bone transition-colors hover:text-halo"
            aria-label="Yii — home"
          >
            Yii
          </Link>
        ) : (
          <span aria-hidden className="hud shrink-0 text-transparent">
            Yii
          </span>
        )}

        {/* right: projects · socials · palette hint */}
        <div className="flex shrink-0 items-center gap-3">
          {/* collection icon → the projects card index */}
          <Link
            to={PROJECTS_PATH}
            data-cursor="link"
            aria-label="projects"
            title="projects"
            className={cn(
              "inline-flex p-1.5 transition-colors hover:text-halo",
              pathname === PROJECTS_PATH ? "text-halo" : "text-ash",
            )}
          >
            <Layers size={16} />
          </Link>
          <a
            href="https://github.com/forehalo"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub @forehalo"
            data-cursor="link"
            className="inline-flex p-1.5 text-ash transition-colors hover:text-halo"
          >
            <SiGithub size={16} color="currentColor" />
          </a>
          <a
            href="https://x.com/forehalo"
            target="_blank"
            rel="noreferrer"
            aria-label="X @forehalo"
            data-cursor="link"
            className="inline-flex p-1.5 text-ash transition-colors hover:text-halo"
          >
            <SiX size={16} color="currentColor" />
          </a>
          <button
            onClick={toggle}
            data-cursor="link"
            className={cn(
              "micro -my-1 rounded-[2px] border px-2.5 py-1.5 text-dim transition-colors hover:border-halo hover:text-halo",
              !scrolled && "border-steel",
            )}
            style={
              scrolled
                ? {
                    borderColor: "var(--nav-glass-btn-border)",
                    backgroundColor: "var(--nav-glass-btn-bg)",
                  }
                : undefined
            }
            aria-label="open command palette"
            title="command palette"
          >
            ~
          </button>
        </div>
      </div>
    </header>
  );
}
