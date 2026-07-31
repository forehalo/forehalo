/**
 * Exercises the REAL shipped encode path (src/lib/qr.ts → qrcode).
 * Run: pnpm verify:qr (or: node scripts/verify-qr.mjs)
 * Exit 0 only when the payload + matrix contract holds for the actual
 * encoder the landing ships.
 *
 * This script imports encodeQrMatrix / SITE_QR_PAYLOAD straight from
 * src/lib/qr.ts — Node 24 type-stripping executes the .ts directly, with a
 * tiny resolve hook mapping the app's `@/ → src/` alias. There is no copied
 * encoder here; the checks run against the shipped one.
 */
import { registerHooks } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Map the repo's `@/ → src/` alias so Node can load src/lib/qr.ts without a
// bundler. registerHooks must be in place before the dynamic import below.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
    const base = path.join(root, "src", specifier.slice(2));
    const target = path.extname(base)
      ? base
      : [base + ".ts", base + ".tsx"].find((p) => fs.existsSync(p));
    if (!target || !fs.existsSync(target)) {
      throw new Error(`verify-qr: cannot resolve @/ specifier "${specifier}"`);
    }
    return { shortCircuit: true, url: pathToFileURL(target).href };
  },
});

const { encodeQrMatrix, SITE_QR_PAYLOAD } = await import(
  pathToFileURL(path.join(root, "src/lib/qr.ts")).href
);

const EXPECTED = "https://thatyii.dev";

// 1) Source-of-truth contract (read as text — no bundler). These assert the
//    leaf definitions + call sites the app compiles against.
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
if (!landingSrc.includes("scan to enter official website")) {
  failures.push("landing missing literal 'scan to enter official website'");
}
if (!landingSrc.includes("INNER_HOME_PATH")) {
  failures.push("landing must navigate via INNER_HOME_PATH");
}
if (!appSrc.includes('path="home"') || !appSrc.includes("Landing")) {
  failures.push("app.tsx must mount Landing at / and Home at path=home");
}

// 2) Real encode — the imported SITE_QR_PAYLOAD must be the expected URL,
//    and its matrix must be non-trivial, deterministic, and payload-specific.
if (SITE_QR_PAYLOAD !== EXPECTED) {
  failures.push(`SITE_QR_PAYLOAD is "${SITE_QR_PAYLOAD}", expected "${EXPECTED}"`);
}

function darkCount(matrix) {
  let n = 0;
  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      if (matrix.get(r, c)) n++;
    }
  }
  return n;
}

const a = encodeQrMatrix(SITE_QR_PAYLOAD, "H");
const b = encodeQrMatrix(SITE_QR_PAYLOAD, "H");
const other = encodeQrMatrix("https://example.com");

if (a.size < 21) failures.push(`matrix size too small: ${a.size}`);
const darkA = darkCount(a);
if (darkA < 50) failures.push(`too few dark modules: ${darkA}`);

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

const report = {
  encoder: "src/lib/qr.ts (imported, not copied)",
  payload: SITE_QR_PAYLOAD,
  matrixSize: a.size,
  darkModules: darkA,
  deterministic: same,
  differsFromOtherUrl: differs,
  sourceChecks: {
    routesPayload: routesSrc.includes(`SITE_QR_PAYLOAD = "https://thatyii.dev"`),
    landingScanLabel: landingSrc.includes("scan to enter official website"),
    landingNav: landingSrc.includes("INNER_HOME_PATH"),
    appHomeRoute: appSrc.includes('path="home"'),
  },
  failures,
  ok: failures.length === 0,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
