import { CompilePrint } from "@/components/motion/compile-print";

/**
 * 404 page — keeps unknown routes resolving with the design's chrome
 * (TopBar, Footer).
 */
export function StubPage({ file, title }: { file: string; title: string }) {
  return (
    <section id="stub" className="grid min-h-[70vh] place-items-center px-6">
      <div className="text-center">
        <CompilePrint text={`// ${file}`} className="micro mb-4 block text-dim" />
        <h1 className="font-grotesk text-5xl font-bold text-bone">{title}</h1>
        <p className="mt-4 font-mono text-[12px] text-ash">
          <span className="text-halo">▸</span> error[E0433]: unresolved route — this page does not
          exist
        </p>
      </div>
    </section>
  );
}
