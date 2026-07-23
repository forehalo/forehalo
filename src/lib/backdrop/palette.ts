/**
 * Backdrop palette — colors come from the @theme tokens only (design.md §2).
 * The tokens are mirrored onto `:root` as custom properties in index.css, so
 * we read them once at engine creation and cache the result; hex fallbacks
 * match the tokens in case the custom property is unavailable.
 */

export interface Palette {
  void: string;
  steel: string;
  steelSoft: string;
  dim: string;
  ash: string;
  bone: string;
  halo: string;
  rust: string;
  node: string;
  wasiCyan: string;
}

const FALLBACKS: Palette = {
  void: "#07080a",
  steel: "#1c2027",
  steelSoft: "#2a2f38",
  dim: "#4c525b",
  ash: "#8b9098",
  bone: "#ede9df",
  halo: "#ffb43a",
  rust: "#ff5c28",
  node: "#8cc84b",
  wasiCyan: "#6fe3f9",
};

const PROPS: Record<keyof Palette, string> = {
  void: "--void",
  steel: "--steel",
  steelSoft: "--steel-soft",
  dim: "--dim",
  ash: "--ash",
  bone: "--bone",
  halo: "--halo",
  rust: "--rust",
  node: "--node",
  wasiCyan: "--wasi-cyan",
};

export function loadPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const out = { ...FALLBACKS };
  for (const key of Object.keys(PROPS) as (keyof Palette)[]) {
    const value = style.getPropertyValue(PROPS[key]).trim();
    if (value) out[key] = value;
  }
  return out;
}

/** "#rrggbb" → "rgba(r,g,b,a)" for whisper-intensity rendering. */
export function withAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** uniform random in [min, max) */
export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
