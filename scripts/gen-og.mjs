/**
 * Generate public/og.png (1200×630) for Open Graph / X cards.
 * Usage: node scripts/gen-og.mjs  (or pnpm gen:og)
 */
import { Jimp, rgbaToInt } from "jimp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const W = 1200;
const H = 630;
const VOID = rgbaToInt(0x07, 0x08, 0x0a, 255);
const HALO = rgbaToInt(0xff, 0xb4, 0x3a, 255);
const BONE = rgbaToInt(0xed, 0xe9, 0xdf, 255);

function blend(dst, src, a) {
  if (a <= 0) return dst;
  if (a >= 1) return src;
  const dr = (dst >> 24) & 255;
  const dg = (dst >> 16) & 255;
  const db = (dst >> 8) & 255;
  const sr = (src >> 24) & 255;
  const sg = (src >> 16) & 255;
  const sb = (src >> 8) & 255;
  return rgbaToInt(
    Math.round(dr + (sr - dr) * a),
    Math.round(dg + (sg - dg) * a),
    Math.round(db + (sb - db) * a),
    255,
  );
}

// Full card is forge void black — no carbon plate (keeps avatar plate seamless)
const out = new Jimp({ width: W, height: H, color: VOID });
const pad = 48;

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

/*
  Avatar: the source is a circular character on a white square.
  Hard white-keying kills the white face and leaves fringe.
  Use a soft circular mask so face whites stay; only outside the circle is cut.
*/
// Avatar: plate white outside the green disc → void black (card bg).
// Face/eye whites are inside the disc and stay white.
const avatar = await Jimp.read(path.join(root, "public/avatars/yii.jpg"));
const avatarSize = 380;
avatar.resize({ w: avatarSize, h: avatarSize });
const ax = 130;
const ay = Math.floor((H - avatarSize) / 2);
const acx = (avatarSize - 1) / 2;
const acy = (avatarSize - 1) / 2;
const greenR = avatarSize * 0.392;

for (let y = 0; y < avatarSize; y++) {
  for (let x = 0; x < avatarSize; x++) {
    const p = avatar.getPixelColor(x, y);
    const r = (p >> 24) & 255;
    const g = (p >> 16) & 255;
    const b = (p >> 8) & 255;
    const lum = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    const dist = Math.sqrt((x - acx) ** 2 + (y - acy) ** 2);

    // Outside green disc: white / pale plate → void (skip, card is already VOID)
    if (dist > greenR) {
      if (lum > 170 && sat < 50) continue;
      // keep dark brim / hood that sticks past the green
    }

    // Outer ring of the disc: plate-white AA fringe → void (face whites are more central)
    if (dist > greenR * 0.8 && lum > 235 && sat < 18) continue;
    if (dist > greenR * 0.88 && lum > 210 && sat < 30) continue;

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
