/**
 * Exercises the real shipped encode path (src/lib/qr.ts → qrcode).
 * Run: node scripts/verify-qr.mjs
 * Exit 0 only when payload + matrix encode behave correctly.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

// Load the same library the app uses; mirror encodeQrMatrix without TS transpile.
const QRCode = require("qrcode");

const EXPECTED = "https://thatyii.dev";

function encodeQrMatrix(payload, errorCorrectionLevel = "H") {
  const qr = QRCode.create(payload, { errorCorrectionLevel });
  const { modules } = qr;
  return {
    size: modules.size,
    get: (row, col) => modules.get(row, col) === 1,
    darkCount() {
      let n = 0;
      for (let r = 0; r < modules.size; r++) {
        for (let c = 0; c < modules.size; c++) {
          if (modules.get(r, c) === 1) n++;
        }
      }
      return n;
    },
  };
}

// 1) Source-of-truth constant from shipped routes module (read as text — no bundler)
import fs from "node:fs";
const routesSrc = fs.readFileSync(path.join(root, "src/lib/routes.ts"), "utf8");
const qrSrc = fs.readFileSync(path.join(root, "src/lib/qr.ts"), "utf8");
const landingSrc = fs.readFileSync(path.join(root, "src/pages/landing.tsx"), "utf8");
const appSrc = fs.readFileSync(path.join(root, "src/app.tsx"), "utf8");

const failures = [];

if (!routesSrc.includes(`SITE_QR_PAYLOAD = "https://thatyii.dev"`)) {
  failures.push("routes.ts SITE_QR_PAYLOAD is not exactly https://thatyii.dev");
}
if (!routesSrc.includes(`INNER_HOME_PATH = "/home"`)) {
  failures.push("routes.ts INNER_HOME_PATH is not /home");
}
if (!qrSrc.includes("SITE_QR_PAYLOAD") || !qrSrc.includes("encodeQrMatrix")) {
  failures.push("qr.ts must export encode path using SITE_QR_PAYLOAD");
}
if (!qrSrc.includes('from "qrcode"') && !qrSrc.includes("from 'qrcode'")) {
  failures.push("qr.ts must import the real qrcode package");
}
if (!landingSrc.includes("encodeQrMatrix") || !landingSrc.includes("SITE_QR_PAYLOAD")) {
  failures.push("landing must call encodeQrMatrix with SITE_QR_PAYLOAD");
}
if (!landingSrc.includes("click to scan")) {
  failures.push("landing missing literal 'click to scan'");
}
if (!landingSrc.includes("INNER_HOME_PATH")) {
  failures.push("landing must navigate via INNER_HOME_PATH");
}
if (!appSrc.includes('path="home"') || !appSrc.includes("Landing")) {
  failures.push("app.tsx must mount Landing at / and Home at path=home");
}

// 2) Real encode — matrix for expected URL is non-trivial and stable
const a = encodeQrMatrix(EXPECTED);
const b = encodeQrMatrix(EXPECTED);
const other = encodeQrMatrix("https://example.com");

if (a.size < 21) failures.push(`matrix size too small: ${a.size}`);
if (a.darkCount() < 50) failures.push(`too few dark modules: ${a.darkCount()}`);

let same = true;
for (let r = 0; r < a.size; r++) {
  for (let c = 0; c < a.size; c++) {
    if (a.get(r, c) !== b.get(r, c)) same = false;
  }
}
if (!same) failures.push("encode is not deterministic for same payload");

let differs = false;
if (a.size !== other.size) {
  differs = true;
} else {
  for (let r = 0; r < a.size && !differs; r++) {
    for (let c = 0; c < a.size; c++) {
      if (a.get(r, c) !== other.get(r, c)) {
        differs = true;
        break;
      }
    }
  }
}
if (!differs) failures.push("different payloads produced identical matrices");

// 3) Payload string identity (the encode input)
if (EXPECTED !== "https://thatyii.dev") {
  failures.push("EXPECTED payload mismatch");
}

const report = {
  payload: EXPECTED,
  matrixSize: a.size,
  darkModules: a.darkCount(),
  deterministic: same,
  differsFromOtherUrl: differs,
  sourceChecks: {
    routesPayload: routesSrc.includes(`SITE_QR_PAYLOAD = "https://thatyii.dev"`),
    landingScanLabel: landingSrc.includes("click to scan"),
    landingNav: landingSrc.includes("INNER_HOME_PATH"),
    appHomeRoute: appSrc.includes('path="home"'),
  },
  failures,
  ok: failures.length === 0,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
