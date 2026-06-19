import { Portal } from "./Portal";

// A (functionally real) demo merchant portal: 3 pricing tiers, a real subscribe
// flow, a real backend-proxied cancel, and a live webhook-events feed. Config is
// in .env (see config.ts); the cancel + webhook feed need the demo backend (server/).
export default function App() {
  return <Portal />;
}
