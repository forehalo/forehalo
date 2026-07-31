import { Outlet, useLocation } from "react-router";
import { CRATES, TERMINAL_HOME_PATH } from "@/lib/crates";
import { TerminalWindow } from "@/pages/terminal/terminal-window";

/**
 * TerminalLayout — layout route for the /terminal branch (terminal.md
 * §layout, pattern B: renders <Outlet/>, wired as a nested <Route> in
 * app.tsx). Deliberately NOT the site Layout: no TopBar / Footer / palette /
 * grain / Lenis. ThemeProvider + MotionProvider are global in main.tsx, so
 * fork components can useReducedMotion() from there.
 *
 * Window title comes from a pathname-keyed record — no switch statements.
 * Fork titles derive from the route registry (@/lib/crates).
 */
const TITLES: Record<string, string> = {
  [TERMINAL_HOME_PATH]: "yii@thatyii:~",
  ...Object.fromEntries(CRATES.map((c) => [c.fork.route, c.fork.title] as const)),
};

export default function TerminalLayout() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? `yii@thatyii:~${pathname.slice(TERMINAL_HOME_PATH.length)}`;
  return (
    <TerminalWindow title={title}>
      <Outlet />
    </TerminalWindow>
  );
}
