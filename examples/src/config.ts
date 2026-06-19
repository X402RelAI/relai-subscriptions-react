// Portal config, from .env (see .env.example). Sensible defaults so `npm run dev`
// works before you create .env.
const env = import.meta.env;

export const API_URL = env.VITE_RELAI_API_URL ?? "https://api.relai.fi";
export const RPC_URL = env.VITE_SOLANA_RPC ?? "https://api.devnet.solana.com";
// The demo merchant backend (webhook feed + cancel proxy). See server/.
export const BACKEND_URL = env.VITE_BACKEND_URL ?? "http://localhost:8787";

export interface PlanTier {
  /** Real plan id → functional (subscribe/cancel). Empty → a demo placeholder card. */
  id: string;
  tier: string;
  blurb: string;
  /** Shown on placeholder cards (real cards read the price from the API). */
  price?: string;
  features: string[];
  highlight?: boolean;
}

// One real plan (the middle, highlighted tier) + two placeholders. Set
// VITE_RELAI_PLAN_ID_2 / _3 to real ids to make the side tiers functional too.
export const PLANS: PlanTier[] = [
  {
    id: env.VITE_RELAI_PLAN_ID_2 ?? "",
    tier: "Basic",
    blurb: "For side projects",
    price: "5.00",
    features: ["1 project", "Community support", "Webhooks"],
  },
  {
    id: env.VITE_RELAI_PLAN_ID ?? "10898734391234361336",
    tier: "Pro",
    blurb: "For growing teams",
    features: ["Unlimited projects", "Signed webhooks", "Status endpoint", "Priority support"],
    highlight: true,
  },
  {
    id: env.VITE_RELAI_PLAN_ID_3 ?? "",
    tier: "Scale",
    blurb: "For high volume",
    price: "99.00",
    features: ["Everything in Pro", "Hourly billing", "SLA"],
  },
];

/** The real plan id (the one the "Your subscription" panel manages). */
export const PRIMARY_PLAN_ID = PLANS.find((p) => p.id)?.id ?? "";
