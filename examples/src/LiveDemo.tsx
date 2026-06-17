import { useEffect, useMemo, useRef } from "react";
import {
  createRelaiClient,
  usePlanMeta,
  useSubscribe,
  useSubscriptionStatus,
  formatUsdc,
  formatPeriodSuffix,
  formatPeriodLabel,
  formatNetwork,
  themeToCssVars,
} from "@relai-fi/subscriptions-react";
import { useRelaiSignAndSend, useRelaiWallet } from "@relai-fi/subscriptions-react/wallet";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { API_URL, PLAN_ID } from "./config";

const THEME = themeToCssVars({
  primary: "#a78bfa",
  background: "transparent",
  card: "#13141d",
  foreground: "#f4f4f6",
  mutedForeground: "#9aa0ae",
  border: "#262838",
});

// The whole live integration, built on the package hooks so it can own the flow:
// click Subscribe → if no wallet, open the wallet modal → once connected, continue
// straight into the on-chain subscribe (prepare → sign → confirm). Plan + RPC come
// from .env (see config.ts).
export function LiveDemo() {
  const client = useMemo(() => createRelaiClient({ baseUrl: API_URL }), []);
  const wallet = useRelaiWallet();
  const signAndSend = useRelaiSignAndSend();
  const { setVisible } = useWalletModal();

  const { plan, loading: planLoading, error: planError } = usePlanMeta(PLAN_ID, client);
  const { status, refetch } = useSubscriptionStatus(PLAN_ID, wallet, client);
  const { subscribe, state, error, busy } = useSubscribe({
    planId: PLAN_ID,
    wallet,
    client,
    signAndSend,
    onSubscribed: () => refetch(),
  });

  // Remember a "subscribe" intent across the connect step, then fire it once the
  // wallet is connected.
  const pending = useRef(false);
  useEffect(() => {
    if (wallet && pending.current && !busy) {
      pending.current = false;
      void subscribe();
    }
  }, [wallet, busy, subscribe]);

  const onClick = () => {
    if (busy || status?.active || state === "done") return;
    if (!wallet) {
      pending.current = true; // resume after connect
      setVisible(true); // prompt wallet connection
      return;
    }
    void subscribe();
  };

  let label = "Subscribe";
  let disabled = false;
  let dataState: string = state;
  if (status?.active || state === "done") {
    label = "Subscribed";
    disabled = true;
    dataState = "done";
  } else if (state === "preparing") {
    label = "Preparing…";
    disabled = true;
  } else if (state === "signing") {
    label = "Confirm in your wallet…";
    disabled = true;
  } else if (state === "confirming") {
    label = "Activating…";
    disabled = true;
  } else if (!wallet) {
    label = "Connect wallet & subscribe";
  } else if (state === "error") {
    label = "Try again";
  }

  return (
    <section className="live">
      <div className="live__inner relai-root" style={THEME}>
        <header className="live__head">
          <h1>Subscribe with USDC</h1>
          <p>
            Plan <code>{PLAN_ID}</code> · {API_URL}
          </p>
        </header>

        {planLoading ? (
          <div className="relai-state relai-state--loading">Loading the plan from RelAI…</div>
        ) : planError || !plan ? (
          <div className="relai-state relai-state--error">
            Couldn't load this plan. Check VITE_RELAI_PLAN_ID / VITE_RELAI_API_URL.
            {planError ? ` (${planError.message})` : ""}
          </div>
        ) : (
          <div className="relai-card relai-card--highlight live__card">
            <div className="relai-card__head">
              <h3 className="relai-card__name">{plan.name}</h3>
              <p className="relai-card__desc">Recurring USDC subscription</p>
            </div>

            <div className="relai-price">
              <span className="relai-price__amount">{formatUsdc(plan.amountBaseUnits)}</span>
              <span className="relai-price__unit">
                <span className="relai-price__ticker">USDC</span>
                <span className="relai-price__period">{formatPeriodSuffix(plan.periodHours)}</span>
              </span>
            </div>
            <p className="relai-price__caption">
              {formatPeriodLabel(plan.periodHours)} · {formatNetwork(plan.network)}
            </p>

            <button
              type="button"
              className="relai-btn"
              data-state={dataState}
              data-busy={busy ? "true" : undefined}
              aria-busy={busy || undefined}
              disabled={disabled}
              onClick={onClick}
            >
              {busy && <span className="relai-spinner" aria-hidden="true" />}
              {label}
            </button>

            <p className="live__meta">
              {wallet
                ? `Wallet ${wallet.slice(0, 4)}…${wallet.slice(-4)} · ${formatNetwork(plan.network)}`
                : "No wallet connected — Subscribe will prompt the connection."}
            </p>

            {error && <p className="live__error">{error.message}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
