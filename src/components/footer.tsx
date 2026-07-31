import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { ArrowUpRight } from "lucide-react";
import { CompilePrint } from "@/components/motion/compile-print";
import { HaloButton } from "@/components/halo-button";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_COMPILE_OUT } from "@/lib/motion";
import { CRATES } from "@/lib/crates";

/**
 * Footer (design.md §8.7) — all pages. Contact command block (`cargo add
 * yii` + email HaloButton with the "compiling friendship" progress joke),
 * link columns, bottom micro line. Terminal reveals via compilePrint.
 */
export function Footer() {
  const { ref, inView } = useInViewOnce<HTMLElement>(0.15);
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState<number | null>(null);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("contact@thatyii.dev");
    } catch {
      /* noop */
    }
    if (reduced) {
      setProgress(100);
      window.setTimeout(() => setProgress(null), 1200);
      return;
    }
    // fake progress bar: compiling friendship… 100% ✓ (once per click)
    if (progress !== null && progress < 100) return;
    setProgress(0);
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(100, Math.round(((t - t0) / 1200) * 100));
      setProgress(p);
      if (p < 100) requestAnimationFrame(tick);
      else window.setTimeout(() => setProgress(null), 1600);
    };
    requestAnimationFrame(tick);
  };

  return (
    <footer id="contact" ref={ref} className="relative border-t border-steel bg-carbon">
      <div className="mx-auto w-full max-w-[1360px] px-6 pb-12 pt-24 md:px-16">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr]">
          {/* contact command block */}
          <div>
            <div className="overflow-hidden rounded-[3px] border border-steel bg-void">
              <div className="flex items-center border-b border-steel px-4 py-2.5">
                {/* macOS traffic lights */}
                <span className="flex items-center gap-2" aria-hidden>
                  <span className="size-3 rounded-full bg-[#ff5f57]" />
                  <span className="size-3 rounded-full bg-[#febc2e]" />
                  <span className="size-3 rounded-full bg-[#28c840]" />
                </span>
              </div>
              <div className="px-4 py-4 font-mono text-[13px] leading-[1.8]">
                <CompilePrint
                  start={inView}
                  tokens={[
                    <span key="p" className="text-halo">
                      ${" "}
                    </span>,
                    <span key="c" className="text-bone">
                      cargo add yii
                    </span>,
                  ]}
                  stagger={0.15}
                />
                <CompilePrint
                  start={inView}
                  delay={0.5}
                  className="block text-ash"
                  text="    Adding yii to dependencies"
                />
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <HaloButton onClick={copyEmail}>contact@thatyii.dev</HaloButton>
                </div>
                {progress !== null && (
                  <div className="mt-3 font-mono text-[11px] text-node">
                    compiling friendship… {progress}%{progress >= 100 ? " ✓" : ""}
                    <span className="ml-2 inline-block h-2 w-32 overflow-hidden rounded-[1px] bg-steel align-middle">
                      <span
                        className="block h-full bg-node transition-[width] duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* link columns */}
          <div className="grid grid-cols-2 gap-10">
            <LinkCol
              inView={inView}
              title="links"
              links={[
                {
                  label: "GitHub",
                  href: "https://github.com/forehalo",
                  icon: <SiGithub size={12} aria-hidden />,
                },
                {
                  label: "@forehalo",
                  href: "https://x.com/forehalo",
                  icon: <SiX size={12} aria-hidden />,
                },
              ]}
            />
            <LinkCol
              inView={inView}
              title="projects"
              delay={0.06}
              routes={CRATES.map((c) => ({ label: c.label, to: c.path }))}
            />
          </div>
        </div>

        {/* bottom line */}
        <div className="micro mt-20 border-t border-steel pt-6 text-dim">
          <span>© {new Date().getFullYear()} Liu Yi</span>
        </div>
      </div>
    </footer>
  );
}

function LinkCol({
  title,
  links,
  routes,
  inView,
  delay = 0,
}: {
  title: string;
  links?: { label: string; href: string; icon?: React.ReactNode }[];
  routes?: { label: string; to: string }[];
  inView: boolean;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const items = links ?? routes ?? [];
  return (
    <div>
      <h3 className="hud mb-4 text-dim">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <motion.li
            key={item.label}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, ease: EASE_COMPILE_OUT, delay: delay + i * 0.06 }}
          >
            {"href" in item ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
                className="-mx-1 -my-1.5 inline-flex items-center gap-1.5 px-1 py-1.5 font-mono text-[12px] text-ash transition-colors hover:text-halo"
              >
                {item.icon}
                {item.label}
                <ArrowUpRight size={12} aria-hidden />
              </a>
            ) : (
              <Link
                to={item.to}
                data-cursor="link"
                className="-mx-1 -my-1.5 inline-block px-1 py-1.5 font-mono text-[12px] text-ash transition-colors hover:text-halo"
              >
                {item.label}
              </Link>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
