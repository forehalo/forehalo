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
 * Intro animation runs once per browser (localStorage `fh-home-intro-played`);
 * remounts and reloads skip the type-in after the first play.
 */

export default function Home() {
  const skipIntro = hasHomeIntroPlayed();
  // the log's reveal waits for the hero's typing intro to finish
  const [introDone, setIntroDone] = useState(skipIntro);

  const onIntroDone = useCallback(() => {
    markHomeIntroPlayed();
    setIntroDone(true);
  }, []);

  return (
    // single screen under the TopBar (pt-14 / 3.5rem), content vertically centered
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center">
      <Hero start onIntroDone={onIntroDone} skipIntro={skipIntro} />
      <LogSection start={introDone} skipReveal={skipIntro} />
    </div>
  );
}
