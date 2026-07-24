/**
 * Rasterize public/avatars/yii.jpg into an ASCII-art PNG for the QR cutout.
 *
 * Usage: node scripts/gen-avatar-ascii-image.mjs
 * Output: public/avatars/yii-ascii.png
 *
 * Requires: jimp (devDependency)
 */
import { Jimp, rgbaToInt } from "jimp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const SRC = path.join(root, "public/avatars/yii.jpg");
const OUT = path.join(root, "public/avatars/yii-ascii.png");

/** Density ramp dark → light (printed ink on thermal paper). */
const RAMP = "@%#*+=-:. ";

/**
 * Tiny 5×7 bitmap fonts for the ramp glyphs (1 = ink).
 * Column-major nibbles would be longer; row strings are easier to edit.
 */
const GLYPHS = {
  "@": ["01110", "10001", "10101", "10101", "10010", "01101", "00000"],
  "%": ["11001", "11010", "00100", "01011", "10011", "00000", "00000"],
  "#": ["01010", "11111", "01010", "11111", "01010", "00000", "00000"],
  "*": ["00100", "10101", "01110", "10101", "00100", "00000", "00000"],
  "+": ["00100", "00100", "11111", "00100", "00100", "00000", "00000"],
  "=": ["00000", "11111", "00000", "11111", "00000", "00000", "00000"],
  "-": ["00000", "00000", "11111", "00000", "00000", "00000", "00000"],
  ":": ["00000", "00100", "00000", "00100", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00100", "00000", "00000"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

const CELL_W = 5;
const CELL_H = 7;
const PAD_X = 1;
const PAD_Y = 1;
const STRIDE_X = CELL_W + PAD_X;
const STRIDE_Y = CELL_H + PAD_Y;

// Columns / rows of characters — denser reads better as a face
const COLS = 36;
const ROWS = 28;

const PAPER = { r: 244, g: 241, b: 234, a: 255 };
const INK = { r: 26, g: 24, b: 20, a: 255 };

function paperInt() {
  return rgbaToInt(PAPER.r, PAPER.g, PAPER.b, PAPER.a);
}
function inkInt() {
  return rgbaToInt(INK.r, INK.g, INK.b, INK.a);
}

function charForLum(lum) {
  const idx = Math.min(RAMP.length - 1, Math.floor(lum * RAMP.length));
  return RAMP[idx];
}

function sampleLum(src, fx, fy) {
  // bilinear-ish: average a small neighborhood
  let acc = 0;
  let n = 0;
  for (let dy = -0.5; dy <= 0.5; dy += 0.5) {
    for (let dx = -0.5; dx <= 0.5; dx += 0.5) {
      const x = Math.min(src.width - 1, Math.max(0, Math.floor(fx + dx)));
      const y = Math.min(src.height - 1, Math.max(0, Math.floor(fy + dy)));
      const p = src.getPixelColor(x, y);
      const r = (p >> 24) & 255;
      const g = (p >> 16) & 255;
      const b = (p >> 8) & 255;
      acc += (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      n++;
    }
  }
  return acc / n;
}

function stampGlyph(out, ox, oy, ch, ink, paper) {
  const rows = GLYPHS[ch] ?? GLYPHS[" "];
  for (let gy = 0; gy < CELL_H; gy++) {
    const row = rows[gy] ?? "00000";
    for (let gx = 0; gx < CELL_W; gx++) {
      const on = row[gx] === "1";
      const x = ox + gx;
      const y = oy + gy;
      if (x < 0 || y < 0 || x >= out.width || y >= out.height) continue;
      out.setPixelColor(on ? ink : paper, x, y);
    }
  }
}

const src = await Jimp.read(SRC);
// tight crop: image is circular character on white — keep the figure
const inset = Math.floor(src.width * 0.04);
src.crop({ x: inset, y: inset, w: src.width - inset * 2, h: src.height - inset * 2 });

const outW = COLS * STRIDE_X + PAD_X;
const outH = ROWS * STRIDE_Y + PAD_Y;
const out = new Jimp({ width: outW, height: outH, color: paperInt() });
const ink = inkInt();
const paper = paperInt();

// Map each cell to a source sample; circular vignette so edges match cutout
const cx = (COLS - 1) / 2;
const cy = (ROWS - 1) / 2;
// aspect: cells are taller than wide → ellipse mask
const rx = COLS * 0.48;
const ry = ROWS * 0.48;

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const nx = (col - cx) / rx;
    const ny = (row - cy) / ry;
    const dist = Math.sqrt(nx * nx + ny * ny);

    const ox = PAD_X + col * STRIDE_X;
    const oy = PAD_Y + row * STRIDE_Y;

    if (dist > 1.02) {
      // outside circle — pure paper (matches QR cutout)
      for (let gy = 0; gy < CELL_H; gy++) {
        for (let gx = 0; gx < CELL_W; gx++) {
          out.setPixelColor(paper, ox + gx, oy + gy);
        }
      }
      continue;
    }

    const fx = ((col + 0.5) / COLS) * src.width;
    const fy = ((row + 0.5) / ROWS) * src.height;
    let lum = sampleLum(src, fx, fy);
    // mild contrast so the cartoon face pops as ink
    lum = Math.min(1, Math.max(0, (lum - 0.06) / 0.88));
    lum = Math.pow(lum, 0.9);

    // soft edge fade into paper
    if (dist > 0.88) {
      lum = lum + (1 - lum) * ((dist - 0.88) / 0.14);
    }

    const ch = charForLum(lum);
    stampGlyph(out, ox, oy, ch, ink, paper);
  }
}

// Scale up for crisp display in the ~80px cutout (integer nearest)
const SCALE = 4;
const final = out.resize({ w: outW * SCALE, h: outH * SCALE });

await final.write(OUT);
console.log(
  `wrote ${path.relative(root, OUT)} (${final.width}×${final.height}) from ${COLS}×${ROWS} cells`,
);
