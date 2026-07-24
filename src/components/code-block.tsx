import { useState } from "react";
import type { ReactNode } from "react";
import { highlight } from "@/lib/highlight";
import type { Lang } from "@/lib/highlight";
import { MacroExpand } from "@/components/motion/macro-expand";
import { cn } from "@/lib/utils";

/**
 * CodeBlock (design.md §8.6): carbon panel, filename tab, line numbers (dim),
 * 14px code in the §2 syntax palette, copy button (`copy` → `copied ✓`).
 * Optional fold region renders a dashed gutter
 * marker ("// … N lines you didn't have to write") that macroExpands.
 *
 * `code` (string, highlighted via `lang`) or `lines` (pre-built ReactNode
 * rows, e.g. interactive attribute chips) — one of the two.
 */
export function CodeBlock({
  filename,
  code,
  lang = "rust",
  lines,
  className,
  copyable = true,
  cursor = true,
  foldedNote,
  foldCode,
  lineOffset = 0,
  fontSize = 14,
  tabLabel,
}: {
  filename?: string;
  code?: string;
  lang?: Lang;
  lines?: ReactNode[];
  className?: string;
  copyable?: boolean;
  cursor?: boolean;
  foldedNote?: string;
  foldCode?: string;
  lineOffset?: number;
  fontSize?: number;
  tabLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [foldOpen, setFoldOpen] = useState(false);

  const rows: ReactNode[] = lines ?? (code ? highlight(code, lang) : []);
  const foldRows: ReactNode[] = foldCode ? highlight(foldCode, lang) : [];
  const rawText = code ?? "";

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText || rows.map(String).join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[3px] border border-steel bg-carbon",
        className,
      )}
      {...(cursor ? { "data-cursor": "read" } : {})}
    >
      {(filename || copyable) && (
        <div className="flex items-center justify-between border-b border-steel px-4 py-2">
          <span className="font-mono text-[11px] text-ash">{filename ?? tabLabel ?? ""}</span>
          {copyable && (
            <button
              onClick={onCopy}
              data-cursor="link"
              className="hud rounded-[2px] px-1.5 py-0.5 text-dim transition-colors hover:text-halo"
              aria-label="copy code"
            >
              {copied ? <span className="text-node">copied ✓</span> : "copy"}
            </button>
          )}
        </div>
      )}
      <div className="overflow-x-auto px-0 py-3" style={{ fontSize, lineHeight: 1.7 }}>
        <table className="w-full border-collapse font-mono">
          <tbody>
            {rows.map((cells, i) => (
              <tr key={i} className="group/line">
                <td
                  aria-hidden
                  className="w-10 select-none pr-4 text-right align-top text-dim"
                  style={{ fontSize: 10, paddingTop: fontSize * 0.32 }}
                >
                  {i + 1 + lineOffset}
                </td>
                <td className="whitespace-pre pr-4">{cells}</td>
              </tr>
            ))}
            {foldedNote && (
              <tr>
                <td
                  aria-hidden
                  className="w-10 select-none pr-4 text-right text-dim"
                  style={{ fontSize: 10 }}
                >
                  …
                </td>
                <td className="pr-4">
                  <button
                    onClick={() => setFoldOpen((v) => !v)}
                    data-cursor="expand"
                    className="my-1 w-full rounded-[2px] border border-dashed border-steel-soft px-2 py-1 text-left text-dim transition-colors hover:border-halo hover:text-halo"
                    style={{ fontSize: 11 }}
                  >
                    // {foldedNote} {foldOpen ? "▴" : "▾"}
                  </button>
                  <MacroExpand open={foldOpen}>
                    {foldRows.map((cells, i) => (
                      <div key={i} className="whitespace-pre" style={{ fontSize, lineHeight: 1.7 }}>
                        {cells}
                      </div>
                    ))}
                  </MacroExpand>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
