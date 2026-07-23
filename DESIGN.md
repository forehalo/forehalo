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
4. **Dark forge, warm signal.** A near-black void with one hot amber halo. Meaning-accents (rust orange, node green, cyan) appear only where their _meaning_ appears.
5. **Fast, then fancy.** Content is readable with motion reduced; the site must feel instant.

---

## 2. Color System

Tokens live in `src/index.css` `@theme` (Tailwind v4).

| Token        | Hex                     | Usage                                                                          |
| ------------ | ----------------------- | ------------------------------------------------------------------------------ |
| `void`       | `#07080A`               | Page background                                                                |
| `carbon`     | `#0D0F12`               | Panels, cards, code blocks                                                     |
| `carbon-2`   | `#121519`               | Raised surfaces, palette                                                       |
| `steel`      | `#1C2027`               | 1px borders, hairlines                                                         |
| `steel-soft` | `#2A2F38`               | Hover borders, dashed "macro region" borders                                   |
| `bone`       | `#EDE9DF`               | Primary text, warm paper white                                                 |
| `ash`        | `#8B9098`               | Secondary text, comments (`// like this`)                                      |
| `dim`        | `#4C525B`               | Line numbers, disabled, faint labels                                           |
| `halo`       | `#FFB43A`               | **Primary signal.** Cursor ring, active states, key numbers, rail current step |
| `halo-soft`  | `rgba(255,180,58,0.14)` | Halo glows, tag backgrounds, selection tint                                    |
| `rust`       | `#FF5C28`               | Rust-side accent ONLY                                                          |
| `node`       | `#8CC84B`               | JS/Node-side accent ONLY (generated `.js/.d.ts`, checkmarks)                   |
| `wasi-cyan`  | `#6FE3F9`               | "Current" accent — live clock, HEAD chips, links to _now_                      |
| `danger`     | `#FF4D4D`               | Diff deletions — used sparingly                                                |

**Ratios**: ~85% void/carbon surfaces · ~10% bone/ash text · ~4% halo signal · ~1% rust/node/cyan meaning-accents.

**Syntax palette** (code snippets only, `src/lib/highlight.ts`): keywords `halo`, types `wasi-cyan`, strings `node`, numbers `rust`, comments `dim`, punctuation `ash`, attributes always `halo` with a soft glow.

**Background texture**: 2–3% opacity `grain.png` overlay (fixed, `mix-blend-overlay`, global) + a **shared physics backdrop** (`PageBackdrop` in `src/components/page-backdrop.tsx`, engine in `src/lib/backdrop/`) — exactly one fixed full-viewport canvas-2D behind all content (`z-0`, `aria-hidden`, `pointer-events-none`), running one global cursor-reactive scene on every route: **flow-field** (the FFI boundary — particles stream left→right across a wavy violet membrane; crossing it "compiles" them amber → emerald with a velocity burst; the cursor is a gravity **Well** that shoves particles aside and bulges the membrane). Whisper intensity throughout: dim trail bodies, accents only on the membrane and particle color shift, ≤220 particles, DPR ≤2, a single rAF loop paused when the tab is hidden or the canvas off-screen, and a single static frame (no loop) under reduced motion. Scene lives in `src/lib/backdrop/scenes/flow-field.ts`.

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

- **Lenis** smooth scroll owns scrolling (`html { scroll-behavior: auto }`), synced to ScrollTrigger (`src/hooks/use-smooth-scroll.tsx`). In-page navigation goes through `useScrollTo()`/`useLenis()`, never native `window.scrollTo`.
- Scroll progress is ambient only (physics backdrop, recompile wipe) — there is no progress rail.
- **Pins**: at most ONE pinned sequence per page, and only when it drives a _transformation_. No decorative pinning.
- Reveals fire once (`useInViewOnce`) and gate on reduced motion.

---

## 8. Shared Components (global chrome)

### 8.1 BuildRail — REMOVED

The left progress rail (vertical compile log with live percentages, mobile hairline, rail clock) was deleted from every page, along with its section registry (`useBuildRailSections`, `SectionsProvider`) and all rail-width layout offsets. Pages have no side rail; the TopBar is the only fixed chrome.

### 8.2 TopBar

Fixed, height 56px, `void`@85% + backdrop-blur, bottom border 1px `steel` (fades in after 24px scroll).

- Left: `Yii` wordmark (hud style) — plain text, no click behavior; hidden on home (the hero owns the name there).
- Center: nav links to the pages (first-letter uppercase labels; `AFFiNE` keeps its brand casing; the napi-rs page is labeled `#[napi]`).
- Right: GitHub + X icon links (16px, `ash`→`halo` hover, padded hit areas) · `~` palette chip.

### 8.3 Command Palette (`~` or ⌘K / Ctrl+K)

Center-top overlay (`carbon-2`, 1px `steel`, radius 3px), opens with scale 0.98→1 + fade. Mono input, fuzzy-find with matched chars in `halo`. Commands: `open →` each page · `copy → email` (toast `✓ copied to clipboard`) · `cargo add forehalo` (prints playful cargo lines, then a toast popup with the contact address — no scrolling) · `motion → reduce / full` · `theme → void` (joke: `error[E0407]: light mode is not a member of trait Forge`). ESC closes; fully keyboard navigable.

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

`react@19`, `typescript`, `vite` (vite-plus), `tailwindcss@4` (theme in `src/index.css`, no config file), `shadcn/ui` primitives (new-york, restyled), `framer-motion` (UI/reveal), `gsap` + `ScrollTrigger` (pinned/scrub scenes), `lenis` (smooth scroll), Google Fonts (Space Grotesk, JetBrains Mono). No Three.js — all effects are canvas-2D/SVG/CSS (lighter, sharper, more "terminal").

---

## 12. Assets Manifest

| Filename           | Type  | Description                                                                                          | Location                 |
| ------------------ | ----- | ---------------------------------------------------------------------------------------------------- | ------------------------ |
| `avatar-glyph.svg` | SVG   | Brand mark: abstract 64×64 pixel-grid "compiled glyph" (not a portrait). Crisp pixels, no gradients. | Favicon, og:image, brand |
| `grain.png`        | Image | Tileable fine monochrome film-grain texture, used at 2–3% opacity as a fixed overlay.                | Global overlay           |
| `rust.png`         | Image | Ferris the crab (Rust mascot), used on the `#[napi]` hero frame.                                     | `/napi` hero             |
| `napi-favicon.png` | Image | napi.rs site favicon (transparent), used on the napi.rs link under the attribute.                    | `/napi` hero             |
