import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { SiCursor, SiHuggingface, SiNextdotjs, SiNvidia } from "@icons-pack/react-simple-icons";
import { SectionHeader } from "@/components/section-header";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * N1.5 · Ecosystem — Trusted by.
 * Logo + name grid of well-known projects and companies shipping on napi-rs.
 * Closes the page after Anatomy.
 */

type TrustMark = {
  name: string;
  href: string;
  /** brand mark — simple-icons component or static asset */
  mark: ReactNode;
};

const SIZE = 28;

const TRUSTED: TrustMark[] = [
  {
    name: "vite-plus",
    href: "https://viteplus.dev",
    mark: (
      <img
        src="/ecosystem/vite-plus.svg"
        alt=""
        width={SIZE}
        height={SIZE}
        className="size-7 object-contain"
      />
    ),
  },
  {
    name: "Rspack",
    href: "https://rspack.rs",
    mark: (
      <img
        src="/ecosystem/rspack.png"
        alt=""
        width={SIZE}
        height={SIZE}
        className="size-7 object-contain"
      />
    ),
  },
  {
    name: "ast-grep",
    href: "https://ast-grep.github.io",
    mark: (
      <img
        src="/ecosystem/ast-grep.svg"
        alt=""
        width={SIZE}
        height={SIZE}
        className="size-7 object-contain"
      />
    ),
  },
  {
    name: "Hugging Face",
    href: "https://huggingface.co",
    mark: <SiHuggingface size={SIZE} color="default" aria-hidden />,
  },
  {
    name: "Next.js",
    href: "https://nextjs.org",
    mark: <SiNextdotjs size={SIZE} color="var(--bone)" aria-hidden />,
  },
  {
    name: "Cursor",
    href: "https://cursor.com",
    mark: <SiCursor size={SIZE} color="var(--bone)" aria-hidden />,
  },
  {
    name: "Microsoft",
    href: "https://www.microsoft.com",
    mark: (
      <img
        src="/ecosystem/microsoft.svg"
        alt=""
        width={SIZE}
        height={SIZE}
        className="size-7 object-contain"
      />
    ),
  },
  {
    name: "NVIDIA",
    href: "https://www.nvidia.com",
    mark: <SiNvidia size={SIZE} color="default" aria-hidden />,
  },
];

export function Ecosystem() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLUListElement>(0.2);

  return (
    <section id="ecosystem" className="relative scroll-mt-14 py-24">
      <div className="mx-auto max-w-[1360px] px-6 md:px-16">
        <SectionHeader slug="ecosystem" title="Trusted by" className="mb-4" />
        <p className="mb-12 max-w-xl font-grotesk text-[16px] font-medium leading-[1.7] text-ash md:text-[17px]">
          Your favorite tools, companies and more
        </p>

        <motion.ul
          ref={ref}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: reduced ? 0 : 0.05 } },
          }}
        >
          {TRUSTED.map((t) => (
            <motion.li
              key={t.name}
              variants={{
                hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: EASE_COMPILE_OUT },
                },
              }}
            >
              <a
                href={t.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
                className={cn(
                  "group flex h-full items-center gap-3 rounded-[3px] border border-steel bg-carbon px-4 py-4",
                  "transition-[border-color,background-color,box-shadow] duration-200",
                  "hover:border-halo/40 hover:bg-carbon-2 hover:shadow-[0_0_0_1px_var(--halo-soft)]",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-halo/50",
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[2px] border border-steel bg-void/60 transition-colors group-hover:border-steel-soft">
                  {t.mark}
                </span>
                <span className="min-w-0 font-mono text-[13px] font-medium text-bone/90 transition-colors group-hover:text-halo">
                  {t.name}
                </span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
