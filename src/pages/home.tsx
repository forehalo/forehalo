import { useEffect, useRef, useState } from "react";
import { Hero } from "@/pages/home/hero";
import { LogSection } from "@/pages/home/log-section";

/**
 * HOME — `/` · src/pages/index.rs (home.md).
 * The first screen is the compiled identity: hero (name, annotation, status)
 * flows straight into the career as `git log --graph --author="Yii"`.
 * (No boot/loading screen — the hero plays on load. Home opts out of the
 * Layout's Footer.)
 */

export default function Home() {
  // the log's reveal waits for the hero's typing intro to finish
  const [introDone, setIntroDone] = useState(false);

  // Pin the hero: compute the centered offset once (everything closed), then
  // hold it as fixed padding — expanding a log row grows the page downward
  // instead of re-centering, which used to shift the title up.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [padTop, setPadTop] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const free = window.innerHeight - 56 - el.scrollHeight; // 56 = TopBar
      setPadTop(Math.max(0, free / 2));
    };
    const t1 = window.setTimeout(measure, 50);
    const t2 = window.setTimeout(measure, 1200); // after fonts settle
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    // home is a single screen: vertically centered under the TopBar, then pinned
    <div
      ref={wrapRef}
      className={
        padTop === null ? "flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center" : undefined
      }
      style={padTop === null ? undefined : { paddingTop: padTop }}
    >
      <Hero start onIntroDone={() => setIntroDone(true)} />
      <LogSection start={introDone} />
    </div>
  );
}
