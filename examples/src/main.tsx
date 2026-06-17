import { Buffer } from "buffer";
// @solana/web3.js expects a global Buffer in the browser.
if (!globalThis.Buffer) globalThis.Buffer = Buffer;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@relai-fi/subscriptions-react/styles.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./example.css";
import { Providers } from "./Providers";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
