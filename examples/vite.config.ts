import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Some wallet libs reference `global`; map it to globalThis in the browser.
  define: { global: "globalThis" },
  // The example links the package via `file:..`. Dedupe React AND the wallet libs so the
  // package's wallet hooks and this app's WalletProvider share ONE context (otherwise
  // useWallet throws "read publicKey on a WalletContext without providing one").
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "@solana/wallet-adapter-react",
      "@solana/wallet-adapter-base",
      "@solana/web3.js",
    ],
  },
});
