import { LiveDemo } from "./LiveDemo";

// Live example: a real plan + a real wallet, configured from .env (see config.ts).
// Clicking Subscribe prompts the wallet connection if needed, then runs the on-chain
// subscribe (prepare → sign → confirm).
export default function App() {
  return (
    <main className="demo">
      <LiveDemo />
    </main>
  );
}
