# @relai-fi/subscriptions-react

Drop-in **React UI** for [RelAI subscriptions](https://relai.fi/documentation/subscriptions) — a
Stripe-style pricing table and subscribe button for **recurring USDC billing on Solana**.

- **One component** — `<PricingTable>` fetches your plans, renders cards, and runs the subscribe flow.
- **No API key in the browser** — uses only RelAI's public endpoints (plan terms, status, subscribe).
- **Wallet-agnostic** — pass a `signAndSend`, or use the built-in `@solana/wallet-adapter` helper.
- **Themeable** — ship the stylesheet, override a few CSS variables, done.

```bash
npm install @relai-fi/subscriptions-react
```

> Peer deps: `react`/`react-dom` (≥18). The wallet helper additionally needs
> `@solana/wallet-adapter-react` + `@solana/web3.js` (optional — skip them if you bring your own `signAndSend`).

Create and price your plans first with the [`@relai-fi/subscriptions`](https://relai.fi/documentation/subscriptions)
SDK or the dashboard, then drop their `planId`s into the table below.

---

## Quick start

Import the stylesheet once (e.g. in your root layout), then render the table.

```tsx
import "@relai-fi/subscriptions-react/styles.css";
import { PricingTable } from "@relai-fi/subscriptions-react";
import { useRelaiSignAndSend, useRelaiWallet } from "@relai-fi/subscriptions-react/wallet";

export function Pricing() {
  const wallet = useRelaiWallet();        // from your <WalletProvider>
  const signAndSend = useRelaiSignAndSend();

  return (
    <PricingTable
      planIds={["pl_basic", "pl_pro"]}
      highlightPlanId="pl_pro"
      wallet={wallet}
      signAndSend={signAndSend}
      cards={{
        pl_basic: { description: "For side projects", features: ["1 project", "Community support"] },
        pl_pro:   { description: "For teams",        features: ["Unlimited projects", "Webhooks", "Priority support"] },
      }}
      onSubscribed={(sub) => console.log("active:", sub.subscriptionId)}
    />
  );
}
```

That renders a pricing table, and clicking **Subscribe** runs the full on-chain flow
(prepare → sign → confirm) against the subscriber's wallet. Cards the wallet already
holds show **Subscribed** automatically.

### Not using wallet-adapter?

Pass your own `signAndSend` — anything that signs + broadcasts a base64 Solana tx and
returns the signature (Privy, Crossmint, a backend signer, a raw `Keypair`…):

```tsx
<PricingTable
  planId="pl_pro"
  wallet={address}
  signAndSend={async (txBase64) => {
    const sig = await myWallet.signAndSendBase64(txBase64);
    return sig; // transaction signature
  }}
/>
```

### Skip the props with a provider

```tsx
import { RelaiProvider } from "@relai-fi/subscriptions-react";

<RelaiProvider wallet={wallet} signAndSend={signAndSend} theme={{ primary: "#7c3aed" }}>
  <PricingTable planIds={["pl_basic", "pl_pro"]} highlightPlanId="pl_pro" />
</RelaiProvider>
```

---

## Components

### `<PricingTable>`

| Prop | Type | Notes |
|---|---|---|
| `planIds` | `string[]` | Plans to show, in order. Or use `plans` / `planId`. |
| `plans` | `PlanMeta[]` | Preloaded plan metadata (skips fetching). |
| `planId` | `string` | Shorthand for a one-plan table. |
| `cards` | `Record<planId, { features?, description?, highlight?, badge? }>` | Per-plan presentation. |
| `highlightPlanId` | `string` | Emphasize one plan (adds a "Popular" ribbon). |
| `wallet` | `string` | Connected subscriber address. |
| `signAndSend` | `SignAndSend` | Signs + sends the wire tx. |
| `theme` | `RelaiTheme` | CSS-variable overrides. |
| `baseUrl` | `string` | Defaults to `https://api.relai.fi`. |
| `onSubscribed` / `onError` / `onConnectWallet` | callbacks | |
| `labels` | `SubscribeButtonLabels` | Button copy overrides. |

### `<PricingCard>`

One card for a `PlanMeta` you already have. Same subscribe props as the button, plus
`features`, `description`, `highlight`, `badge`.

### `<SubscribeButton>`

The atomic piece — a single button for a `planId` that resolves wallet / `signAndSend`
from props or `<RelaiProvider>`, runs the flow, and reflects live state
(`Preparing… → Confirm in wallet… → Activating… → Subscribed`).

```tsx
<SubscribeButton planId="pl_pro" wallet={address} signAndSend={signAndSend} />
```

---

## Hooks

For fully custom UI:

```tsx
import { usePlanMeta, useSubscriptionStatus, useSubscribe, createRelaiClient } from "@relai-fi/subscriptions-react";

const client = createRelaiClient();                       // public endpoints, no key
const { plan } = usePlanMeta("pl_pro", client);
const { status } = useSubscriptionStatus("pl_pro", wallet, client);
const { subscribe, state, busy, error } = useSubscribe({ planId: "pl_pro", wallet, signAndSend });
```

`state`: `idle | preparing | signing | confirming | done | error`.

---

## Theming

Set the `theme` prop (mapped to CSS variables on the component root) or override the
variables in your own CSS. Defaults to the RelAI electric-violet palette, light surface.

```tsx
<PricingTable planIds={ids} theme={{ primary: "#7c3aed", radius: "20px", card: "#0f1117", foreground: "#fff" }} />
```

```css
.relai-root {
  --relai-primary: #7c3aed;
  --relai-card: #ffffff;
  --relai-fg: #0c0e16;
  --relai-muted-fg: #6b7280;
  --relai-border: #e7e8ee;
  --relai-radius: 16px;
}
```

---

## How it works

All calls hit RelAI's **public** subscription endpoints — no service key is exposed to the browser:

- `GET /s/:planId/meta` — plan terms for the card
- `GET /s/:planId/status?wallet=…` — drives the "Subscribed" state
- `POST /s/:planId/subscribe` → `POST /s/:planId/confirm` — the two-stage, wallet-signed subscribe

The subscriber signs at most two transactions: a one-time delegate-authority init
(first subscribe per wallet), then the subscribe itself. RelAI fee-pays the recurring pulls.

## License

MIT
