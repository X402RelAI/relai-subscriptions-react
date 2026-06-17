import type { RelaiClient, PlanMeta, SignAndSend } from "@relai-fi/subscriptions-react";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * An in-memory RelaiClient so the examples run with no backend and no real wallet.
 * `subscribe` simulates the on-chain round-trip and then reports the wallet as active,
 * so the button moves Subscribe → Confirm in wallet… → Activating… → Subscribed.
 */
export function createMockClient(plans: PlanMeta[]): RelaiClient {
  const byId = new Map(plans.map((p) => [p.planId, p]));
  const subscribed = new Set<string>(); // `${planId}:${wallet}`

  return {
    baseUrl: "mock://relai",
    async meta(planId) {
      await delay(120);
      const p = byId.get(planId);
      if (!p) throw new Error(`unknown plan ${planId}`);
      return p;
    },
    async status(planId, wallet) {
      await delay(120);
      return { active: subscribed.has(`${planId}:${wallet}`), planId };
    },
    async prepareSubscribe(planId, wallet) {
      await delay(350);
      return { stage: "subscribe", wireTransaction: `mock-tx:${planId}:${wallet}` };
    },
    async confirmSubscribe(planId, wallet, signature) {
      await delay(600);
      subscribed.add(`${planId}:${wallet}`);
      const p = byId.get(planId)!;
      return {
        subscriptionId: `sub_${Math.abs(hash(signature)).toString(36)}`,
        planId,
        subscriberWallet: wallet,
        merchantWallet: p.merchantWallet,
        network: p.network,
        amountBaseUnits: p.amountBaseUnits,
        periodHours: p.periodHours,
        status: "active",
        currentPeriodIndex: 0,
        nextChargeTs: 0,
        onchainSubscriptionAddress: "MockSub1111111111111111111111111111111111111",
        createdAt: new Date().toISOString(),
      };
    },
  };
}

/** A no-op signer that just resolves a fake signature after a beat. */
export const demoSignAndSend: SignAndSend = async () => {
  await delay(700);
  return "DemoSig" + Math.random().toString(36).slice(2, 10);
};

export const DEMO_WALLET = "Demo1111111111111111111111111111111111111111";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
