import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { PricingCard } from "./PricingCard.js";
import type { SubscribeButtonLabels } from "./SubscribeButton.js";
import { useRelaiResolved } from "../hooks.js";
import type { RelaiResolvedOptions } from "../hooks.js";
import { useRelaiContext } from "../context.js";
import { themeToCssVars } from "../theme.js";
import type { PlanMeta, RelaiTheme, Subscription } from "../types.js";

export interface PlanCardConfig {
  features?: string[];
  description?: string;
  highlight?: boolean;
  badge?: string;
}

export interface PricingTableProps extends RelaiResolvedOptions {
  /** Plans to show, in order. Use this, or `plans`, or a single `planId`. */
  planIds?: string[];
  /** Preloaded plan metadata (skips fetching). */
  plans?: PlanMeta[];
  /** Shorthand for a one-plan table. */
  planId?: string;
  /** Per-plan presentation, keyed by planId. */
  cards?: Record<string, PlanCardConfig>;
  /** Emphasize one plan (adds the "Popular" ribbon unless overridden in `cards`). */
  highlightPlanId?: string;
  theme?: RelaiTheme;
  onConnectWallet?: () => void;
  onSubscribed?: (sub: Subscription) => void;
  onError?: (err: Error) => void;
  labels?: SubscribeButtonLabels;
  loadingText?: string;
  errorText?: string;
  className?: string;
  style?: CSSProperties;
}

function useManyPlanMetas(
  ids: string[],
  preloaded: PlanMeta[] | undefined,
  client: ReturnType<typeof useRelaiResolved>["client"],
) {
  const key = ids.join(",");
  const [state, setState] = useState<{ plans: PlanMeta[]; loading: boolean; error?: Error }>(
    () => ({ plans: preloaded ?? [], loading: !preloaded }),
  );

  useEffect(() => {
    if (preloaded) {
      setState({ plans: preloaded, loading: false });
      return;
    }
    if (ids.length === 0) {
      setState({ plans: [], loading: false });
      return;
    }
    let alive = true;
    setState({ plans: [], loading: true });
    Promise.all(ids.map((id) => client.meta(id)))
      .then((plans) => alive && setState({ plans, loading: false }))
      .catch((error: Error) => alive && setState({ plans: [], loading: false, error }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, preloaded, client]);

  return state;
}

/**
 * Drop-in Stripe-style pricing table for RelAI subscription plans.
 *
 *   import "@relai-fi/subscriptions-react/styles.css";
 *   <PricingTable planIds={["pl_basic", "pl_pro"]} highlightPlanId="pl_pro"
 *     wallet={address} signAndSend={signAndSend} />
 */
export function PricingTable(props: PricingTableProps) {
  const { client, wallet, signAndSend } = useRelaiResolved(props);
  const ctx = useRelaiContext();
  const theme = props.theme ?? ctx?.theme;

  const ids = props.plans
    ? props.plans.map((p) => p.planId)
    : props.planIds ?? (props.planId ? [props.planId] : []);

  const { plans, loading, error } = useManyPlanMetas(ids, props.plans, client);

  const rootStyle: CSSProperties = { ...themeToCssVars(theme), ...props.style };
  const rootClass = ["relai-root", "relai-table", props.className].filter(Boolean).join(" ");

  if (loading) {
    return (
      <div className={rootClass} style={rootStyle}>
        <div className="relai-state relai-state--loading">{props.loadingText ?? "Loading plans…"}</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={rootClass} style={rootStyle}>
        <div className="relai-state relai-state--error">
          {props.errorText ?? "Couldn't load plans."}
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass} style={rootStyle} data-count={plans.length}>
      {plans.map((plan) => {
        const cfg = props.cards?.[plan.planId];
        const highlight = cfg?.highlight ?? props.highlightPlanId === plan.planId;
        return (
          <PricingCard
            key={plan.planId}
            plan={plan}
            features={cfg?.features}
            description={cfg?.description}
            highlight={highlight}
            badge={cfg?.badge}
            client={client}
            wallet={wallet}
            signAndSend={signAndSend}
            onConnectWallet={props.onConnectWallet}
            onSubscribed={props.onSubscribed}
            onError={props.onError}
            labels={props.labels}
          />
        );
      })}
    </div>
  );
}
