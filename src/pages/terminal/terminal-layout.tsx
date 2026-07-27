import { Outlet, useLocation } from "react-router";
import { MotionProvider } from "@/hooks/use-reduced-motion";
import { TERMINAL_HOME_PATH } from "@/lib/routes";
import { TerminalWindow } from "@/pages/terminal/terminal-window";

/**
 * TerminalLayout — layout route for the /terminal branch (terminal.md
 * §layout, pattern B: renders <Outlet/>, wired as a nested <Route> in
 * app.tsx). Deliberately NOT the site Layout: no TopBar / Footer / palette /
 * grain / Lenis. ThemeProvider is already global in main.tsx; MotionProvider
 * is included here so fork components can useReducedMotion().
 *
 * Window title comes from a pathname-keyed record — no switch statements.
 */
const TITLES: Record<string, string> = {
  [TERMINAL_HOME_PATH]: "yii@thatyii:~",
  "/terminal/napi": "yii@thatyii:~/projects/napi-rs",
  "/terminal/affine": "yii@thatyii:~/projects/affine",
  "/terminal/perfsee": "yii@thatyii:~/projects/perfsee",
};

export default function TerminalLayout() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? `yii@thatyii:~${pathname.slice(TERMINAL_HOME_PATH.length)}`;
  return (
    <MotionProvider>
      <TerminalWindow title={title}>
        <Outlet />
      </TerminalWindow>
    </MotionProvider>
  );
}
