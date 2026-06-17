# Example — @relai-fi/subscriptions-react

A minimal Vite + React app with two parts:

1. **Live** (top) — a real `<PricingTable>` wired to a real plan and a real wallet
   (`@solana/wallet-adapter`). Connect a wallet and clicking **Subscribe** signs and sends
   real transactions against the RelAI API.
2. **Style presets** (below) — the same component in several looks, driven by a **mock
   client** so it runs fully offline (no backend, no wallet) for previewing styles.

## Run

```bash
# from the package root, build the library once so `file:..` resolves dist/
npm install && npm run build

cd examples
cp .env.example .env     # then fill it in (see below)
npm install
npm run dev              # open the printed localhost URL
```

## Configure the live section (`.env`)

`.env` is **gitignored** — never commit real values. Copy `.env.example` and set:

| Var | What |
|---|---|
| `VITE_RELAI_PLAN_ID` | The plan to charge from — the id after `?plan=` in your subscribe link. |
| `VITE_RELAI_API_URL` | RelAI API base (default `https://api.relai.fi`). Public endpoints only — no key. |
| `VITE_SOLANA_RPC` | Solana RPC for the connected wallet. **Must match the plan's network** (devnet vs mainnet). |

The defaults in `src/config.ts` let it run before you create `.env`. Make sure your wallet
is on the same network as the plan, with a little SOL for the first (authority-init) signature.

## Style presets

`src/themes.ts` defines them, each a section in `src/App.tsx`:

| Preset | How it's themed |
|---|---|
| RelAI (default) | no `theme` prop — the shipped palette |
| Dark | `theme={{ card, background, foreground, border, primary }}` |
| Minimal / neutral | `theme={{ primary: "#111827", radius: "10px" }}` |
| Emerald / finance | `theme={{ primary: "#059669" }}` |
| Rounded / playful | `theme={{ primary: "#db2777", radius: "24px" }}` |
| Styled via CSS | no prop — overrides `--relai-*` on a wrapper class (`.demo-amber` in `example.css`) |

## How the live wiring works

`src/Providers.tsx` mounts `ConnectionProvider` + `WalletProvider` + `WalletModalProvider`
(wallet-standard wallets auto-register). `src/LiveDemo.tsx` reads the connected wallet via
`useRelaiWallet()` / `useRelaiSignAndSend()` from `@relai-fi/subscriptions-react/wallet` and
passes them, plus a live `createRelaiClient({ baseUrl })`, to `<PricingTable planId={…} />`.
