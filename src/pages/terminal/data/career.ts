import { COMMITS } from "@/pages/home/log-data";

/**
 * Career log for the terminal fork (terminal.md §data) — PURE TEXT lines,
 * git-log style, derived from COMMITS (@/pages/home/log-data) so the site
 * keeps a single source of truth. Format per commit:
 *
 *   * <sha> <message> (<date>)
 *     + <diff line>
 */
export const CAREER_LINES: string[] = COMMITS.flatMap((c) => [
  `* ${c.sha} ${c.message}${c.date ? ` (${c.date})` : ""}`,
  ...c.diff.map((line) => `  ${line}`),
]);
