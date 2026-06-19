// Demo MERCHANT backend for the example portal.
//
// Why a backend at all: building a cancel tx and verifying webhooks both need the
// merchant's API key + webhook secret — which must NEVER live in the browser. This
// little server holds them, so the portal (SPA) stays key-free:
//   - receives + verifies RelAI webhooks (HMAC) and keeps a recent-events feed
//   - proxies the authenticated cancel (merchant builds the tx, subscriber signs)
//
// Uses the Node SDK @relai-fi/subscriptions. Run it with a public tunnel (ngrok)
// and point your plan's webhookUrl at <tunnel>/relai-webhook to see live events.

import express from "express";
import { RelaiSubscriptions, constructEvent } from "@relai-fi/subscriptions";

const PORT = Number(process.env.PORT || 8787);
const API_URL = process.env.RELAI_API_URL || "https://api.relai.fi";
const SERVICE_KEY = process.env.RELAI_SERVICE_KEY || ""; // merchant key that owns the plans
const WEBHOOK_SECRET = process.env.RELAI_WEBHOOK_SECRET || ""; // plan.webhookSecret

const relai = new RelaiSubscriptions({ apiKey: SERVICE_KEY, baseUrl: API_URL });

/** In-memory ring buffer of the most recent webhook events (newest first). */
const events = [];
const MAX_EVENTS = 50;

const app = express();

// Allow the local portal (different origin) to call this backend.
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ── Webhook receiver ────────────────────────────────────────────────────────
// MUST be mounted before any JSON body parser — the HMAC is over the raw bytes.
app.post("/relai-webhook", express.raw({ type: "*/*" }), (req, res) => {
  if (!WEBHOOK_SECRET) return res.status(500).json({ error: "RELAI_WEBHOOK_SECRET not set" });
  let event;
  try {
    event = constructEvent(req.body, req.headers["x-relai-signature"], WEBHOOK_SECRET);
  } catch {
    return res.status(401).json({ error: "invalid signature" });
  }
  events.unshift({ ...event, receivedAt: new Date().toISOString() });
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  console.log(`[webhook] ${event.type} · ${event.data?.subscriberWallet ?? ""}`);
  res.json({ ok: true });
});

app.use(express.json());

// Recent events for the portal's live feed.
app.get("/events", (_req, res) => res.json({ events }));

// ── Cancel proxy (merchant key builds the tx; subscriber signs in the browser) ─
app.post("/cancel/:subscriptionId/prepare", async (req, res) => {
  if (!SERVICE_KEY) return res.status(500).json({ error: "RELAI_SERVICE_KEY not set" });
  try {
    const out = await relai.subscriptions.prepareCancel(req.params.subscriptionId);
    res.json(out); // { wireTransaction }
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/cancel/:subscriptionId/confirm", async (req, res) => {
  if (!SERVICE_KEY) return res.status(500).json({ error: "RELAI_SERVICE_KEY not set" });
  try {
    const subscription = await relai.subscriptions.confirmCancel(req.params.subscriptionId);
    res.json({ subscription });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/health", (_req, res) =>
  res.json({ ok: true, hasKey: !!SERVICE_KEY, hasWebhookSecret: !!WEBHOOK_SECRET, events: events.length }),
);

app.listen(PORT, () => {
  console.log(`[merchant-backend] http://localhost:${PORT}`);
  if (!SERVICE_KEY) console.log("  ⚠ RELAI_SERVICE_KEY not set — cancel disabled");
  if (!WEBHOOK_SECRET) console.log("  ⚠ RELAI_WEBHOOK_SECRET not set — webhook verification disabled");
});
