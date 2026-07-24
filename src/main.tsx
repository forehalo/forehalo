import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "next-themes";
import "./index.css";
import App from "./app.tsx";
import { THEME_STORAGE_KEY } from "@/lib/theme";

// NOTE: no <React.StrictMode> — it double-runs canvas/cursor effects (react-dev.md).
createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    storageKey={THEME_STORAGE_KEY}
    disableTransitionOnChange
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>,
);
