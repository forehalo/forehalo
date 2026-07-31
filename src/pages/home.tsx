import { useCallback, useState } from "react";
import { Hero } from "@/pages/home/hero";
import { LogSection } from "@/pages/home/log-section";
import { hasHomeIntroPlayed, markHomeIntroPlayed } from "@/pages/home/intro-session";

/**
 * HOME — `/home` · src/pages/index.rs (home.md).
 * The compiled identity: hero (name, annotation, status) flows straight into
 * the career as `git log --graph --author="Yii"`. Entered from the receipt
 * gate at `/` via QR. (No boot/loading screen — the hero plays on load.
 * Home opts out of the Layout's Footer.)
 *
 * Intro animation runs once per browser — the latch decision, the early-mark
 * timing, and the reveal hold are all owned by intro-session.ts (see there).
 * `skipIntro` is fixed at mount; the hero marks storage at the reveal point,
 * before the final verse line finishes.
 */

export default function Home() {
  // decided once by intro-session.ts (never re-read after deciding) — the
  // mark fires at the reveal point, before the final verse finishes (see there)
  const [skipIntro] = useState(() => hasHomeIntroPlayed());
  // the log's reveal waits for the hero's typing intro to finish
  const [introDone, setIntroDone] = useState(skipIntro);

  const onIntroDone = useCallback(() => {
    markHomeIntroPlayed();
    setIntroDone(true);
  }, []);

  return (
    // fixed top padding like /projects — NOT justify-center: centering
    // re-centers on every height change, so a log row's macroExpand
    // unfolding shifted the whole page under the cursor. Fixed padding
    // keeps the top anchored; expansion grows the page downward only.
    <div className="py-10 md:py-14">
      <Hero start onIntroDone={onIntroDone} skipIntro={skipIntro} />
      <LogSection start={introDone} skipReveal={skipIntro} />
    </div>
  );
}
