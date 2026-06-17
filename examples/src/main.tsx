import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@relai-fi/subscriptions-react/styles.css";
import "./example.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
