/**
 * Backdrop engine (design.md §2, §10 performance budget).
 *
 * Exactly ONE canvas, fixed full-viewport, behind content, owned here for the
 * app's whole lifetime; scenes swap on route change. One rAF loop drives
 * physics + draw; the loop pauses when the tab is hidden or the canvas is
 * off-screen (IntersectionObserver). DPR is capped at 2, dt is clamped, and
 * no layout reads happen inside the loop (bounds are cached on resize).
 *
 * Under reduced motion the host never calls `start()` — it calls
 * `renderStaticFrame()` instead, which advances the scene once and draws a
 * single still frame (design.md §9).
 */

import type { BackdropScene, SceneBounds, SceneFactory, Well } from "./types";

export interface BackdropEngine {
  /** Swap the active scene. The previous scene is disposed. */
  setScene(factory: SceneFactory): void;
  /** Start (idempotent) the single rAF loop. */
  start(): void;
  /** Stop the rAF loop (canvas keeps its last frame). */
  stop(): void;
  /** Reduced-motion path: advance once and draw a single static frame. */
  renderStaticFrame(): void;
  dispose(): void;
}

const IDLE_WELL: Well = { x: 0, y: 0, vx: 0, vy: 0, active: false };
/** max timestep (s) — a background tab returning must not slingshot physics */
const MAX_DT = 1 / 30;

export function createBackdropEngine(canvas: HTMLCanvasElement): BackdropEngine {
  const ctx = canvas.getContext("2d");

  let scene: BackdropScene | null = null;
  let bounds: SceneBounds = { width: 0, height: 0, dpr: 1 };
  const well: Well = { ...IDLE_WELL };
  let raf = 0;
  let lastT = 0;
  let running = false;
  let pageVisible = true;
  let inView = true;
  let disposed = false;

  const draw = () => {
    if (!ctx || !scene) return;
    ctx.clearRect(0, 0, bounds.width, bounds.height);
    scene.draw(ctx);
  };

  const resize = () => {
    bounds = {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: Math.min(2, window.devicePixelRatio || 1),
    };
    canvas.width = Math.round(bounds.width * bounds.dpr);
    canvas.height = Math.round(bounds.height * bounds.dpr);
    ctx?.setTransform(bounds.dpr, 0, 0, bounds.dpr, 0, 0);
    scene?.resize(bounds);
    // keep a still frame correct across resizes when the loop is stopped
    if (!running && scene) {
      scene.step(1 / 60, IDLE_WELL);
      draw();
    }
  };

  const onMove = (e: MouseEvent) => {
    if (!well.active) {
      well.vx = 0;
      well.vy = 0;
    } else {
      // smoothed per-event velocity (px/event); decays in the frame loop
      well.vx = well.vx * 0.6 + (e.clientX - well.x) * 0.4;
      well.vy = well.vy * 0.6 + (e.clientY - well.y) * 0.4;
    }
    well.x = e.clientX;
    well.y = e.clientY;
    well.active = true;
  };
  const onLeave = () => {
    well.active = false;
  };
  const onVisibility = () => {
    pageVisible = document.visibilityState === "visible";
    lastT = 0; // avoid a dt spike when the tab returns
  };

  const io = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), {
    threshold: 0,
  });
  io.observe(canvas);

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onMove, { passive: true });
  document.documentElement.addEventListener("mouseleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
  resize();

  const frame = (t: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (!scene || !pageVisible || !inView) return;
    const dt = lastT ? Math.min(MAX_DT, (t - lastT) / 1000) : 1 / 60;
    lastT = t;
    // the Well's stir decays; its position (the pull) persists while active
    well.vx *= 0.88;
    well.vy *= 0.88;
    scene.step(dt, well);
    draw();
  };

  return {
    setScene(factory) {
      scene?.dispose();
      scene = factory();
      scene.resize(bounds);
    },
    start() {
      if (running || disposed) return;
      running = true;
      lastT = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    renderStaticFrame() {
      if (!scene) return;
      scene.step(1 / 60, IDLE_WELL);
      draw();
    },
    dispose() {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      scene?.dispose();
      scene = null;
    },
  };
}
