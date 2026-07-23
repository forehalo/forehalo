import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
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
 * After scroll (>24px): liquid-glass — blur + saturate, translucent fill,
 * specular top edge (macOS Tahoe / Liquid Glass vocabulary, dark forge tint).
 */

const ROUTES = [
  { path: "/", label: "Index" },
  { path: "/napi", label: "#[napi]" },
  { path: "/affine", label: "AFFiNE" },
  { path: "/perfsee", label: "Perfsee" },
];

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
        "fixed inset-x-0 top-0 z-9000 h-14 border-b transition-[background-color,border-color,box-shadow,backdrop-filter,-webkit-backdrop-filter] duration-300 ease-out",
        scrolled
          ? [
              // liquid glass (dark): refracts the plate through blur + tint
              "border-white/10 bg-white/[0.06]",
              "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_-1px_0_0_rgba(255,255,255,0.04),0_8px_32px_-12px_rgba(0,0,0,0.45)]",
              "backdrop-blur-2xl backdrop-saturate-150",
              "supports-backdrop-filter:bg-white/[0.05]",
            ].join(" ")
          : "border-transparent bg-transparent shadow-none backdrop-blur-none",
      )}
    >
      {/* specular wash — only when glass is on; mimics Liquid Glass highlight */}
      {scrolled && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent"
        />
      )}

      <div className="relative flex h-full items-center justify-between gap-4 pl-4 pr-4 lg:px-6">
        {/* left: branding (hidden on home — the hero owns the name there) */}
        {pathname !== "/" ? (
          <span className="hud shrink-0 text-bone">Yii</span>
        ) : (
          <span aria-hidden className="hud shrink-0 text-transparent">
            Yii
          </span>
        )}

        {/* center: nav links */}
        <div className="hidden min-w-0 items-center gap-6 md:flex">
          <nav className="flex items-center gap-1" aria-label="pages">
            {ROUTES.map((r) => (
              <NavLink
                key={r.path}
                to={r.path}
                data-cursor="link"
                className={({ isActive }) =>
                  cn(
                    "rounded-[2px] px-2 py-1 font-mono text-[11px] transition-colors",
                    isActive ? "bg-halo-soft text-halo" : "text-dim hover:text-bone",
                  )
                }
              >
                {r.label}
              </NavLink>
            ))}
          </nav>
        </div>

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
              scrolled ? "border-white/15 bg-white/[0.04]" : "border-steel",
            )}
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
