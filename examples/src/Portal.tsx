import { useEffect, useMemo, useState } from "react";
import {
  createRelaiClient,
  PricingCard,
  usePlanMeta,
  useSubscriptionStatus,
  useCancel,
  themeToCssVars,
  formatNetwork,
} from "@relai-fi/subscriptions-react";
import type { RelaiClient } from "@relai-fi/subscriptions-react";
import { useRelaiSignAndSend, useRelaiWallet } from "@relai-fi/subscriptions-react/wallet";
import { WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { API_URL, BACKEND_URL, PLANS, PRIMARY_PLAN_ID } from "./config";
import type { PlanTier } from "./config";

const THEME = themeToCssVars({
  primary: "#a78bfa",
  background: "transparent",
  card: "#13141d",
  foreground: "#f4f4f6",
  mutedForeground: "#9aa0ae",
  border: "#262838",
});

const Check = () => (
  <svg className="relai-check" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path
      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.29 6.8-6.8a1 1 0 0 1 1.4 0Z"
      fill="currentColor"
    />
  </svg>
);

/** A real, functional tier — loads its plan from the API and subscribes for real. */
function RealCard({
  tier,
  client,
  wallet,
  signAndSend,
  onConnect,
}: {
  tier: PlanTier;
  client: RelaiClient;
  wallet?: string;
  signAndSend: (tx: string) => Promise<string>;
  onConnect: () => void;
}) {
  const { plan, loading, error } = usePlanMeta(tier.id, client);
  if (loading) {
    return (
      <div className="relai-card">
        <div className="relai-state relai-state--loading">Loading {tier.tier}…</div>
      </div>
    );
  }
  if (error || !plan) {
    return (
      <div className="relai-card">
        <div className="relai-state relai-state--error">{tier.tier} unavailable</div>
      </div>
    );
  }
  return (
    <PricingCard
      plan={plan}
      client={client}
      wallet={wallet}
      signAndSend={signAndSend}
      onConnectWallet={onConnect}
      highlight={tier.highlight}
      description={tier.blurb}
      features={tier.features}
    />
  );
}

/** A non-functional placeholder tier (no real plan id configured). */
function DemoCard({ tier }: { tier: PlanTier }) {
  return (
    <div className={`relai-card${tier.highlight ? " relai-card--highlight" : ""}`}>
      <div className="relai-card__head">
        <h3 className="relai-card__name">{tier.tier}</h3>
        <p className="relai-card__desc">{tier.blurb}</p>
      </div>
      <div className="relai-price">
        <span className="relai-price__amount">{tier.price}</span>
        <span className="relai-price__unit">
          <span className="relai-price__ticker">USDC</span>
          <span className="relai-price__period">/mo</span>
        </span>
      </div>
      <p className="relai-price__caption">Demo tier · set a real plan id</p>
      <button type="button" className="relai-btn" disabled>
        Demo plan
      </button>
      <ul className="relai-features">
        {tier.features.map((f) => (
          <li key={f} className="relai-features__item">
            <Check />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Your subscription" — status for the real plan + a real (backend-proxied) cancel. */
function YourSubscription({
  client,
  wallet,
  signAndSend,
}: {
  client: RelaiClient;
  wallet: string;
  signAndSend: (tx: string) => Promise<string>;
}) {
  const { status, loading, refetch } = useSubscriptionStatus(PRIMARY_PLAN_ID, wallet, client);
  const subscriptionId = status?.subscriptionId;

  const { cancel, state: cancelState, busy: cancelBusy, error: cancelError } = useCancel({
    signAndSend,
    prepareCancel: async () => {
      const r = await fetch(`${BACKEND_URL}/cancel/${subscriptionId}/prepare`, { method: "POST" });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "couldn't reach the merchant backend");
      return r.json();
    },
    confirmCancel: async () => {
      const r = await fetch(`${BACKEND_URL}/cancel/${subscriptionId}/confirm`, { method: "POST" });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "confirm failed");
    },
    onCanceled: () => refetch(),
  });

  const cancelLabel =
    cancelState === "preparing"
      ? "Preparing…"
      : cancelState === "signing"
        ? "Confirm in your wallet…"
        : cancelState === "confirming"
          ? "Canceling…"
          : cancelState === "error"
            ? "Try again"
            : "Cancel subscription";

  return (
    <section className="panel relai-root" style={THEME}>
      <h2 className="panel__title">Your subscription</h2>
      {loading ? (
        <p className="panel__muted">Checking…</p>
      ) : !subscriptionId ? (
        <p className="panel__muted">Not subscribed to the Pro plan yet — subscribe above.</p>
      ) : (
        <div className="panel__row">
          <div>
            <span className={`badge badge--${status?.status}`}>{status?.status}</span>
            <span className="panel__muted" style={{ marginLeft: 10 }}>
              {formatNetwork((status as { network?: "solana" | "solana-devnet" }).network ?? "solana-devnet")}
              {" · "}
              sub {subscriptionId.slice(0, 6)}…
            </span>
          </div>
          {(status?.status === "active" || status?.status === "past_due") && (
            <button
              type="button"
              className="relai-btn panel__cancel"
              data-state={cancelState}
              disabled={cancelBusy}
              onClick={() => void cancel()}
            >
              {cancelBusy && <span className="relai-spinner" aria-hidden="true" />}
              {cancelLabel}
            </button>
          )}
        </div>
      )}
      {cancelError && <p className="panel__error">{cancelError.message}</p>}
    </section>
  );
}

interface FeedEvent {
  type: string;
  receivedAt?: string;
  data?: { subscriberWallet?: string };
}

/** Live feed of webhook events received by the demo backend. */
function EventsFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [reachable, setReachable] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/events`);
        const j = await r.json();
        if (alive) {
          setEvents(j.events ?? []);
          setReachable(true);
        }
      } catch {
        if (alive) setReachable(false);
      }
    };
    void tick();
    const t = setInterval(tick, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <section className="panel relai-root" style={THEME}>
      <h2 className="panel__title">Webhook events</h2>
      {reachable === false ? (
        <p className="panel__muted">
          Start the demo backend (<code>examples/server</code>) to receive RelAI webhooks.
        </p>
      ) : events.length === 0 ? (
        <p className="panel__muted">No events yet — subscribe, cancel, or let a charge run.</p>
      ) : (
        <ul className="feed">
          {events.map((e, i) => (
            <li key={i} className="feed__item">
              <span className={`badge badge--${e.type.split(".")[1]}`}>{e.type}</span>
              <span className="feed__wallet">{e.data?.subscriberWallet?.slice(0, 6) ?? ""}…</span>
              <span className="feed__time">{e.receivedAt ? new Date(e.receivedAt).toLocaleTimeString() : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function Portal() {
  const client = useMemo(() => createRelaiClient({ baseUrl: API_URL }), []);
  const wallet = useRelaiWallet();
  const signAndSend = useRelaiSignAndSend();
  const { setVisible } = useWalletModal();

  return (
    <div className="portal">
      <header className="portal__head">
        <div>
          <h1>Acme — subscribe</h1>
          <p className="portal__sub">Recurring USDC on Solana. Pick a plan, pay with one signature.</p>
        </div>
        <WalletMultiButton />
      </header>

      <div className="relai-root" style={THEME}>
        <div className="relai-table portal__tiers">
          {PLANS.map((tier) =>
            tier.id ? (
              <RealCard
                key={tier.tier}
                tier={tier}
                client={client}
                wallet={wallet}
                signAndSend={signAndSend}
                onConnect={() => setVisible(true)}
              />
            ) : (
              <DemoCard key={tier.tier} tier={tier} />
            ),
          )}
        </div>
      </div>

      {wallet && PRIMARY_PLAN_ID && (
        <YourSubscription client={client} wallet={wallet} signAndSend={signAndSend} />
      )}
      <EventsFeed />
    </div>
  );
}
