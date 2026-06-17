// Data shapes come from the SDK — single source of truth. These are `import type`
// only, so nothing from @relai-fi/subscriptions (incl. its node:crypto webhook code)
// ends up in the browser bundle; the types are erased at compile time.
export type {
  Network,
  SubscriptionStatus,
  PlanMeta,
  SubscriptionStatusResult,
  PrepareSubscribeResult,
  Subscription,
} from "@relai-fi/subscriptions";

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
