/**
 * Stable route paths used across chrome (navbar, palette, QR gate).
 * Landing (`/`) is the receipt gate; the compiled-identity home lives at
 * INNER_HOME_PATH so project crates stay independent nested routes.
 */

/** Existing compiled-identity home (hero + career log) — entered via QR scan. */
export const INNER_HOME_PATH = "/home" as const;

/** Projects index — card grid linking out to project crates / GitHub. */
export const PROJECTS_PATH = "/projects" as const;

/** macOS-terminal fork of the site (terminal.md) — home of the REPL. */
export const TERMINAL_HOME_PATH = "/terminal" as const;

/** Public domain encoded into the landing QR. */
export const SITE_QR_PAYLOAD = "https://thatyii.dev" as const;
