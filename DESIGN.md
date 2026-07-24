# FOREHALO — Design Standards

The design system of the forehalo site, distilled from the current code. This
document covers **rules only** — color, type, shape, motion, chrome, a11y,
performance. Page content and copy live in the pages themselves, not here.

---

## 0. Concept

In Rust, an attribute macro sits **before** the function — literally _fore_ it — and transforms everything beneath it. A halo hovers above the chosen.

**The website is a single living Rust source file, and the visitor's cursor is the procedural macro.** The cursor renders as a thin amber **halo ring** that morphs around whatever it can transform. Scrolling advances a persistent **compile log** on the left edge. Pages are "crates", sections are `.rs` files, page transitions are a recompile. Nothing is decorated for decoration's sake: every visual is an act of compilation, expansion, linking, or merging.

### Experience pillars

1. **Expansion** — the core verb. Hover/click "expands" annotated things into their generated form (macro expansion as UI).
2. **Bridging** — Rust ⇄ Node; two color-worlds (rust-amber ⇄ node-green) meet at the halo.
3. **Merging** — CRDTs: simulated collaborator cursors edit live text without conflict — presence as decoration.

---

## 1. Design Principles

1. **Code is the ornament.** No stock imagery. Beauty comes from typography, real code, mono labels, 1px rules, and generative particles.
2. **The cursor performs.** Every interactive element reacts within 80 ms.
3. **Facts over filler.** Every number on the site is real and verified.
4. **Forge dual theme, warm signal.** Role tokens (`void`, `carbon`, `bone`, `halo`…) stay fixed; only their values flip. Dark is a near-black forge; light is **warm paper**, never cold gray SaaS. One amber halo is the hot signal in both. Meaning-accents (rust orange, node green, cyan) appear only where their _meaning_ appears.
5. **System by default.** Appearance follows `prefers-color-scheme` unless the visitor overrides to light, dark, or system (persisted). First paint must match the resolved theme (no flash).
6. **Fast, then fancy.** Content is readable with motion reduced; the site must feel instant.

---

## 2. Color System

### 2.1 Architecture

- **Role tokens** live as CSS custom properties on `html.dark` / `html.light` (with a dark pre-class fallback on `:root`). Names are **roles**, not materials: `bone` is “primary text”, even when it is dark ink on light paper.
- **Tailwind utilities** map through `@theme { --color-void: var(--void); … }` so `bg-void`, `text-bone`, `border-steel` recolor automatically when the root class flips.
- **shadcn mirrors** (`background`, `foreground`, `card`, `primary`…) alias the same forge vars.
- **Chrome plate tokens** (`--forge-*`, `--nav-glass-*`, `--grain-*`) retune backdrop, navbar glass, and film grain per theme.
- **Do not** fork pages with `dark:` / `light:` product styles. Prefer token values. JS that paints (canvas, heat maps) reads tokens via `getComputedStyle` / `readCssToken()` and re-renders on theme change.

### 2.2 Theme runtime

| Piece      | Behavior                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Default    | `system` — OS `prefers-color-scheme`                                                                                                |
| Override   | `light` \| `dark` \| `system`                                                                                                       |
| Storage    | `localStorage` key `fh-theme` (`src/lib/theme.ts` → `THEME_STORAGE_KEY`)                                                            |
| Root class | `html.dark` or `html.light` (via `next-themes` `attribute="class"`)                                                                 |
| FOUC       | Blocking script in `index.html` applies the resolved class **before** first paint; keep resolve rules in sync with `resolveTheme()` |
| UI         | Command palette: `theme: system` · `theme: dark` · `theme: light` (plus a cycle entry)                                              |

Resolved theme always collapses to `light` or `dark`. `color-scheme` is set to match so native form controls and scrollbars agree.

### 2.3 Token roles (both themes)

| Token        | Role                                                         |
| ------------ | ------------------------------------------------------------ |
| `void`       | Page background                                              |
| `carbon`     | Panels, cards, code blocks                                   |
| `carbon-2`   | Raised surfaces, palette                                     |
| `steel`      | 1px borders, hairlines                                       |
| `steel-soft` | Hover borders, dashed "macro region" borders                 |
| `bone`       | Primary text                                                 |
| `ash`        | Secondary text, comments (`// like this`)                    |
| `dim`        | Line numbers, disabled, faint labels                         |
| `halo`       | **Primary signal.** Cursor ring, active states, key numbers  |
| `halo-soft`  | Halo glows, tag backgrounds, selection tint                  |
| `rust`       | Rust-side accent ONLY                                        |
| `node`       | JS/Node-side accent ONLY (generated `.js/.d.ts`, checkmarks) |
| `wasi-cyan`  | "Current" accent — live clock, HEAD chips, links to _now_    |
| `danger`     | Diff deletions — used sparingly                              |

### 2.4 Dark forge values

| Token        | Value                   |
| ------------ | ----------------------- |
| `void`       | `#07080A`               |
| `carbon`     | `#0D0F12`               |
| `carbon-2`   | `#121519`               |
| `steel`      | `#1C2027`               |
| `steel-soft` | `#2A2F38`               |
| `bone`       | `#EDE9DF`               |
| `ash`        | `#8B9098`               |
| `dim`        | `#4C525B`               |
| `halo`       | `#FFB43A`               |
| `halo-soft`  | `rgba(255,180,58,0.14)` |
| `rust`       | `#FF5C28`               |
| `node`       | `#8CC84B`               |
| `wasi-cyan`  | `#6FE3F9`               |
| `danger`     | `#FF4D4D`               |

### 2.5 Light forge values (warm paper)

| Token        | Value                                          |
| ------------ | ---------------------------------------------- |
| `void`       | `#F4F1EA`                                      |
| `carbon`     | `#FFFDF8`                                      |
| `carbon-2`   | `#EFEAE1`                                      |
| `steel`      | `#DDD6C8`                                      |
| `steel-soft` | `#C4BBAB`                                      |
| `bone`       | `#14161A`                                      |
| `ash`        | `#5A5F68`                                      |
| `dim`        | `#8B9098`                                      |
| `halo`       | `#C98512` (deeper amber for contrast on paper) |
| `halo-soft`  | `rgba(201,133,18,0.14)`                        |
| `rust`       | `#E04A1A`                                      |
| `node`       | `#5A9E2E`                                      |
| `wasi-cyan`  | `#1A9FB8`                                      |
| `danger`     | `#D93636`                                      |

**Ratios** (both themes): ~85% void/carbon surfaces · ~10% bone/ash text · ~4% halo signal · ~1% rust/node/cyan meaning-accents.

**Syntax palette** (code snippets only, `src/lib/highlight.ts`): keywords `halo`, types `wasi-cyan`, strings `node`, numbers `rust`, comments `dim`, punctuation `ash`, attributes always `halo` with a soft glow (token-driven).

**Background**: solid `void` + static **forge plate** (`PageBackdrop`) — ambient halo/cyan wells, edge-weighted modular grid (96/24px), corner registration marks, soft blueprint hatch, vignette — all driven by `--forge-*` vars. Film grain uses `--grain-opacity` / `--grain-blend` (overlay on dark, multiply on light). No animated canvas; depth without motion.

---

## 3. Typography

**Fonts (Google Fonts, `font-display: swap`):**

- **Space Grotesk** (500/700) — display headlines, page titles. Geometric, engineered, warm.
- **JetBrains Mono** (400/500/700, ligatures ON) — code, labels, HUD, nav, buttons, captions. The site's native voice.

**Type scale** (desktop; clamps to mobile):

| Name         | Spec                                                           | Use                                    |
| ------------ | -------------------------------------------------------------- | -------------------------------------- |
| `display-xl` | Space Grotesk 700, clamp(40px, 6vw, 84px), lh 0.92, ls −0.03em | Hero name                              |
| `display-lg` | Space Grotesk 700, clamp(44px, 7vw, 96px), lh 0.95, ls −0.02em | Section titles                         |
| `display-md` | Space Grotesk 700, clamp(24px, 3vw, 36px)                      | Compact section titles (single-screen) |
| `hud`        | JetBrains Mono 500, 11px, uppercase, ls 0.18em                 | Labels, tags, rail, buttons            |
| `code`       | JetBrains Mono 400, 14–15px, lh 1.7                            | Code blocks                            |
| `body`       | Space Grotesk 500, 16–18px, lh 1.6                             | Paragraphs (bone/80%)                  |
| `micro`      | JetBrains Mono 400, 10px, ls 0.08em                            | Line numbers, footnotes, timestamps    |

**Conventions**: All UI chrome is mono. Statements are grotesk. Section titles may go mono (`font-mono`) when the title _is_ a command. Code always shows a 1px `steel` frame with a mono filename tab.

---

## 4. Spacing, Grid, Shape

- **Base unit** 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 160.
- **Grid**: max-width 1360px, page padding 24px (mobile) → 64px (desktop). (The left BuildRail strip was removed — no rail, no offset.)
- **Radius**: sharp by default — 2px on cards/buttons, 3px on code blocks, **perfect circles only for halos** (cursor ring, status dots).
- **Borders**: 1px `steel`. Interactive hover: 1px `steel-soft` + `halo-soft` glow. Dashed 1px `steel-soft` = "macro region" (expandable zone).
- **Elevation**: no drop shadows except halo glows. Depth is conveyed by borders, tints, and ≤2-layer motion parallax.
- **Section boundaries**: a continuous rule row — `//` marker + a short DOM-rendered 1px line + the section slug + a 1px line filling the rest. Dash runs are DOM lines, never hyphen glyphs (hyphens render with character gaps).

---

## 5. The Halo Cursor (signature system)

Replaces the native cursor on fine-pointer devices (`body.halo-cursor-active`). Touch devices: native behavior; expansions trigger on tap.

**Anatomy**: 26px diameter ring, 1.5px `bone`@60% stroke; 3px `halo` center dot. 60fps transform-only movement, ~180ms trailing ease (lerp 0.18) so it glides like a presence, not a pointer. **The ring never explains itself — no attribute tag labels, no hint chips.**

**States**, driven by `data-cursor` attributes on hovered elements (each morphs the ring geometry, 180ms expo-out):

| `data-cursor` | Context                   | Ring behavior                                   |
| ------------- | ------------------------- | ----------------------------------------------- |
| —             | Default                   | 26px ring                                       |
| `link`        | Links, buttons            | Morphs toward element bounds                    |
| `expand`      | Expandable (macro region) | Grows, stroke dashed, slow rotation             |
| `read`        | Code block                | Ring splits into a caret pair hugging the block |
| `move`        | Draggable token           | Pinches, dot becomes crosshair                  |
| `ffi`         | Rust ⇄ JS boundary        | Ellipse tinted `rust`→`node` by x-position      |
| `sync`        | CRDT presence demo        | Collaborator color band                         |

**Selection**: text selection is `halo-soft` background with `bone` text.

---

## 6. Motion Language

Shared constants in `src/lib/motion.ts`.

**Easing**: one master ease — `cubic-bezier(0.16, 1, 0.3, 1)` ("compile-out": instant attack, long silk settle). Secondary `cubic-bezier(0.7, 0, 0.2, 1)` for exits. No bounce, no linear except marquees/rotations.

**Durations** (`DUR`): micro 200ms · UI 380ms · section choreography 900ms · page transition 650ms.

**Named, reusable effects:**

- **`compilePrint`** (`src/components/motion/compile-print.tsx`) — text appears token-by-token (not char-by-char typewriter): 2px rise + opacity 0→1, 12ms/token stagger (`TOKEN_STAGGER`).
- **`macroExpand`** (`src/components/motion/macro-expand.tsx`) — an annotated block unfolds: content height animates 0→auto with inner content fading up; reverses on collapse. Used for expandable rows and regions.
- **`countUp`** (`src/hooks/use-count-up.ts`) — stats tick from 0 with mono tabular-nums, compile-out.

**Typing intros**: when a sequence types character-by-character (the home hero), follow the rhythm, not the duration: boilerplate prints fast (~18ms/char), key beats land slower (~80ms), prose keeps a readable voice (~22ms); one deliberate breath (≈400ms) before the final act, short pauses (~140ms) elsewhere; downstream reveals **overlap** the ending instead of waiting for it. The caret is a thin bar that must never affect layout — zero-height outer box, bar painted absolutely from the baseline; untyped text renders `invisible` so nothing reflows.

**Stagger discipline**: lists stagger 50–80ms, never more than ~10 items animating concurrently.

**Page transition — "recompile wipe"** (`src/components/layout.tsx`): on route change, an amber scanline sweeps top→bottom (650ms) trailing 3 mono log lines (`$ cargo build --page X` → `Compiling X` → `Finished`), the new page reveals beneath it. Skipped on first mount and under reduced motion.

---

## 7. Scroll System

- **Lenis** smooth scroll owns scrolling (`html { scroll-behavior: auto }`, `src/hooks/use-smooth-scroll.tsx`). In-page navigation goes through `useScrollTo()`/`useLenis()`, never native `window.scrollTo`.
- Scroll progress is ambient only (recompile wipe) — there is no progress rail.
- **Pins**: at most ONE pinned sequence per page (CSS sticky + framer-motion `useScroll`), and only when it drives a _transformation_. No decorative pinning.
- Reveals fire once (`useInViewOnce`) and gate on reduced motion.

---

## 8. Shared Components (global chrome)

### 8.1 BuildRail — REMOVED

The left progress rail (vertical compile log with live percentages, mobile hairline, rail clock) was deleted from every page, along with its section registry (`useBuildRailSections`, `SectionsProvider`) and all rail-width layout offsets. Pages have no side rail; the TopBar is the only fixed chrome.

### 8.2 TopBar

Fixed, height 56px. At rest: fully transparent (reads with the forge plate). After 24px scroll: liquid-glass — `backdrop-blur-2xl` + saturate, translucent white tint, specular top edge, soft depth shadow.

- Left: `Yii` wordmark (hud style) — plain text, no click behavior; hidden on home (the hero owns the name there).
- Center: nav links to the pages (first-letter uppercase labels; `AFFiNE` keeps its brand casing; the napi-rs page is labeled `#[napi]`).
- Right: GitHub + X icon links (16px, `ash`→`halo` hover, padded hit areas) · `~` palette chip.

### 8.3 Command Palette (`~` or ⌘K / Ctrl+K)

Center-top overlay (`carbon-2`, 1px `steel`, radius 3px), opens with scale 0.98→1 + fade. Mono input, fuzzy-find with matched chars in `halo`. Commands: `open →` each page · `copy → email` (toast `✓ copied to clipboard`) · `motion → reduce / full` · `theme → system | dark | light` (persists to `fh-theme`, follows OS when system). ESC closes; fully keyboard navigable.

### 8.4 AttributeChip

The signature nav/link atom: mono 12px, format `#[name]` or `#[name(arg)]`, `halo` text, dashed `steel-soft` underline-offset box; active = solid `halo-soft` chip.

### 8.5 HaloButton

Primary CTA: mono 12px uppercase ls 0.18em, 1px `steel` border, bone text. Hover: border→`halo`, background `halo-soft`, text `halo`, glow; press: scale 0.97. Secondary variant: borderless, `ash`→`halo` with an arrow that translates on hover.

### 8.6 CodeBlock

`carbon` panel, mono filename tab, line numbers (`dim`), syntax palette per §2, optional `data-cursor="read"`, copy button (`copy`→`copied ✓`).

### 8.7 Footer (all pages **except home**)

Full-width `carbon` panel, top border 1px `steel`.

- **Contact command block** (left): CodeBlock-styled terminal (`$ cargo add forehalo` / `Adding forehalo to dependencies`) + the email as a HaloButton; on copy, a fake progress bar animates (`compiling friendship… 100% ✓`).
- **Link columns** (hud labels + mono links): `links` — GitHub (icon prefix), X @forehalo (`x` prefix), forehalo.com (`◦` prefix) · `projects` — site nav.
- **Bottom line** (micro, `dim`): just `© {current year} Liu Yi` — year computed at render.
- Terminal block reveals via `compilePrint`; links stagger.

### 8.8 SectionHeader

Per-section title (`display-lg`, or `display-md` + `font-mono` for compact/command-style headers) with optional badge. Animates: title words rise 24px, stagger 70ms. An optional `start` prop lets a page gate the reveal on an external trigger. The section's slug marker lives on the boundary rule (§4) — the header renders no marker of its own.

---

## 9. Accessibility & Reduced Motion

- `prefers-reduced-motion` plus a command-palette override (`motion → reduce`, persisted to localStorage, mirrored to `<html data-motion>`; `useReducedMotion()` combines both): decorative animation is gated everywhere — typing intros print instantly, cursor → native, reveals become instant. **No content is motion-gated.**
- Focus-visible: `halo` outline + halo-soft glow — focus looks like the cursor's halo.
- All canvas is decorative (`aria-hidden`); all info duplicated in semantic HTML.
- Keyboard: palette, expandable rows, and all nav fully operable; skip-link to main.

## 10. Performance Budget

- One canvas effect per viewport max; particles pause off-screen (IntersectionObserver).
- ≤10 simultaneously animating elements per viewport; reveals fire once.
- `React.StrictMode` is deliberately omitted (`main.tsx`) — it double-runs canvas/cursor effects.
- Sub-pages are lazy route chunks; target the home chunk staying lean.

## 11. Dependencies

`react@19`, `typescript`, `vite` (vite-plus), `tailwindcss@4` (theme in `src/index.css`, no config file), `shadcn/ui` primitives (new-york, restyled), `framer-motion` (all UI/reveal/scroll-linked animation), `lenis` (smooth scroll), Google Fonts (Space Grotesk, JetBrains Mono). No GSAP, no Three.js — effects are SVG/CSS (and cursor canvas only).

---

## 12. Assets Manifest

| Filename           | Type  | Description                                                                                          | Location                 |
| ------------------ | ----- | ---------------------------------------------------------------------------------------------------- | ------------------------ |
| `avatar-glyph.svg` | SVG   | Brand mark: abstract 64×64 pixel-grid "compiled glyph" (not a portrait). Crisp pixels, no gradients. | Favicon, og:image, brand |
| `grain.png`        | Image | Tileable fine monochrome film-grain texture, used at 2–3% opacity as a fixed overlay.                | Global overlay           |
| `rust.png`         | Image | Ferris the crab (Rust mascot), used on the `#[napi]` hero frame.                                     | `/napi` hero             |
| `napi-favicon.png` | Image | napi.rs site favicon (transparent), used on the napi.rs link under the attribute.                    | `/napi` hero             |
