# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

forehalo — a personal portfolio site styled as a Rust workspace/IDE ("compiled identity"). Pages are "crates", sections are `.rs` files in a compile log, page transitions are a "recompile wipe". React 19 + TypeScript + Tailwind CSS v4. Site chrome and page sections are hand-rolled (no shadcn `ui/` scaffold in tree).

## Commands

- `pnpm dev` — dev server on port 3000
- `pnpm build` — `tsc -b && vp build` (type-check + bundle)
- `pnpm lint` — `vp lint .` (type-aware; config lives in `vite.config.ts`, not a standalone eslint/oxlint config file)
- `pnpm preview` — preview production build
- `vp check --fix` — lint + format autofix; runs automatically on staged files via the pre-commit hook (`.vite-hooks/pre-commit` → `vp staged`)

No test runner is configured.

Toolchain notes:

- The package manager is pnpm 11.15.1 (enforced via `devEngines`, auto-downloaded).
- `vite`/`vite-plus` are catalog-pinned in `pnpm-workspace.yaml`; the `vite` package is actually `@voidzero-dev/vite-plus-core` and all commands go through the `vp` CLI.
- `minimumReleaseAgeExclude` entries in `pnpm-workspace.yaml` are temporary (removable after 2026-07-21).
- Path alias `@/` → `src/`.

## Architecture

### Routing contract (pattern B — nested routes)

`Layout` renders `<Outlet/>`; every page is a nested `<Route>` under `<Route element={<Layout/>}>` in `src/App.tsx`. Never wrap pages in `<Layout>` manually. All pages are lazy route chunks with a shared `PageLoader` fallback.

### Layout owns chrome and offsets

`Layout` (src/components/layout.tsx) renders the global chrome — Navbar (TopBar), Footer, link hover frame (`LinkFrame` on `data-cursor="link"`), command palette, static forge-plate backdrop (`PageBackdrop`), grain overlay — and the matching content offset: TopBar is fixed 56px (`pt-14`). Pages start below the bar automatically; do not add nav-height padding in pages. Full-bleed heroes opt out with `-mt-14`. (The left BuildRail progress sidebar was removed from every page, along with its section registry — `src/hooks/use-sections.tsx` is gone. No animated canvas backdrop. No custom cursor overlay.)

Provider nesting order in Layout: `MotionProvider → ToastProvider → SmoothScrollProvider (Lenis) → CommandPaletteProvider`.

`main.tsx` deliberately omits `React.StrictMode` — it double-runs some layout effects.

### Motion system

- Shared constants in `src/lib/motion.ts`: one master ease `EASE_COMPILE_OUT`, `DUR` scale, `TOKEN_STAGGER` (12ms/token). Use these instead of ad-hoc easings.
- Reusable primitives in `src/components/motion/`: `CompilePrint` (token-by-token text reveal, not typewriter), `MacroExpand`.
- Library split: framer-motion for all UI/reveal/scroll-linked animation (including sticky pin scrub via `useScroll`), Lenis for smooth scroll. Lenis owns scrolling (`html { scroll-behavior: auto }`); use `useScrollTo()`/`useLenis()` instead of native `window.scrollTo` for in-page navigation. Do not reintroduce GSAP.
- Reduced motion is first-class: `useReducedMotion()` combines OS `prefers-reduced-motion` with a command-palette override (persisted to localStorage, mirrored to `<html data-motion>`). Every animated component must gate decorative animation on it — the motion primitives show the pattern.

### Design tokens

All tokens live in `src/index.css` (Tailwind v4 `@theme` aliases → CSS vars on `html.dark` / `html.light`): dual forge palette, system default via `prefers-color-scheme` + `fh-theme` override (`next-themes`, FOUC bootstrap in `index.html`). Role names stay fixed (`void`/`bone`/`halo`…); values flip. Space Grotesk + JetBrains Mono (ligatures on), 2–3px radii. Custom utilities: `hud`, `micro`, `blueprint-grid`, `halo-glow-hover`, `macro-region`. Clickable chrome marked `data-cursor="link"` gets a pinned bone square frame on hover (fine pointers only); native cursor stays. See DESIGN.md §1–§2.

Code snippets on pages use the hand-rolled tokenizer in `src/lib/highlight.ts` (implements the site's syntax palette; deliberately not a general highlighter).

### Page structure

Each route has a thin page component in `src/pages/<name>.tsx` that composes section components from `src/pages/<name>/`. Shared chrome lives in `src/components/` (layout, navbar, footer, motion primitives, etc.). Do not reintroduce an unused shadcn `ui/` kit.

### Spec references in comments

Code comments cite `design.md §N`, `react-dev.md`, `home.md` — these docs are not in the repo. Treat the comments themselves as the spec; preserve them and their contracts when editing.

## Conventions

- File and directory names are kebab-case (`command-palette.tsx`, `use-reduced-motion.ts`), enforced by `unicorn/filename-case` in the `vite.config.ts` lint rules (`*.config.*` files are exempt). Identifiers inside files keep standard casing: PascalCase components, camelCase functions and `use`-prefixed hooks.
