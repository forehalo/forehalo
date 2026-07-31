import { tokenize } from "@/pages/terminal/shell";

/**
 * Pure Tab completion for the REPL (terminal.md §repl). Replaces the current
 * (last) token with the sole matching candidate, or extends it to the common
 * prefix of all candidates. Returns `input` unchanged when there is nothing
 * to complete — no match, or the fragment already carries the full prefix.
 *
 * Original-input fidelity (the previous inline version rebuilt the head from
 * tokenize() output and silently dropped quotes):
 * - an unterminated opening quote is preserved: `open "na` → `open "napi-rs`
 *   (the `"` survives, instead of the old `open napi-rs`);
 * - a closed quoted token keeps BOTH quotes: `open "na"` → `open "napi-rs"`;
 * - the raw prefix before the current token is spliced verbatim — leading
 *   whitespace and repeated spaces are not collapsed;
 * - whitespace inside an open quote is token content, not a separator.
 */
export function complete(input: string, candidates: string[]): string {
  // offset of the first character of the current token in the raw input;
  // whitespace only splits tokens outside quotes — tokenize() applies the
  // same quote rules but returns strings without offsets, so the scan is
  // local to this function
  let start = 0;
  let inQuote: '"' | "'" | null = null;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuote) {
      if (ch === inQuote) inQuote = null;
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      start = i + 1;
    }
  }

  const rawToken = input.slice(start);
  // tokenize() strips quotes, so its last token is the matchable content of
  // the current raw token; a raw token that never started means the input
  // ends in whitespace — empty fragment
  const fragment = rawToken === "" ? "" : (tokenize(input).pop() ?? "");
  const matches = candidates.filter((c) => c.startsWith(fragment));
  if (matches.length === 0) return input;

  let replacement: string;
  if (matches.length === 1) {
    replacement = matches[0];
  } else {
    // common prefix across all matches; ambiguous unless it is strictly
    // longer than the fragment the user already typed
    let prefix = matches[0];
    for (const m of matches.slice(1)) {
      while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1);
    }
    if (prefix.length <= fragment.length) return input;
    replacement = prefix;
  }
  if (replacement === fragment) return input; // already complete

  // splice the replacement in place of the raw token, keeping any quote
  // that opened it (and re-closing one that was already closed)
  const head = input.slice(0, start);
  const quote = rawToken[0];
  if (quote === '"' || quote === "'") {
    const closes = rawToken.length > 1 && rawToken.at(-1) === quote;
    return `${head}${quote}${replacement}${closes ? quote : ""}`;
  }
  return `${head}${replacement}`;
}
