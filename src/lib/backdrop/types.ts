/**
 * Backdrop engine — shared types (design.md §2 "Background texture").
 *
 * Domain vocabulary:
 *   Backdrop — the single fixed full-viewport canvas behind all content.
 *   Scene    — the physics world living on the Backdrop; a single global
 *              scene (flow-field) serves every route.
 *   Well     — the cursor modeled as a gravity body inside a Scene. Every
 *              scene must react to it (attraction, orbiting, stirring).
 *   Particle — a simulated point; counts are bounded (≤220 per scene).
 */

/** Viewport bounds in CSS pixels, plus the (capped) device pixel ratio. */
export interface SceneBounds {
  width: number;
  height: number;
  dpr: number;
}

/** The Well: cursor position and smoothed velocity (CSS px, viewport space). */
export interface Well {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** false when the pointer has left the document — scenes release their pull */
  active: boolean;
}

/**
 * A Scene is a deep module: callers (the engine) know only this interface;
 * each scene hides its whole simulation behind it. `step` advances physics
 * (no canvas access), `draw` renders the current state in CSS px (the engine
 * pre-scales the context by dpr). `dispose` must release timers/listeners.
 */
export interface BackdropScene {
  resize(bounds: SceneBounds): void;
  step(dt: number, well: Well): void;
  draw(ctx: CanvasRenderingContext2D): void;
  dispose(): void;
}

/** Scene factories are cheap constructors; the engine owns resize/step/draw. */
export type SceneFactory = () => BackdropScene;
