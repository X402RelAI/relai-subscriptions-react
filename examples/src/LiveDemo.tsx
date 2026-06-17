import { useMemo } from "react";
import { createRelaiClient, PricingTable } from "@relai-fi/subscriptions-react";
import { useRelaiSignAndSend, useRelaiWallet } from "@relai-fi/subscriptions-react/wallet";
import { WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { API_URL, PLAN_ID } from "./config";

// The REAL integration: live client (public endpoints, no key) + the connected
// wallet-adapter wallet. Clicking Subscribe signs and sends real transactions.
export function LiveDemo() {
  const client = useMemo(() => createRelaiClient({ baseUrl: API_URL }), []);
  const wallet = useRelaiWallet();
  const signAndSend = useRelaiSignAndSend();
  const { setVisible } = useWalletModal();

  return (
    <section className="demo-section demo-section--live" style={{ background: "#0b0d14" }}>
      <div className="demo-section__inner">
        <header className="demo-live-head">
          <div>
            <h2 className="demo-head__title" style={{ color: "#f4f4f6" }}>
              Live — real plan, real wallet
            </h2>
            <p className="demo-head__note">
              plan {PLAN_ID} · {API_URL}
            </p>
          </div>
          <WalletMultiButton />
        </header>

        <PricingTable
          planId={PLAN_ID}
          client={client}
          wallet={wallet}
          signAndSend={signAndSend}
          onConnectWallet={() => setVisible(true)}
          theme={{
            primary: "#a78bfa",
            background: "transparent",
            card: "#13141d",
            foreground: "#f4f4f6",
            mutedForeground: "#9aa0ae",
            border: "#262838",
          }}
          loadingText="Loading the plan from RelAI…"
          errorText="Couldn't load this plan — check VITE_RELAI_PLAN_ID and VITE_RELAI_API_URL."
        />
      </div>
    </section>
  );
}
