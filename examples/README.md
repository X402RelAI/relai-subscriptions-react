# Example — @relai-fi/subscriptions-react

A minimal Vite + React app that renders one `<PricingTable>` in several styles. It runs
**fully offline** — a mock client and in-memory plan data stand in for the RelAI API and a
wallet, so clicking **Subscribe** drives the real button state machine
(Subscribe → Confirm in wallet… → Activating… → Subscribed) with nothing to set up.

## Run

```bash
# from the package root, build the library once so `file:..` resolves dist/
npm install && npm run build

cd examples
npm install
npm run dev      # open the printed localhost URL
```

## What it shows

`src/themes.ts` defines the presets, each a section in `src/App.tsx`:

| Preset | How it's themed |
|---|---|
| RelAI (default) | no `theme` prop — the shipped palette |
| Dark | `theme={{ card, background, foreground, border, primary }}` |
| Minimal / neutral | `theme={{ primary: "#111827", radius: "10px" }}` |
| Emerald / finance | `theme={{ primary: "#059669" }}` |
| Rounded / playful | `theme={{ primary: "#db2777", radius: "24px" }}` |
| Styled via CSS | no prop — overrides `--relai-*` on a wrapper class (`.demo-amber` in `example.css`) |

## Make it real

Swap the mock for the live integration:

```tsx
// remove createMockClient / demoSignAndSend / DEMO_WALLET
import { useRelaiSignAndSend, useRelaiWallet } from "@relai-fi/subscriptions-react/wallet";

<PricingTable
  planIds={["pl_basic", "pl_pro", "pl_scale"]}  // your real plan ids
  highlightPlanId="pl_pro"
  wallet={useRelaiWallet()}
  signAndSend={useRelaiSignAndSend()}
  cards={CARD_CONFIG}
/>
```

(That path needs a `@solana/wallet-adapter` `WalletProvider` above the table.)
