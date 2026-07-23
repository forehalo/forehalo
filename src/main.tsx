import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./app.tsx";

// NOTE: no <React.StrictMode> — it double-runs canvas/cursor effects (react-dev.md).
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
