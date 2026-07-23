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
        "fixed inset-x-0 top-0 z-9000 h-14 border-b bg-void/85 backdrop-blur-md transition-colors duration-300",
        scrolled ? "border-steel" : "border-transparent",
      )}
    >
      <div className="flex h-full items-center justify-between gap-4 pl-4 pr-4 lg:px-6">
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
            className="micro -my-1 rounded-[2px] border border-steel px-2.5 py-1.5 text-dim transition-colors hover:border-halo hover:text-halo"
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
