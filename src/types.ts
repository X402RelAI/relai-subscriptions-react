// Public, browser-safe subset of the RelAI subscriptions API.
// Mirrors @relai-fi/subscriptions — only the no-API-key endpoints a subscribe UI needs.

export type Network = "solana" | "solana-devnet";
export type SubscriptionStatus = "active" | "canceled" | "past_due";

/** Public, non-sensitive plan terms — `GET /s/:planId/meta`. */
export interface PlanMeta {
  planId: string;
  name: string;
  /** Per-period charge in token base units (USDC = 6 decimals; "5000000" = $5.00). */
  amountBaseUnits: string;
  /** Billing cadence in hours (1 = hourly, 720 ≈ monthly). */
  periodHours: number;
  network: Network;
  mint: string;
  merchantWallet: string;
  onchainPlanAddress: string;
  metadataUri?: string;
}

/** `GET /s/:planId/status?wallet=…`. */
export interface SubscriptionStatusResult {
  active: boolean;
  status?: SubscriptionStatus;
  planId?: string;
  subscriptionId?: string;
  currentPeriodIndex?: number;
  nextChargeTs?: number;
  amountBaseUnits?: string;
  periodHours?: number;
  reason?: string;
}

/** `POST /s/:planId/subscribe` — a two-stage, wallet-signed flow. */
export interface PrepareSubscribeResult {
  /** `init-authority` first (one-time per wallet+mint), then `subscribe`. */
  stage: "init-authority" | "subscribe";
  /** Base64 unsigned transaction for the subscriber's wallet to sign + broadcast. */
  wireTransaction: string;
  subscriptionPda?: string;
  planPda?: string;
}

/** `POST /s/:planId/confirm`. */
export interface Subscription {
  subscriptionId: string;
  planId: string;
  subscriberWallet: string;
  merchantWallet: string;
  network: Network;
  amountBaseUnits: string;
  periodHours: number;
  status: SubscriptionStatus;
  currentPeriodIndex: number;
  nextChargeTs: number;
  onchainSubscriptionAddress: string;
  createdAt: string;
}

/**
 * Signs and broadcasts a base64 wire transaction, resolving to the tx signature.
 * Wallet-agnostic: wire it to @solana/wallet-adapter (see `@relai-fi/subscriptions-react/wallet`),
 * Privy, Crossmint, a raw Keypair — anything that can sign + send a Solana tx.
 */
export type SignAndSend = (wireTransactionBase64: string) => Promise<string>;

/** Theme overrides — mapped to CSS variables on the component root. */
export interface RelaiTheme {
  primary?: string;
  primaryForeground?: string;
  background?: string;
  card?: string;
  foreground?: string;
  mutedForeground?: string;
  border?: string;
  radius?: string;
}
