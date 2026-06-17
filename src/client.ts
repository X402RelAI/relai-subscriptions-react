import type {
  PlanMeta,
  PrepareSubscribeResult,
  Subscription,
  SubscriptionStatusResult,
} from "./types.js";

export const DEFAULT_BASE_URL = "https://api.relai.fi";

export class RelaiApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "RelaiApiError";
  }
}

export interface RelaiClientOptions {
  /** API base URL. Defaults to https://api.relai.fi */
  baseUrl?: string;
  /** Custom fetch (defaults to global fetch). */
  fetch?: typeof fetch;
}

/** Browser-safe client for the public RelAI subscriptions endpoints. No API key. */
export interface RelaiClient {
  readonly baseUrl: string;
  /** Public plan terms for a pricing card. */
  meta(planId: string): Promise<PlanMeta>;
  /** Is `wallet` actively subscribed to `planId`? */
  status(planId: string, wallet: string): Promise<SubscriptionStatusResult>;
  /** Build the next unsigned subscribe transaction (two-stage). */
  prepareSubscribe(planId: string, wallet: string): Promise<PrepareSubscribeResult>;
  /** Confirm the subscription after the signed tx is broadcast. */
  confirmSubscribe(planId: string, wallet: string, signature: string): Promise<Subscription>;
}

export function createRelaiClient(opts: RelaiClientOptions = {}): RelaiClient {
  const baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const _fetch = opts.fetch ?? globalThis.fetch;
  if (!_fetch) throw new Error("No fetch available — pass `fetch` in options.");

  async function request<T>(
    method: string,
    path: string,
    init: { body?: unknown; query?: Record<string, string> } = {},
  ): Promise<T> {
    const url = new URL(baseUrl + path);
    for (const [k, v] of Object.entries(init.query ?? {})) url.searchParams.set(k, v);
    const res = await _fetch(url.toString(), {
      method,
      headers: { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = text;
    }
    if (!res.ok) {
      const msg = (json as { error?: string })?.error ?? `RelAI ${method} ${path} failed (${res.status})`;
      throw new RelaiApiError(res.status, msg, json ?? text);
    }
    return json as T;
  }

  const enc = encodeURIComponent;

  return {
    baseUrl,
    meta: (planId) => request<PlanMeta>("GET", `/s/${enc(planId)}/meta`),
    status: (planId, wallet) =>
      request<SubscriptionStatusResult>("GET", `/s/${enc(planId)}/status`, { query: { wallet } }),
    prepareSubscribe: (planId, wallet) =>
      request<PrepareSubscribeResult>("POST", `/s/${enc(planId)}/subscribe`, {
        body: { subscriberWallet: wallet },
      }),
    confirmSubscribe: async (planId, wallet, signature) => {
      const { subscription } = await request<{ subscription: Subscription }>(
        "POST",
        `/s/${enc(planId)}/confirm`,
        { body: { subscriberWallet: wallet, signature } },
      );
      return subscription;
    },
  };
}
