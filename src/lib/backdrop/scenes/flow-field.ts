/**
 * Scene · flow-field — the FFI boundary, global on every route (ported from
 * the forehalo-2 hero background). Particles stream left→right across a
 * wavy vertical membrane; crossing it "compiles" them — amber turns emerald
 * with a burst of native speed. The Well (cursor) pushes particles aside and
 * bulges the membrane toward itself.
 *
 * Trails: the engine clears the shared canvas every frame, so persistence
 * lives here — each frame renders into the scene's own offscreen canvas
 * with a translucent fade fill, and `draw` blits that offscreen forward.
 * `step` advances physics only (no canvas access), per the scene contract.
 * Reduced motion: a single still frame — particles frozen mid-stream,
 * colored by side, membrane drawn flat.
 */

import type { BackdropScene, SceneBounds, Well } from "../types";

/* the look is the source hero's identity — keep its exact colors */
const AMBER = [255, 158, 87] as const; // rust side
const EMERALD = [74, 222, 128] as const; // node side
const MEMBRANE_RGB = "167, 139, 250"; // the bridge violet
const FADE = "rgba(7, 8, 11, 0.14)"; // trail persistence (≈ void)

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0 = rust world, 1 = node world */
  s: number;
  seed: number;
}

const IDLE_WELL: Well = { x: 0, y: 0, vx: 0, vy: 0, active: false };

export function createFlowFieldScene(options?: { staticOnly?: boolean }): BackdropScene {
  const staticOnly = options?.staticOnly ?? false;

  let w = 0;
  let h = 0;
  let time = 0; // ms, accumulated from dt
  let particles: Particle[] = [];
  let well: Well = IDLE_WELL;
  let off: HTMLCanvasElement | null = null;
  let offCtx: CanvasRenderingContext2D | null = null;
  let stillDrawn = false;

  /** the membrane: a wavy vertical seam that bulges toward the Well */
  const membraneX = (y: number, hasWell: boolean): number => {
    let mx = w / 2 + Math.sin(y * 0.01 + time * 0.0011) * 12;
    if (hasWell) {
      const dy = y - well.y;
      const gauss = Math.exp(-(dy * dy) / (2 * 130 * 130));
      const prox = Math.max(0, 1 - Math.abs(well.x - w / 2) / 320);
      mx += gauss * prox * 64 * Math.sign(well.x - w / 2 || 1);
    }
    return mx;
  };

  const drawMembrane = (ctx: CanvasRenderingContext2D, hasWell: boolean) => {
    for (const [width, alpha] of [
      [7, 0.1],
      [1.5, 0.55],
    ] as const) {
      ctx.strokeStyle = `rgba(${MEMBRANE_RGB}, ${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (let y = -10; y <= h + 10; y += 14) {
        const x = membraneX(y, hasWell);
        if (y === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  const seed = () => {
    const count = Math.min(220, Math.max(90, Math.floor((w * h) / 8500)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0.6,
      vy: 0,
      s: 0,
      seed: Math.random() * 1000,
    }));
  };

  /** one live frame: fade the trails, draw streaks + membrane */
  const renderFrame = (ctx: CanvasRenderingContext2D) => {
    const hasWell = well.active;
    ctx.fillStyle = FADE;
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 1.2;
    for (const pt of particles) {
      const r = AMBER[0] + (EMERALD[0] - AMBER[0]) * pt.s;
      const g = AMBER[1] + (EMERALD[1] - AMBER[1]) * pt.s;
      const b = AMBER[2] + (EMERALD[2] - AMBER[2]) * pt.s;
      ctx.strokeStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, 0.75)`;
      ctx.beginPath();
      ctx.moveTo(pt.x - pt.vx * 2.6, pt.y - pt.vy * 2.6);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    drawMembrane(ctx, hasWell);
  };

  /** the reduced-motion still: particles frozen mid-stream, colored by side */
  const renderStill = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.2;
    for (const pt of particles) {
      const s = pt.x > w / 2 ? 1 : 0;
      const r = AMBER[0] + (EMERALD[0] - AMBER[0]) * s;
      const g = AMBER[1] + (EMERALD[1] - AMBER[1]) * s;
      const b = AMBER[2] + (EMERALD[2] - AMBER[2]) * s;
      ctx.strokeStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, 0.6)`;
      ctx.beginPath();
      ctx.moveTo(pt.x - 3, pt.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    drawMembrane(ctx, false);
  };

  return {
    resize(bounds: SceneBounds) {
      w = bounds.width;
      h = bounds.height;
      off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(w * bounds.dpr));
      off.height = Math.max(1, Math.round(h * bounds.dpr));
      offCtx = off.getContext("2d");
      offCtx?.setTransform(bounds.dpr, 0, 0, bounds.dpr, 0, 0);
      seed();
      stillDrawn = false;
    },

    step(dt: number, nextWell: Well) {
      well = nextWell;
      if (staticOnly) return;
      time += dt * 1000;
      const f = Math.min(3, (dt * 1000) / 16.667);
      const hasWell = well.active;

      for (const pt of particles) {
        const wobble = Math.sin(pt.y * 0.006 + time * 0.0007 + pt.seed);
        pt.vx += (0.55 + 0.3 * wobble - pt.vx) * 0.05 * f;
        pt.vy += (Math.cos(pt.x * 0.005 + time * 0.0005 + pt.seed) * 0.4 - pt.vy) * 0.05 * f;
        if (hasWell) {
          const dx = pt.x - well.x;
          const dy = pt.y - well.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14400) {
            const d = Math.sqrt(d2) || 1;
            const push = (1 - d / 120) * 1.1;
            pt.vx += (dx / d) * push * f;
            pt.vy += (dy / d) * push * f;
          }
        }
        pt.x += pt.vx * f;
        pt.y += pt.vy * f;

        const mx = membraneX(pt.y, hasWell);
        const target = pt.x > mx ? 1 : 0;
        if (target === 1 && pt.s < 0.05) pt.vx += 1.4; // compiled: a burst of native speed
        pt.s += (target - pt.s) * 0.08 * f;

        if (pt.x > w + 24) {
          pt.x = -12;
          pt.y = Math.random() * h;
          pt.s = 0;
          pt.vx = 0.8;
          pt.vy = 0;
        }
        if (pt.y > h + 12) pt.y = -10;
        else if (pt.y < -12) pt.y = h + 10;
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      if (!off || !offCtx) return;
      if (staticOnly) {
        if (!stillDrawn) {
          renderStill(offCtx);
          stillDrawn = true;
        }
      } else {
        renderFrame(offCtx);
      }
      ctx.drawImage(off, 0, 0, w, h);
    },

    dispose() {
      off = null;
      offCtx = null;
      particles = [];
    },
  };
}
