import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Some wallet libs reference `global`; map it to globalThis in the browser.
  define: { global: "globalThis" },
  // The example links the package via `file:..`; dedupe React so hooks share one copy.
  resolve: { dedupe: ["react", "react-dom"] },
});
