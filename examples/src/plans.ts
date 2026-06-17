import type { PlanMeta } from "@relai-fi/subscriptions-react";

// Mock plan metadata so the examples render fully offline (no API, no wallet).
// In a real app you'd pass `planIds` and let <PricingTable> fetch these.
const MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC mint (illustrative)

export const PLANS: PlanMeta[] = [
  {
    planId: "pl_basic",
    name: "Basic",
    amountBaseUnits: "5000000", // $5.00
    periodHours: 720, // monthly
    network: "solana",
    mint: MINT,
    merchantWallet: "Merchant11111111111111111111111111111111111",
    onchainPlanAddress: "PlanBasic1111111111111111111111111111111111",
  },
  {
    planId: "pl_pro",
    name: "Pro",
    amountBaseUnits: "20000000", // $20.00
    periodHours: 720,
    network: "solana",
    mint: MINT,
    merchantWallet: "Merchant11111111111111111111111111111111111",
    onchainPlanAddress: "PlanPro111111111111111111111111111111111111",
  },
  {
    planId: "pl_scale",
    name: "Scale",
    amountBaseUnits: "99000000", // $99.00
    periodHours: 720,
    network: "solana",
    mint: MINT,
    merchantWallet: "Merchant11111111111111111111111111111111111",
    onchainPlanAddress: "PlanScale11111111111111111111111111111111111",
  },
];

export const CARD_CONFIG = {
  pl_basic: {
    description: "For side projects",
    features: ["1 project", "Community support", "Webhooks"],
  },
  pl_pro: {
    description: "For growing teams",
    features: ["Unlimited projects", "Signed webhooks", "Status endpoint", "Priority support"],
  },
  pl_scale: {
    description: "For high volume",
    features: ["Everything in Pro", "Hourly billing periods", "Dedicated support", "SLA"],
  },
};
