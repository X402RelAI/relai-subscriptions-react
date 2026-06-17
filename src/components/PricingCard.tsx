import type { CSSProperties } from "react";
import { SubscribeButton } from "./SubscribeButton.js";
import type { SubscribeButtonLabels } from "./SubscribeButton.js";
import type { RelaiResolvedOptions } from "../hooks.js";
import { formatNetwork, formatPeriodLabel, formatPeriodSuffix, formatUsdc } from "../format.js";
import type { PlanMeta, Subscription } from "../types.js";

export interface PricingCardProps extends RelaiResolvedOptions {
  plan: PlanMeta;
  /** Bullet features shown under the price. */
  features?: string[];
  /** Short line under the plan name. */
  description?: string;
  /** Visually emphasize this card. */
  highlight?: boolean;
  /** Ribbon text (e.g. "Popular"). Defaults to "Popular" when highlight is set. */
  badge?: string;
  /** Hide the "Solana / Solana devnet" network line. */
  hideNetwork?: boolean;
  onConnectWallet?: () => void;
  onSubscribed?: (sub: Subscription) => void;
  onError?: (err: Error) => void;
  labels?: SubscribeButtonLabels;
  className?: string;
  style?: CSSProperties;
}

const Check = () => (
  <svg className="relai-check" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path
      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.29 6.8-6.8a1 1 0 0 1 1.4 0Z"
      fill="currentColor"
    />
  </svg>
);

/** A single Stripe-style pricing card for one plan. */
export function PricingCard(props: PricingCardProps) {
  const { plan, features, description, highlight, hideNetwork, className, style } = props;
  const badge = props.badge ?? (highlight ? "Popular" : undefined);

  return (
    <div
      className={["relai-card", highlight ? "relai-card--highlight" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      data-plan={plan.planId}
    >
      {badge && <span className="relai-badge">{badge}</span>}

      <div className="relai-card__head">
        <h3 className="relai-card__name">{plan.name}</h3>
        {description && <p className="relai-card__desc">{description}</p>}
      </div>

      <div className="relai-price">
        <span className="relai-price__amount">{formatUsdc(plan.amountBaseUnits)}</span>
        <span className="relai-price__unit">
          <span className="relai-price__ticker">USDC</span>
          <span className="relai-price__period">{formatPeriodSuffix(plan.periodHours)}</span>
        </span>
      </div>
      <p className="relai-price__caption">
        {formatPeriodLabel(plan.periodHours)}
        {!hideNetwork && <> · {formatNetwork(plan.network)}</>}
      </p>

      <SubscribeButton
        planId={plan.planId}
        client={props.client}
        baseUrl={props.baseUrl}
        wallet={props.wallet}
        signAndSend={props.signAndSend}
        onConnectWallet={props.onConnectWallet}
        onSubscribed={props.onSubscribed}
        onError={props.onError}
        labels={props.labels}
      />

      {features && features.length > 0 && (
        <ul className="relai-features">
          {features.map((f, i) => (
            <li key={i} className="relai-features__item">
              <Check />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
