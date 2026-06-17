// @relai-fi/subscriptions-react — drop-in React UI for RelAI subscriptions.
// Remember to import the stylesheet once: import "@relai-fi/subscriptions-react/styles.css";

export { RelaiProvider, useRelaiContext } from "./context.js";
export type { RelaiProviderProps, RelaiContextValue } from "./context.js";

export { createRelaiClient, RelaiApiError, DEFAULT_BASE_URL } from "./client.js";
export type { RelaiClient, RelaiClientOptions } from "./client.js";

export {
  useRelaiResolved,
  usePlanMeta,
  useSubscriptionStatus,
  useSubscribe,
} from "./hooks.js";
export type {
  RelaiResolved,
  RelaiResolvedOptions,
  UsePlanMetaResult,
  UseSubscriptionStatusResult,
  UseSubscribeOptions,
  UseSubscribeResult,
  SubscribeState,
} from "./hooks.js";

export { PricingTable } from "./components/PricingTable.js";
export type { PricingTableProps, PlanCardConfig } from "./components/PricingTable.js";
export { PricingCard } from "./components/PricingCard.js";
export type { PricingCardProps } from "./components/PricingCard.js";
export { SubscribeButton } from "./components/SubscribeButton.js";
export type { SubscribeButtonProps, SubscribeButtonLabels } from "./components/SubscribeButton.js";

export { formatUsdc, formatPeriodSuffix, formatPeriodLabel, formatNetwork } from "./format.js";
export { themeToCssVars } from "./theme.js";

export type {
  PlanMeta,
  SubscriptionStatusResult,
  PrepareSubscribeResult,
  Subscription,
  Network,
  SubscriptionStatus,
  SignAndSend,
  RelaiTheme,
} from "./types.js";
