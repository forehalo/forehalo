import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Layout } from "@/components/layout";
import { StubPage } from "@/pages/stub";
import Landing from "@/pages/landing";
import TerminalLayout from "@/pages/terminal/terminal-layout";
import { CRATES, TERMINAL_HOME_PATH } from "@/lib/crates";

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
const Projects = lazy(() => import("@/pages/projects"));
const Resume = lazy(() => import("@/pages/resume"));
// /terminal fork index (terminal.md) — TerminalLayout itself stays eager
const TerminalHome = lazy(() => import("@/pages/terminal"));

/**
 * Crate pages + their /terminal forks come from the route registry
 * (@/lib/crates) as static lazy chunks — module scope keeps stable
 * component identity and preserves each route's code-split chunk.
 */
const CRATE_ROUTES = CRATES.map((c) => ({
  path: c.path.slice(1),
  forkPath: c.fork.route.slice(TERMINAL_HOME_PATH.length + 1),
  Page: lazy(c.load),
  ForkPage: lazy(c.fork.load),
}));

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
          path="projects"
          element={
            <Lazy>
              <Projects />
            </Lazy>
          }
        />
        <Route
          path="resume"
          element={
            <Lazy>
              <Resume />
            </Lazy>
          }
        />
        {CRATE_ROUTES.map(({ path, Page }) => (
          <Route
            key={path}
            path={path}
            element={
              <Lazy>
                <Page />
              </Lazy>
            }
          />
        ))}
        {/* /y-octo is merged into /affine (sync → merge → compat → log sections) */}
        <Route path="y-octo" element={<Navigate to="/affine" replace />} />
        <Route path="*" element={<StubPage file="404.rs" title="not found" />} />
      </Route>

      {/* /terminal fork (terminal.md): own macOS-window chrome via
          TerminalLayout (pattern B — nested routes, renders <Outlet/>);
          deliberately NOT the site Layout (no TopBar/Footer/palette/Lenis). */}
      <Route path={TERMINAL_HOME_PATH.slice(1)} element={<TerminalLayout />}>
        <Route
          index
          element={
            <Lazy>
              <TerminalHome />
            </Lazy>
          }
        />
        {CRATE_ROUTES.map(({ forkPath, ForkPage }) => (
          <Route
            key={forkPath}
            path={forkPath}
            element={
              <Lazy>
                <ForkPage />
              </Lazy>
            }
          />
        ))}
      </Route>
      <Route path="tui" element={<Navigate to={TERMINAL_HOME_PATH} replace />} />
    </Routes>
  );
}
