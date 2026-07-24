import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { useCommandPalette } from "@/components/command-palette";
import { cn } from "@/lib/utils";

/**
 * Navbar — the design's TopBar (§8.2).
 *
 * Positioning: TopBar is `fixed` (56px) — Layout adds matching top padding to
 * its content slot. Pages must not add their own offsets.
 *
 * Material: fully transparent at rest (reads as part of the forge plate).
 * After scroll (>24px): `forge-liquid-glass` — ultra-translucent tint,
 * blur + saturate + brightness refraction, multi-layer inset light. Tokens in
 * `src/index.css` (`--nav-glass-*`) flip with light/dark.
 *
 * Page routes live in the command palette / footer — not as TopBar links.
 */

export function Navbar() {
  return <TopBar />;
}

/* ── §8.2 TopBar ──────────────────────────────────────────────────────── */

function TopBar() {
  const { pathname } = useLocation();
  const { toggle } = useCommandPalette();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-9000 h-14 transition-[background-color,border-color,box-shadow,backdrop-filter,-webkit-backdrop-filter] duration-300 ease-out",
        scrolled ? "forge-liquid-glass" : "border-0 bg-transparent shadow-none backdrop-blur-none",
      )}
    >
      <div className="relative flex h-full items-center justify-between gap-4 pl-4 pr-4 lg:px-6">
        {/* left: branding (hidden on home — the hero owns the name there) */}
        {pathname !== "/" ? (
          <span className="hud shrink-0 text-bone">Yii</span>
        ) : (
          <span aria-hidden className="hud shrink-0 text-transparent">
            Yii
          </span>
        )}

        {/* right: socials · palette hint */}
        <div className="flex shrink-0 items-center gap-3">
          <a
            href="https://github.com/forehalo"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub @forehalo"
            data-cursor="link"
            className="-m-1.5 inline-flex p-1.5 text-ash transition-colors hover:text-halo"
          >
            <SiGithub size={16} color="currentColor" />
          </a>
          <a
            href="https://x.com/forehalo"
            target="_blank"
            rel="noreferrer"
            aria-label="X @forehalo"
            data-cursor="link"
            className="-m-1.5 inline-flex p-1.5 text-ash transition-colors hover:text-halo"
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
