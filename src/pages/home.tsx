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
 *
 * `skipIntro` is fixed at mount. The hero marks localStorage as soon as the
 * log may reveal (before the final verse line finishes typing); re-reading
 * storage on every render would flip skipIntro mid-animation and freeze the
 * typewriter on the last line.
 */

export default function Home() {
  // once per mount — do not re-read after markHomeIntroPlayed()
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
