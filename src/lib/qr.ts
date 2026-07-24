import QRCode from "qrcode";
import { SITE_QR_PAYLOAD } from "@/lib/routes";

export { SITE_QR_PAYLOAD };

export type QrMatrix = {
  size: number;
  /** true = dark module */
  get: (row: number, col: number) => boolean;
};

/**
 * Encode `payload` into a QR bit matrix via the real `qrcode` library path.
 * Pure / sync so tests and the landing can share the same helper without
 * mounting React.
 */
export function encodeQrMatrix(
  payload: string = SITE_QR_PAYLOAD,
  errorCorrectionLevel: "L" | "M" | "Q" | "H" = "H",
): QrMatrix {
  const qr = QRCode.create(payload, { errorCorrectionLevel });
  const { modules } = qr;
  return {
    size: modules.size,
    get: (row, col) => modules.get(row, col) === 1,
  };
}

/** Compact SVG string for the given payload (used by landing + encode checks). */
export function encodeQrSvg(
  payload: string = SITE_QR_PAYLOAD,
  opts: { moduleSize?: number; marginModules?: number } = {},
): string {
  const moduleSize = opts.moduleSize ?? 4;
  const marginModules = opts.marginModules ?? 3;
  const matrix = encodeQrMatrix(payload);
  const dim = (matrix.size + marginModules * 2) * moduleSize;
  const rects: string[] = [];
  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      if (!matrix.get(r, c)) continue;
      const x = (c + marginModules) * moduleSize;
      const y = (r + marginModules) * moduleSize;
      rects.push(
        `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="#000"/>`,
      );
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${dim}" height="${dim}" shape-rendering="crispEdges">${rects.join("")}</svg>`;
}
