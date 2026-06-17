# Example — @relai-fi/subscriptions-react

A minimal Vite + React app showing the **real** integration: one `<PricingTable>`-style card
wired to a real plan and a real wallet (`@solana/wallet-adapter`).

Clicking **Subscribe**:

1. if no wallet is connected, it opens the wallet modal to connect;
2. once connected, it continues straight into the on-chain subscribe — prepare → sign → confirm.

Everything is driven by `.env`.

## Run

```bash
# from the package root, build the library once so `file:..` resolves dist/
npm install && npm run build

cd examples
cp .env.example .env     # then fill it in (see below)
npm install
npm run dev              # open the printed localhost URL
```

## Configure (`.env`)

`.env` is **gitignored** — never commit real values. Copy `.env.example` and set:

| Var | What |
|---|---|
| `VITE_RELAI_PLAN_ID` | The plan to charge from — the id after `?plan=` in your subscribe link. |
| `VITE_RELAI_API_URL` | RelAI API base (default `https://api.relai.fi`). Public endpoints only — no key. |
| `VITE_SOLANA_RPC` | Solana RPC for the connected wallet. **Must match the plan's network** (devnet vs mainnet). |

Make sure your wallet is on the same network as the plan, with a little SOL for the first
(authority-init) signature. RelAI fee-pays the recurring pulls after that.

## How the wiring works

- `src/Providers.tsx` mounts `ConnectionProvider` + `WalletProvider` + `WalletModalProvider`
  (wallet-standard wallets auto-register).
- `src/LiveDemo.tsx` builds the flow on the package hooks (`usePlanMeta`,
  `useSubscriptionStatus`, `useSubscribe`) plus `useRelaiWallet()` / `useRelaiSignAndSend()`
  from `@relai-fi/subscriptions-react/wallet`, so the Subscribe button can connect-then-subscribe.
- `src/config.ts` reads the `.env` values.
