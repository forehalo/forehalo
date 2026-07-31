import { crateByPath, TERMINAL_HOME_PATH } from "@/lib/crates";
import { highlightLine } from "@/lib/highlight";
import { DocLink } from "@/pages/terminal/doc";
import type { ManFacts, ManPage } from "@/pages/terminal/man-page";
import { AFTER_CODE, GLUE_ELIMINATED, RAW_TOTAL } from "@/pages/napi/raw-binding";

/** sibling fork routes for SEE ALSO — derived from the registry */
const AFFINE_FORK = crateByPath("/affine")!.fork.route;
const PERFSEE_FORK = crateByPath("/perfsee")!.fork.route;

const AFTER_LINES = AFTER_CODE.split("\n");

/**
 * /terminal/napi man-page data (terminal.md §projects). Every fact is lifted
 * from the real page (@/pages/napi): the hero one-liner, the Expander's
 * 118→4 line math and AFTER_CODE, the Anatomy capability glosses, and the
 * Ecosystem trust list. Stars and crate version come in as ManFacts,
 * formatted by the page from the route registry (@/lib/crates →
 * @/lib/projects, `formatStars`). Text only — nothing animates, so no
 * reduced-motion gating is needed.
 */
export function napiManPage(facts: ManFacts): ManPage {
  return {
    title: "NAPI-RS(1)",
    sections: [
      {
        title: "NAME",
        blocks: [
          {
            type: "p",
            children:
              "napi-rs — a framework for building pre-compiled Node.js addons in Rust via Node-API. One attribute, zero glue. Also targets WASI.",
          },
        ],
      },
      {
        title: "DESCRIPTION",
        blocks: [
          {
            type: "p",
            children: (
              <>
                Co-creator. Introduced the <span className="text-halo">#[napi]</span> proc macro,
                lowering the barrier of binding Rust crates to Node.js native addons and WASI.
              </>
            ),
          },
          {
            type: "p",
            className: "mt-2",
            children: (
              <>
                Without the macro, exporting one Rust function to Node means {RAW_TOTAL} lines of
                raw N-API ceremony — napi_module_register, napi_create_function, napi_get_cb_info,
                type-marshalling match arms. With it, the same binding is {AFTER_LINES.length}{" "}
                lines:
              </>
            ),
          },
          {
            type: "node",
            children: (
              <div className="mt-3 rounded-[2px] border border-steel bg-carbon p-4">
                <div className="text-[11px] text-dim">sum.rs</div>
                <div className="mt-2 text-[13px] leading-[1.9]">
                  {AFTER_LINES.map((line, i) => (
                    // eslint-disable-next-line react/no-array-index-key -- static doc content
                    <div key={i} className="whitespace-pre">
                      {highlightLine(line, "rust", `napi-${i}-`)}
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            type: "p",
            className: "mt-3 text-dim",
            children: (
              <>
                {"// "}
                {GLUE_ELIMINATED} lines of glue eliminated — proc_macro_attribute parses your fn
                with syn and emits the whole N-API surface: Rust ⇄ JS type marshalling, errors as JS
                exceptions, the name exported as-is (or renamed via #[napi(js_name = "...")]).
              </>
            ),
          },
        ],
      },
      {
        title: "HIGHLIGHTS",
        blocks: [
          {
            type: "list",
            items: [
              <>
                <span className="text-halo">#[napi] async fn</span> → Promise — the JS runtime
                awaits your Future
              </>,
              <>
                <span className="text-halo">#[napi] struct</span> → JS class — methods, getters,
                factories
              </>,
              <>
                <span className="text-halo">#[napi(factory)]</span> — constructors from Rust: new
                YourStruct() straight from JS
              </>,
              <>
                <span className="text-halo">#[napi(ts_return_type)]</span> — override the emitted
                .d.ts when inference isn&apos;t enough
              </>,
              <>
                <span className="text-wasi-cyan">ThreadsafeFunction</span> — call back into JS from
                any Rust thread, safely
              </>,
              <>
                <span className="text-wasi-cyan">WASI target</span> — the same macro compiles to
                wasm32-wasi, Node optional
              </>,
            ],
          },
        ],
      },
      {
        title: "ECOSYSTEM",
        blocks: [
          { type: "p", children: "Trusted by — your favorite tools, companies and more:" },
          {
            type: "list",
            items: [
              <DocLink key="vite-plus" href="https://viteplus.dev">
                vite-plus
              </DocLink>,
              <DocLink key="rspack" href="https://rspack.rs">
                Rspack
              </DocLink>,
              <DocLink key="ast-grep" href="https://ast-grep.github.io">
                ast-grep
              </DocLink>,
              <DocLink key="hf" href="https://huggingface.co">
                Hugging Face
              </DocLink>,
              <DocLink key="next" href="https://nextjs.org">
                Next.js
              </DocLink>,
              <DocLink key="cursor" href="https://cursor.com">
                Cursor
              </DocLink>,
              <DocLink key="ms" href="https://www.microsoft.com">
                Microsoft
              </DocLink>,
              <DocLink key="nvidia" href="https://www.nvidia.com">
                NVIDIA
              </DocLink>,
            ],
          },
        ],
      },
      {
        title: "LINKS",
        blocks: [
          {
            type: "kv",
            rows: [
              {
                k: "repo",
                children: (
                  <>
                    <DocLink href="https://github.com/napi-rs/napi-rs">napi-rs/napi-rs</DocLink> —{" "}
                    {facts.stars}
                  </>
                ),
              },
              {
                k: "docs",
                children: <DocLink href="https://napi.rs">napi.rs</DocLink>,
              },
              {
                k: "crate",
                children: (
                  <>
                    <DocLink href="https://crates.io/crates/napi">napi</DocLink> — v{facts.version}
                  </>
                ),
              },
            ],
          },
        ],
      },
    ],
    seeAlso: {
      layout: "list",
      entries: [
        { key: "affine", to: AFFINE_FORK, label: "AFFiNE(1)" },
        { key: "perfsee", to: PERFSEE_FORK, label: "perfsee(1)" },
        { key: "terminal", to: TERMINAL_HOME_PATH, label: "terminal(1)" },
      ],
    },
  };
}
