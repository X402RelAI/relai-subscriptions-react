# Example — @relai-fi/subscriptions-react

A (functionally real) demo **merchant portal**:

- **3 pricing tiers** — the middle (Pro) is a real plan; subscribing runs the on-chain
  flow with the connected wallet. The side tiers are placeholders until you set real ids.
- **Your subscription** — the connected wallet's live status, with a **real cancel**
  (subscriber-signed, proxied through the demo backend so the merchant key stays server-side).
- **Webhook events** — a live feed of RelAI events received + HMAC-verified by the demo backend.

Everything hits the real RelAI API — "demo" is just the merchant (Acme) being fictional.

## Two pieces

```
examples/
  src/        the portal (Vite SPA) — talks to RelAI's public API directly
  server/     the demo merchant backend (Express + @relai-fi/subscriptions)
              holds the merchant key + webhook secret, proxies cancel, receives webhooks
```

## Run

```bash
# 1. build the library so file:.. resolves dist/
cd .. && npm install && npm run build

# 2. the portal
cd examples
cp .env.example .env            # set VITE_RELAI_PLAN_ID (+ network RPC)
npm install
npm run dev                     # http://localhost:5173

# 3. (optional) the backend — enables cancel + the webhook feed
cd server
cp .env.example .env            # set RELAI_SERVICE_KEY (+ RELAI_WEBHOOK_SECRET)
npm install
npm run dev                     # http://localhost:8787
```

Without the backend the portal still subscribes (public API). Cancel and the webhook
feed light up once the backend is running. See `server/README.md` for the tunnel setup
needed to receive real webhooks on localhost.

## Config (`.env`, gitignored)

| Var | What |
|---|---|
| `VITE_RELAI_PLAN_ID` | The functional (Pro) plan — `?plan=` id from your subscribe link. |
| `VITE_RELAI_PLAN_ID_2/3` | Optional — real ids make the Basic/Scale tiers functional too. |
| `VITE_RELAI_API_URL` | RelAI API base (default `https://api.relai.fi`). |
| `VITE_SOLANA_RPC` | RPC for the wallet — must match the plan's network. |
| `VITE_BACKEND_URL` | The demo backend (default `http://localhost:8787`). |

## How the pieces wire up

- **Subscribe** — portal → RelAI public API (`/s/:plan/subscribe` → sign → confirm). No key.
- **Cancel** — portal → backend `/cancel/:id/prepare` (merchant key builds the tx) → wallet
  signs → backend `/cancel/:id/confirm`. The `useCancel` hook drives the signature.
- **Webhooks** — RelAI → backend `/relai-webhook` (HMAC-verified) → `/events` → portal feed.
