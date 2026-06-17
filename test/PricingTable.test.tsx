import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PricingTable } from "../src/components/PricingTable";
import type { RelaiClient } from "../src/client";
import type { PlanMeta } from "../src/types";

const PLAN: PlanMeta = {
  planId: "pl_pro",
  name: "Pro",
  amountBaseUnits: "5000000",
  periodHours: 720,
  network: "solana",
  mint: "m",
  merchantWallet: "w",
  onchainPlanAddress: "o",
};

function makeClient(): RelaiClient {
  return {
    baseUrl: "mock://relai",
    meta: vi.fn(async () => PLAN),
    status: vi.fn(async () => ({ active: false })),
    prepareSubscribe: vi.fn(),
    confirmSubscribe: vi.fn(),
  } as unknown as RelaiClient;
}

describe("<PricingTable>", () => {
  it("renders a card from preloaded plans with price, period and features", async () => {
    render(
      <PricingTable
        plans={[PLAN]}
        client={makeClient()}
        wallet="W"
        signAndSend={vi.fn()}
        cards={{ pl_pro: { features: ["Signed webhooks"], description: "For teams" } }}
      />,
    );

    expect(await screen.findByText("Pro")).toBeTruthy();
    expect(screen.getByText("5.00")).toBeTruthy();
    expect(screen.getByText("/mo")).toBeTruthy();
    expect(screen.getByText("For teams")).toBeTruthy();
    expect(screen.getByText("Signed webhooks")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeTruthy();
  });

  it("fetches plan metadata when given planIds", async () => {
    const client = makeClient();
    render(<PricingTable planIds={["pl_pro"]} client={client} />);

    expect(await screen.findByText("Pro")).toBeTruthy();
    expect(client.meta).toHaveBeenCalledWith("pl_pro");
  });
});
