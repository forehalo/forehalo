import { useState } from "react";
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

  return (
    // single screen under the TopBar (pt-14 / 3.5rem), content vertically centered
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center">
      <Hero start onIntroDone={() => setIntroDone(true)} />
      <LogSection start={introDone} />
    </div>
  );
}
