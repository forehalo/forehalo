/**
 * Shell tokenizer (terminal.md §shell) — whitespace split with single/double
 * quote awareness. Pure function, no deps. Quotes are stripped; an empty
 * quoted string still yields an empty token (`""` → [""]). Unterminated
 * quotes consume to end of input, like a lenient REPL.
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;
  /** true once the current token has started (even via an empty quote) */
  let started = false;

  for (const ch of input) {
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      started = true;
    } else if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      if (started || current) {
        tokens.push(current);
        current = "";
        started = false;
      }
    } else {
      current += ch;
    }
  }
  if (started || current) tokens.push(current);
  return tokens;
}
