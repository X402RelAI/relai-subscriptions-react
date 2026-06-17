import { useMemo } from "react";
import { PricingTable } from "@relai-fi/subscriptions-react";
import { CARD_CONFIG, PLANS } from "./plans";
import { createMockClient, demoSignAndSend, DEMO_WALLET } from "./mockClient";
import { THEMES } from "./themes";
import type { ThemePreset } from "./themes";

function Section({ preset }: { preset: ThemePreset }) {
  // One mock client per section so a simulated subscribe stays local to it.
  const client = useMemo(() => createMockClient(PLANS), []);

  return (
    <section className="demo-section" style={{ background: preset.surface }}>
      <div className="demo-section__inner">
        <header className="demo-head" style={{ color: preset.onSurface }}>
          <h2 className="demo-head__title">{preset.label}</h2>
          <p className="demo-head__note">{preset.note}</p>
        </header>

        <div className={preset.cssClass}>
          <PricingTable
            plans={PLANS}
            client={client}
            wallet={DEMO_WALLET}
            signAndSend={demoSignAndSend}
            highlightPlanId="pl_pro"
            theme={preset.theme}
            cards={CARD_CONFIG}
          />
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="demo">
      <header className="demo-hero">
        <h1>@relai-fi/subscriptions-react</h1>
        <p>
          One <code>&lt;PricingTable&gt;</code>, several looks. Click <strong>Subscribe</strong> —
          it's wired to a mock client, so the button runs the real state machine
          (Subscribe → Confirm in wallet… → Activating… → Subscribed) with no backend or wallet.
        </p>
      </header>

      {THEMES.map((preset) => (
        <Section key={preset.id} preset={preset} />
      ))}

      <footer className="demo-foot">
        Swap the mock client for the real one — drop <code>planIds</code>, a wallet, and a{" "}
        <code>signAndSend</code> — and these tables charge recurring USDC on Solana.
      </footer>
    </main>
  );
}
