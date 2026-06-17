import { describe, it, expect, vi } from "vitest";
import { createRelaiClient, RelaiApiError } from "../src/client";

type Handler = (url: string, init: RequestInit) => { ok: boolean; status: number; body: unknown };

function mockFetch(handler: Handler) {
  return vi.fn(async (url: string, init: RequestInit) => {
    const r = handler(url, init);
    return {
      ok: r.ok,
      status: r.status,
      text: async () => (r.body === undefined ? "" : JSON.stringify(r.body)),
    } as Response;
  });
}

const PLAN = {
  planId: "pl_x",
  name: "Pro",
  amountBaseUnits: "5000000",
  periodHours: 720,
  network: "solana",
  mint: "m",
  merchantWallet: "w",
  onchainPlanAddress: "o",
};

describe("createRelaiClient", () => {
  it("defaults to the production base url and strips a trailing slash", () => {
    expect(createRelaiClient().baseUrl).toBe("https://api.relai.fi");
    expect(createRelaiClient({ baseUrl: "https://x.test/" }).baseUrl).toBe("https://x.test");
  });

  it("meta() GETs the public meta endpoint", async () => {
    const fetch = mockFetch(() => ({ ok: true, status: 200, body: PLAN }));
    const c = createRelaiClient({ baseUrl: "https://api.test", fetch });
    const plan = await c.meta("pl_x");
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://api.test/s/pl_x/meta");
    expect(init.method).toBe("GET");
    expect(plan.name).toBe("Pro");
  });

  it("status() passes the wallet as a query param", async () => {
    const fetch = mockFetch(() => ({ ok: true, status: 200, body: { active: true } }));
    const c = createRelaiClient({ baseUrl: "https://api.test", fetch });
    const res = await c.status("pl_x", "WALLET");
    const [url] = fetch.mock.calls[0]!;
    expect(url).toBe("https://api.test/s/pl_x/status?wallet=WALLET");
    expect(res.active).toBe(true);
  });

  it("prepareSubscribe() POSTs the subscriber wallet", async () => {
    const fetch = mockFetch(() => ({
      ok: true,
      status: 200,
      body: { stage: "subscribe", wireTransaction: "tx" },
    }));
    const c = createRelaiClient({ baseUrl: "https://api.test", fetch });
    const prep = await c.prepareSubscribe("pl_x", "WALLET");
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://api.test/s/pl_x/subscribe");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ subscriberWallet: "WALLET" });
    expect(prep.stage).toBe("subscribe");
  });

  it("confirmSubscribe() unwraps { subscription }", async () => {
    const fetch = mockFetch(() => ({
      ok: true,
      status: 200,
      body: { subscription: { subscriptionId: "sub_1", status: "active" } },
    }));
    const c = createRelaiClient({ baseUrl: "https://api.test", fetch });
    const sub = await c.confirmSubscribe("pl_x", "WALLET", "sig");
    const [, init] = fetch.mock.calls[0]!;
    expect(JSON.parse(init.body as string)).toEqual({ subscriberWallet: "WALLET", signature: "sig" });
    expect(sub.subscriptionId).toBe("sub_1");
  });

  it("encodes the planId in the path", async () => {
    const fetch = mockFetch(() => ({ ok: true, status: 200, body: PLAN }));
    const c = createRelaiClient({ baseUrl: "https://api.test", fetch });
    await c.meta("pl/with space");
    const [url] = fetch.mock.calls[0]!;
    expect(url).toContain("/s/pl%2Fwith%20space/meta");
  });

  it("throws RelaiApiError carrying status and server message on a non-2xx", async () => {
    const fetch = mockFetch(() => ({ ok: false, status: 404, body: { error: "no such plan" } }));
    const c = createRelaiClient({ baseUrl: "https://api.test", fetch });
    await expect(c.meta("nope")).rejects.toBeInstanceOf(RelaiApiError);
    try {
      await c.meta("nope");
    } catch (e) {
      const err = e as RelaiApiError;
      expect(err.status).toBe(404);
      expect(err.message).toBe("no such plan");
    }
  });
});
