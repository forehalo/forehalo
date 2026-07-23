import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Layout } from "@/components/layout";
import { StubPage } from "@/pages/stub";

/**
 * ROUTING CONTRACT (react-dev.md "pattern B — nested routes"):
 * Layout renders <Outlet/>, so every page is a NESTED <Route> under
 * `<Route element={<Layout/>}>`. Do NOT wrap pages in <Layout> manually and
 * do not pass routes as Layout children — the two patterns must never mix.
 *
 * Home is eager (landing); sub-pages are lazy route chunks (design.md §10
 * performance budget).
 */
const Home = lazy(() => import("@/pages/home"));
const Napi = lazy(() => import("@/pages/napi"));
const Affine = lazy(() => import("@/pages/affine"));
const Perfsee = lazy(() => import("@/pages/perfsee"));

function PageLoader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <span className="font-mono text-[12px] text-dim">
        <span className="text-halo">▸</span> compiling…
      </span>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="napi"
          element={
            <Suspense fallback={<PageLoader />}>
              <Napi />
            </Suspense>
          }
        />
        <Route
          path="affine"
          element={
            <Suspense fallback={<PageLoader />}>
              <Affine />
            </Suspense>
          }
        />
        {/* /y-octo is merged into /affine (sync → merge → compat → log sections) */}
        <Route path="y-octo" element={<Navigate to="/affine" replace />} />
        <Route
          path="perfsee"
          element={
            <Suspense fallback={<PageLoader />}>
              <Perfsee />
            </Suspense>
          }
        />
        <Route path="*" element={<StubPage file="404.rs" title="not found" />} />
      </Route>
    </Routes>
  );
}
