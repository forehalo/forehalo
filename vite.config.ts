import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite-plus";

// https://vite.dev/config/
export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    plugins: ["oxc", "typescript", "unicorn", "react"],
    ignorePatterns: ["dist"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      // Convention: all source files are kebab-case (src/**). Config files
      // like vite.config.ts carry a dotted basename and are exempt.
      "unicorn/filename-case": [
        "error",
        { case: "kebabCase", ignore: ["\\.config\\.", "\\.d\\.ts$"] },
      ],
    },
  },
  base: "/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
