import { defineConfig } from "tsup";
import { copyFileSync } from "node:fs";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    wallet: "src/wallet.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ["react", "react-dom", "@solana/wallet-adapter-react", "@solana/web3.js"],
  // Ship the stylesheet verbatim at dist/styles.css (consumers import it explicitly).
  onSuccess: async () => {
    copyFileSync("src/styles.css", "dist/styles.css");
  },
});
