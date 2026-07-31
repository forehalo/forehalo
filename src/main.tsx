import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "next-themes";
import "./index.css";
import App from "./app.tsx";
import { MotionProvider } from "@/hooks/use-reduced-motion";
import { THEME_STORAGE_KEY } from "@/lib/theme";

// NOTE: no <React.StrictMode> — it double-runs some layout effects (react-dev.md).
createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    storageKey={THEME_STORAGE_KEY}
    disableTransitionOnChange
  >
    {/* MotionProvider is global so reduced-motion state has ONE owner —
        site chrome (Layout) and the /terminal fork both read it. */}
    <MotionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MotionProvider>
  </ThemeProvider>,
);
