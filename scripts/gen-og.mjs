/**
 * Generate public/og.png (1200×630) for Open Graph / X cards.
 * Usage: node scripts/gen-og.mjs
 */
import { Jimp, rgbaToInt } from "jimp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const W = 1200;
const H = 630;
const VOID = rgbaToInt(0x07, 0x08, 0x0a, 255);
const CARBON = rgbaToInt(0x0d, 0x0f, 0x12, 255);
const HALO = rgbaToInt(0xff, 0xb4, 0x3a, 255);
const BONE = rgbaToInt(0xed, 0xe9, 0xdf, 255);

const out = new Jimp({ width: W, height: H, color: VOID });
const pad = 48;

for (let y = pad; y < H - pad; y++) {
  for (let x = pad; x < W - pad; x++) {
    out.setPixelColor(CARBON, x, y);
  }
}

for (let y = pad; y < H - pad; y++) {
  for (let x = pad; x < W - pad; x++) {
    const nx = (x - W / 2) / ((W - 2 * pad) / 2);
    const ny = (y - H / 2) / ((H - 2 * pad) / 2);
    const d = Math.sqrt(nx * nx * 0.55 + ny * ny);
    if (d > 0.72) {
      const t = Math.min(1, (d - 0.72) / 0.45);
      const p = out.getPixelColor(x, y);
      const r = ((p >> 24) & 255) * (1 - t) + 0x07 * t;
      const g = ((p >> 16) & 255) * (1 - t) + 0x08 * t;
      const b = ((p >> 8) & 255) * (1 - t) + 0x0a * t;
      out.setPixelColor(rgbaToInt(r | 0, g | 0, b | 0, 255), x, y);
    }
  }
}

const frame = 2;
for (let x = pad; x < W - pad; x++) {
  for (let t = 0; t < frame; t++) {
    out.setPixelColor(HALO, x, pad + t);
    out.setPixelColor(HALO, x, H - pad - 1 - t);
  }
}
for (let y = pad; y < H - pad; y++) {
  for (let t = 0; t < frame; t++) {
    out.setPixelColor(HALO, pad + t, y);
    out.setPixelColor(HALO, W - pad - 1 - t, y);
  }
}

function corner(cx, cy, dx, dy) {
  const len = 28;
  const thick = 3;
  for (let i = 0; i < len; i++) {
    for (let t = 0; t < thick; t++) {
      out.setPixelColor(HALO, cx + i * dx, cy + t * dy);
      out.setPixelColor(HALO, cx + t * dx, cy + i * dy);
    }
  }
}
const cOff = pad + 16;
corner(cOff, cOff, 1, 1);
corner(W - cOff - 1, cOff, -1, 1);
corner(cOff, H - cOff - 1, 1, -1);
corner(W - cOff - 1, H - cOff - 1, -1, -1);

const avatar = await Jimp.read(path.join(root, "public/avatars/yii.jpg"));
const avatarSize = 360;
avatar.resize({ w: avatarSize, h: avatarSize });
const ax = 140;
const ay = Math.floor((H - avatarSize) / 2);
for (let y = 0; y < avatarSize; y++) {
  for (let x = 0; x < avatarSize; x++) {
    const p = avatar.getPixelColor(x, y);
    const r = (p >> 24) & 255;
    const g = (p >> 16) & 255;
    const b = (p >> 8) & 255;
    if ((r + g + b) / 3 > 245) continue;
    out.setPixelColor(p, ax + x, ay + y);
  }
}

const glyphs = {
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00100", "00100"],
};

function put(ch, ox, oy, color, cell, gap) {
  const g = glyphs[ch];
  if (!g) return 5 * cell + gap;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (g[row][col] !== "1") continue;
      for (let dy = 0; dy < cell; dy++) {
        for (let dx = 0; dx < cell; dx++) {
          out.setPixelColor(color, ox + col * cell + dx, oy + row * cell + dy);
        }
      }
    }
  }
  return 5 * cell + gap;
}

const domain = "THATYII.DEV";
const dCell = 8;
const dGap = 5;
const domainW = domain.length * (5 * dCell + dGap) - dGap;
const textRight = W - pad - 56;
const textLeft = Math.min(560, textRight - domainW);

let x = textLeft;
const y1 = 210;
const big = 14;
const bigGap = 10;
for (const ch of "YII") x += put(ch, x, y1, HALO, big, bigGap);

x = textLeft;
const y2 = 360;
for (const ch of domain) x += put(ch, x, y2, BONE, dCell, dGap);

const outPath = path.join(root, "public/og.png");
await out.write(outPath);
console.log(`wrote ${path.relative(root, outPath)} (${W}×${H})`);
