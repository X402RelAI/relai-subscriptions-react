import type { CSSProperties, ReactNode } from "react";
import { useRelaiResolved, useSubscribe, useSubscriptionStatus } from "../hooks.js";
import type { RelaiResolvedOptions } from "../hooks.js";
import type { Subscription } from "../types.js";

export interface SubscribeButtonLabels {
  subscribe?: string;
  connect?: string;
  preparing?: string;
  signing?: string;
  confirming?: string;
  active?: string;
  retry?: string;
}

const DEFAULT_LABELS: Required<SubscribeButtonLabels> = {
  subscribe: "Subscribe",
  connect: "Connect wallet",
  preparing: "Preparing…",
  signing: "Confirm in wallet…",
  confirming: "Activating…",
  active: "Subscribed",
  retry: "Try again",
};

export interface SubscribeButtonProps extends RelaiResolvedOptions {
  planId: string;
  /** Called when the user has no connected wallet and clicks the button. */
  onConnectWallet?: () => void;
  onSubscribed?: (sub: Subscription) => void;
  onError?: (err: Error) => void;
  /** Hide the "Subscribed" current-plan state (skip the status check). */
  hideStatus?: boolean;
  labels?: SubscribeButtonLabels;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * A single subscribe button for `planId`. Resolves wallet / signAndSend / client
 * from props or <RelaiProvider>. Runs the two-stage subscribe flow on click and
 * reflects the live state. Shows "Subscribed" when the wallet already has the plan.
 */
export function SubscribeButton(props: SubscribeButtonProps) {
  const { planId, onConnectWallet, hideStatus, className, style, children } = props;
  const labels = { ...DEFAULT_LABELS, ...props.labels };
  const { client, wallet } = useRelaiResolved(props);

  const { status, refetch } = useSubscriptionStatus(
    planId,
    hideStatus ? undefined : wallet,
    client,
  );
  const { subscribe, state, busy } = useSubscribe({
    ...props,
    onSubscribed: (sub) => {
      refetch();
      props.onSubscribed?.(sub);
    },
  });

  const alreadyActive = !hideStatus && status?.active === true;

  let label: string;
  let disabled = false;
  let dataState = state;

  if (alreadyActive || state === "done") {
    label = labels.active;
    disabled = true;
    dataState = "done";
  } else if (!wallet) {
    label = labels.connect;
    disabled = !onConnectWallet;
  } else if (state === "preparing") {
    label = labels.preparing;
    disabled = true;
  } else if (state === "signing") {
    label = labels.signing;
    disabled = true;
  } else if (state === "confirming") {
    label = labels.confirming;
    disabled = true;
  } else if (state === "error") {
    label = labels.retry;
  } else {
    label = labels.subscribe;
  }

  const onClick = () => {
    if (busy || alreadyActive) return;
    if (!wallet) {
      onConnectWallet?.();
      return;
    }
    void subscribe();
  };

  return (
    <button
      type="button"
      className={["relai-btn", className].filter(Boolean).join(" ")}
      style={style}
      data-state={dataState}
      data-busy={busy ? "true" : undefined}
      aria-busy={busy || undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {busy && <span className="relai-spinner" aria-hidden="true" />}
      {children ?? label}
    </button>
  );
}
