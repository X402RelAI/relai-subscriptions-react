import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // The example links the package via `file:..`; dedupe React so hooks share one copy.
  resolve: { dedupe: ["react", "react-dom"] },
});
