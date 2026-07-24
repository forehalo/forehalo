import type { ReactNode } from "react";
import { createElement } from "react";

/**
 * Minimal syntax highlighter implementing the design.md §2 syntax palette:
 *   keywords `halo` · types `wasi-cyan` · strings `node` · numbers `rust`
 *   comments `dim` · punctuation `ash` · attributes `halo` (soft glow)
 * Good enough for the site's curated snippets — not a general parser.
 */

export type Lang = "rust" | "js" | "ts" | "sh" | "toml";

const KEYWORDS: Record<Lang, Set<string>> = {
  rust: new Set([
    "fn",
    "pub",
    "let",
    "mut",
    "use",
    "mod",
    "struct",
    "impl",
    "enum",
    "match",
    "if",
    "else",
    "for",
    "while",
    "loop",
    "return",
    "const",
    "static",
    "type",
    "where",
    "async",
    "await",
    "move",
    "ref",
    "crate",
    "self",
    "Self",
    "in",
    "as",
    "trait",
    "unsafe",
    "extern",
    "dyn",
    "box",
    "derive",
  ]),
  js: new Set([
    "import",
    "from",
    "export",
    "default",
    "const",
    "let",
    "var",
    "function",
    "return",
    "new",
    "class",
    "extends",
    "if",
    "else",
    "for",
    "while",
    "async",
    "await",
    "typeof",
    "of",
    "in",
    "throw",
    "try",
    "catch",
  ]),
  ts: new Set([
    "import",
    "from",
    "export",
    "default",
    "const",
    "let",
    "var",
    "function",
    "return",
    "new",
    "class",
    "extends",
    "if",
    "else",
    "for",
    "while",
    "async",
    "await",
    "typeof",
    "of",
    "in",
    "type",
    "interface",
  ]),
  sh: new Set(["cargo", "npm", "pnpm", "yarn", "cd", "git", "echo", "export"]),
  toml: new Set(["true", "false"]),
};

const C = {
  keyword: "text-halo",
  attr: "text-halo [text-shadow:0_0_8px_var(--halo-glow)]",
  type: "text-wasi-cyan",
  string: "text-node",
  number: "text-rust",
  comment: "text-dim",
  punct: "text-ash",
  plain: "text-bone/80",
  prompt: "text-halo",
} as const;

interface Tok {
  cls: keyof typeof C;
  text: string;
}

function tokenizeLine(line: string, lang: Lang): Tok[] {
  const toks: Tok[] = [];
  const kw = KEYWORDS[lang];
  // attribute block #[...] (rust)
  if (lang === "rust") {
    const attrMatch = line.match(/^(\s*)(#\[.*)$/);
    if (attrMatch) {
      if (attrMatch[1]) toks.push({ cls: "plain", text: attrMatch[1] });
      // split trailing comment out of the attribute
      const m = attrMatch[2].match(/^(#\[[^\]]*\])(.*)$/);
      if (m) {
        toks.push({ cls: "attr", text: m[1] });
        if (m[2])
          toks.push(
            ...tokenizeLine(m[2], lang).map((t) =>
              t.cls === "plain" ? { ...t, cls: "punct" as const } : t,
            ),
          );
      } else {
        toks.push({ cls: "attr", text: attrMatch[2] });
      }
      return toks;
    }
  }
  // shell prompt
  if (lang === "sh" && /^(\s*)[$❯>]/.test(line)) {
    const m = line.match(/^(\s*)([$❯>])\s?(.*)$/);
    if (m) {
      if (m[1]) toks.push({ cls: "plain", text: m[1] });
      toks.push({ cls: "prompt", text: m[2] });
      toks.push({ cls: "plain", text: " " });
      toks.push(...tokenizeLine(m[3], lang));
      return toks;
    }
  }

  const re =
    /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([{}()[\]<>:;,.&|=!+\-*/%@#^~?]+)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const [, comment, str, num, ident, punct, ws, other] = m;
    if (comment) toks.push({ cls: "comment", text: comment });
    else if (str) toks.push({ cls: "string", text: str });
    else if (num) toks.push({ cls: "number", text: num });
    else if (ident) {
      if (kw.has(ident)) toks.push({ cls: "keyword", text: ident });
      else if (/^[A-Z]/.test(ident)) toks.push({ cls: "type", text: ident });
      else toks.push({ cls: "plain", text: ident });
    } else if (punct) toks.push({ cls: "punct", text: punct });
    else if (ws) toks.push({ cls: "plain", text: ws });
    else if (other) toks.push({ cls: "plain", text: other });
  }
  return toks;
}

/** Highlight one line of code into ReactNodes. */
export function highlightLine(line: string, lang: Lang, keyPrefix = ""): ReactNode[] {
  if (line.trim() === "") return [createElement("span", { key: keyPrefix + "0" }, " ")];
  return tokenizeLine(line, lang).map((t, i) =>
    createElement("span", { key: keyPrefix + i, className: C[t.cls] }, t.text),
  );
}

/** Highlight a whole snippet into per-line ReactNode arrays. */
export function highlight(code: string, lang: Lang): ReactNode[][] {
  return code
    .replace(/\n$/, "")
    .split("\n")
    .map((line, i) => highlightLine(line, lang, `l${i}-`));
}
