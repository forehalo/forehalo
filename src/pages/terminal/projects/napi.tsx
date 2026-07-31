import { Link } from "react-router";
import { highlightLine } from "@/lib/highlight";
import { formatStars } from "@/lib/projects";
import { crateByPath, TERMINAL_HOME_PATH } from "@/lib/crates";
import { DocHeader, DocKv, DocLink, DocList, DocSection } from "@/pages/terminal/doc";
import { PagerHint, usePager } from "@/pages/terminal/pager";
import { AFTER_CODE, GLUE_ELIMINATED, RAW_TOTAL } from "@/pages/napi/raw-binding";

/** this fork's crate — identity from the route registry, never a re-searched literal */
const crate = crateByPath("/napi")!;
/** sibling fork routes for SEE ALSO — derived from the registry */
const AFFINE_FORK = crateByPath("/affine")!.fork.route;
const PERFSEE_FORK = crateByPath("/perfsee")!.fork.route;
/** stars/version are registry facts — formatted here, never hardcoded */
const stars = crate.project?.stars ? formatStars(crate.project.stars) : "";
const version = crate.project?.version ?? "";

const AFTER_LINES = AFTER_CODE.split("\n");

/**
 * /terminal/napi — the napi project page re-rendered as a man page
 * (terminal.md §projects). Every fact is lifted from the real page
 * (@/pages/napi): the hero one-liner, the Expander's 118→4 line math and
 * AFTER_CODE, the Anatomy capability glosses, and the Ecosystem trust list.
 * Stars and crate version come from the route registry (@/lib/crates →
 * @/lib/projects, formatted by `formatStars`). Text only — nothing
 * animates, so no reduced-motion gating is needed.
 */
export default function TerminalNapi() {
  // less(1) keys: j/k scroll, q quits to /terminal (terminal.md §pager)
  usePager();
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-6 md:px-10">
      <div className="max-w-3xl font-mono">
        <DocHeader title="NAPI-RS(1)" tagline={crate.project?.tagline} />

        <DocSection title="NAME">
          <p>
            napi-rs — a framework for building pre-compiled Node.js addons in Rust via Node-API. One
            attribute, zero glue. Also targets WASI.
          </p>
        </DocSection>

        <DocSection title="DESCRIPTION">
          <p>
            Co-creator. Introduced the <span className="text-halo">#[napi]</span> proc macro,
            lowering the barrier of binding Rust crates to Node.js native addons and WASI.
          </p>
          <p className="mt-2">
            Without the macro, exporting one Rust function to Node means {RAW_TOTAL} lines of raw
            N-API ceremony — napi_module_register, napi_create_function, napi_get_cb_info,
            type-marshalling match arms. With it, the same binding is {AFTER_LINES.length} lines:
          </p>
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
          <p className="mt-3 text-dim">
            {"// "}
            {GLUE_ELIMINATED} lines of glue eliminated — proc_macro_attribute parses your fn with
            syn and emits the whole N-API surface: Rust ⇄ JS type marshalling, errors as JS
            exceptions, the name exported as-is (or renamed via #[napi(js_name = "...")]).
          </p>
        </DocSection>

        <DocSection title="HIGHLIGHTS">
          <DocList
            items={[
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
            ]}
          />
        </DocSection>

        <DocSection title="ECOSYSTEM">
          <p>Trusted by — your favorite tools, companies and more:</p>
          <DocList
            items={[
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
            ]}
          />
        </DocSection>

        <DocSection title="LINKS">
          <DocKv k="repo">
            <DocLink href="https://github.com/napi-rs/napi-rs">napi-rs/napi-rs</DocLink> — {stars}
          </DocKv>
          <DocKv k="docs">
            <DocLink href="https://napi.rs">napi.rs</DocLink>
          </DocKv>
          <DocKv k="crate">
            <DocLink href="https://crates.io/crates/napi">napi</DocLink> — v{version}
          </DocKv>
        </DocSection>

        <DocSection title="SEE ALSO">
          <DocList
            items={[
              <Link key="affine" to={AFFINE_FORK} className="text-halo underline">
                AFFiNE(1)
              </Link>,
              <Link key="perfsee" to={PERFSEE_FORK} className="text-halo underline">
                perfsee(1)
              </Link>,
              <Link key="terminal" to={TERMINAL_HOME_PATH} className="text-halo underline">
                terminal(1)
              </Link>,
            ]}
          />
        </DocSection>

        <PagerHint />
      </div>
    </div>
  );
}
