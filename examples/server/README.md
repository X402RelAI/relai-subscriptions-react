# Demo merchant backend

A tiny Express server that holds the merchant secrets the portal can't:

- **Webhooks** — receives RelAI events, verifies the HMAC with the Node SDK
  (`constructEvent`), and keeps a recent-events feed at `GET /events`.
- **Cancel proxy** — builds the cancel tx with the merchant key (`prepareCancel`),
  the portal signs it with the subscriber wallet, then `confirmCancel`.

## Run

```bash
cp .env.example .env     # set RELAI_SERVICE_KEY (+ RELAI_WEBHOOK_SECRET for webhooks)
npm install
npm run dev              # http://localhost:8787
```

Point the portal at it with `VITE_BACKEND_URL=http://localhost:8787` (see `../.env`).

## Seeing real webhooks

RelAI can't reach `localhost`. Expose this server with a tunnel and set your plan's
`webhookUrl` to the tunnel:

```bash
npx ngrok http 8787
# set the plan's webhookUrl to  https://<id>.ngrok.app/relai-webhook
```

Then subscribe / let a charge run, and events stream into `GET /events` → the portal's feed.

## Endpoints

| Route | What |
|---|---|
| `POST /relai-webhook` | RelAI webhook sink (raw body, HMAC-verified) |
| `GET /events` | recent verified events (newest first) |
| `POST /cancel/:subscriptionId/prepare` | → `{ wireTransaction }` for the subscriber to sign |
| `POST /cancel/:subscriptionId/confirm` | mark canceled after broadcast |
| `GET /health` | key/secret presence + event count |
