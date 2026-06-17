import { defineConfig } from "vitest/config";

export default defineConfig({
  // Transform TSX with the automatic JSX runtime (no @vitejs/plugin-react needed).
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
