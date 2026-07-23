import { motion } from "framer-motion";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { CodeBlock } from "@/components/code-block";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";

/**
 * A4 · Engine — "the rust engine" (id: engine).
 * y-octo — his Rust port of Yjs — integrated into AFFiNE as the CRDT engine.
 * The section is the y-octo description, a pointer to the engine's repo,
 * and the `cargo test` Yjs-compat readout (illustrative).
 */

const TEST_OUTPUT = `$ cargo test --test yjs_compat
running 4 tests
test codec::yjs_update_roundtrip ... ok
test map::concurrent_writes_converge ... ok
test gc::tombstones_collect ... ok
test sync::three_replicas_one_state ... ok

test result: ok. 4 passed · 0 failed · 0 conflicts`;

export function EngineLink() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.25);

  return (
    <section
      id="engine"
      className="relative mx-auto max-w-[1360px] scroll-mt-14 px-6 py-24 md:px-16 md:py-32"
    >
      <SectionHeader slug="engine" title="the rust engine" />

      <motion.div
        ref={ref}
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: EASE_COMPILE_OUT }}
      >
        <p className="max-w-xl text-[16px] leading-relaxed text-bone/80">
          Ported from <span className="text-bone">Yjs</span> to Rust while at AFFiNE,{" "}
          <span className="text-rust">y-octo</span> was then integrated back into AFFiNE itself as
          the collaboration engine — the CRDT underneath every doc and every edgeless canvas, built
          for AFFiNE-scale documents.
        </p>

        <div className="mt-6">
          <a
            href="https://github.com/y-crdt/y-octo"
            target="_blank"
            rel="noreferrer"
            data-cursor="link"
            className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ash transition-colors hover:text-halo"
          >
            <SiGithub size={12} aria-hidden />
            y-crdt/y-octo
            <ArrowUpRight size={12} aria-hidden />
          </a>
        </div>

        {/* compat readout */}
        <div className="mt-8 max-w-[720px]">
          <CodeBlock
            code={TEST_OUTPUT}
            lang="sh"
            copyable={false}
            filename="y-octo — cargo test"
            fontSize={12.5}
          />
        </div>
      </motion.div>
    </section>
  );
}
