import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Layout } from "@/components/layout";
import { StubPage } from "@/pages/stub";
import Landing from "@/pages/landing";
import TerminalLayout from "@/pages/terminal/terminal-layout";

/**
 * ROUTING CONTRACT (react-dev.md "pattern B — nested routes"):
 * Layout renders <Outlet/>, so every page is a NESTED <Route> under
 * `<Route element={<Layout/>}>`. Do NOT wrap pages in <Layout> manually and
 * do not pass routes as Layout children — the two patterns must never mix.
 *
 * Landing (`/`) is eager so first paint never flashes a Suspense loader.
 * Project crates + `/home` stay lazy route chunks (design.md §10).
 */
const Home = lazy(() => import("@/pages/home"));
const Napi = lazy(() => import("@/pages/napi"));
const Affine = lazy(() => import("@/pages/affine"));
const Perfsee = lazy(() => import("@/pages/perfsee"));
// /terminal fork pages (terminal.md) — TerminalLayout itself stays eager
const TerminalHome = lazy(() => import("@/pages/terminal"));
const TerminalNapi = lazy(() => import("@/pages/terminal/projects/napi"));
const TerminalAffine = lazy(() => import("@/pages/terminal/projects/affine"));
const TerminalPerfsee = lazy(() => import("@/pages/terminal/projects/perfsee"));

function PageLoader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <span className="font-mono text-[12px] text-dim">
        <span className="text-halo">▸</span> compiling…
      </span>
    </div>
  );
}

/** Lazy route chunk with compiling fallback (landing stays eager above). */
function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route
          path="home"
          element={
            <Lazy>
              <Home />
            </Lazy>
          }
        />
        <Route
          path="napi"
          element={
            <Lazy>
              <Napi />
            </Lazy>
          }
        />
        <Route
          path="affine"
          element={
            <Lazy>
              <Affine />
            </Lazy>
          }
        />
        {/* /y-octo is merged into /affine (sync → merge → compat → log sections) */}
        <Route path="y-octo" element={<Navigate to="/affine" replace />} />
        <Route
          path="perfsee"
          element={
            <Lazy>
              <Perfsee />
            </Lazy>
          }
        />
        <Route path="*" element={<StubPage file="404.rs" title="not found" />} />
      </Route>

      {/* /terminal fork (terminal.md): own macOS-window chrome via
          TerminalLayout (pattern B — nested routes, renders <Outlet/>);
          deliberately NOT the site Layout (no TopBar/Footer/palette/Lenis). */}
      <Route path="terminal" element={<TerminalLayout />}>
        <Route
          index
          element={
            <Lazy>
              <TerminalHome />
            </Lazy>
          }
        />
        <Route
          path="napi"
          element={
            <Lazy>
              <TerminalNapi />
            </Lazy>
          }
        />
        <Route
          path="affine"
          element={
            <Lazy>
              <TerminalAffine />
            </Lazy>
          }
        />
        <Route
          path="perfsee"
          element={
            <Lazy>
              <TerminalPerfsee />
            </Lazy>
          }
        />
      </Route>
      <Route path="tui" element={<Navigate to="/terminal" replace />} />
    </Routes>
  );
}
