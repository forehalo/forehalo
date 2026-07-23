import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HaloCursor } from "@/components/halo-cursor";
import { PageBackdrop } from "@/components/page-backdrop";
import { CommandPaletteProvider } from "@/components/command-palette";
import { ToastProvider } from "@/components/toaster";
import { MotionProvider, useReducedMotion } from "@/hooks/use-reduced-motion";
import { SmoothScrollProvider, useLenis } from "@/hooks/use-smooth-scroll";
import { EASE_COMPILE_OUT } from "@/lib/motion";

/**
 * Layout — global chrome for every page (design.md §8).
 *
 * ROUTING CONTRACT (pattern B, nested routes — react-dev.md): Layout renders
 * `<Outlet/>`; app.tsx wires pages as nested <Route>s under
 * `<Route element={<Layout/>}>`. Do NOT wrap pages in <Layout> manually.
 *
 * OFFSET CONTRACT: the TopBar is fixed (56px) — Layout owns the matching top
 * padding on its content slot (`pt-14`). Pages start below the bar
 * automatically — do not add nav-height padding in pages. Home (`/`) is the
 * exception: no Footer. Full-bleed heroes opt out inside the page with a
 * negative top margin (-mt-14).
 *
 * Includes: Navbar (TopBar), Footer, HaloCursor overlay, the global physics
 * backdrop, grain overlay, command palette, Lenis smooth scroll, and the
 * "recompile wipe" page transition.
 */
export function Layout() {
  // home opts out of the Footer
  const { pathname } = useLocation();
  const home = pathname === "/";

  return (
    <MotionProvider>
      <ToastProvider>
        <SmoothScrollProvider>
          <CommandPaletteProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-10001 focus:rounded-[2px] focus:border focus:border-halo focus:bg-carbon-2 focus:px-3 focus:py-2 focus:font-mono focus:text-[12px] focus:text-halo"
            >
              skip to main
            </a>

            {/* global backdrop — one star-field atmosphere for every crate */}
            <PageBackdrop />

            <Navbar />
            <RecompileWipe />

            <main id="main" className="relative z-10 pt-14">
              <Outlet />
            </main>
            {!home && (
              <div className="relative z-10">
                <Footer />
              </div>
            )}

            {/* film grain overlay: 2–3% opacity, fixed, mix-blend-overlay */}
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 z-9500 opacity-[0.028] mix-blend-overlay"
              style={{
                backgroundImage: "url(/grain.png)",
                backgroundRepeat: "repeat",
                backgroundSize: "512px 512px",
              }}
            />

            <HaloCursor />
          </CommandPaletteProvider>
        </SmoothScrollProvider>
      </ToastProvider>
    </MotionProvider>
  );
}

/* ── Page transition: "recompile wipe" (design.md §6) ───────────────────
 * On route change an amber scanline sweeps top→bottom trailing 3 mono log
 * lines; the new page reveals beneath it. Skipped on first mount and under
 * reduced motion. */
const PAGE_LOG: Record<string, { crate: string; version?: string }> = {
  "/": { crate: "index" },
  "/napi": { crate: "napi", version: "2.16.13" },
  "/affine": { crate: "AFFiNE", version: "0.25.0" },
  "/perfsee": { crate: "perfsee", version: "1.9.0" },
};

function RecompileWipe() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const first = useRef(true);
  const [wipe, setWipe] = useState<string | null>(null);

  useEffect(() => {
    // always jump to top on navigation
    if (lenis) lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    setWipe(location.pathname);
    const t = window.setTimeout(() => setWipe(null), 760);
    return () => window.clearTimeout(t);
  }, [location.pathname, reduced, lenis]);

  const log = PAGE_LOG[wipe ?? ""] ?? PAGE_LOG["/"];

  return (
    <AnimatePresence>
      {wipe && (
        <motion.div
          key={wipe}
          aria-hidden
          className="fixed inset-0 z-9600 border-t-2 border-halo bg-void"
          initial={{ y: "-100%" }}
          animate={{ y: "102%" }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.65, ease: EASE_COMPILE_OUT }}
          style={{ pointerEvents: "none" }}
        >
          {/* trailing compile log, riding the scanline */}
          <div className="absolute left-6 top-3 font-mono text-[11px] leading-relaxed md:left-20">
            <div className="text-halo">$ cargo build --page {log.crate}</div>
            <div className="text-ash">
              {"   "}Compiling {log.crate}
              {log.version ? ` v${log.version}` : ""}
            </div>
            <div className="text-node">{"    "}Finished in 0.41s</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
