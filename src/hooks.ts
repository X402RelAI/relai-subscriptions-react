import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRelaiClient } from "./client.js";
import type { RelaiClient } from "./client.js";
import { useRelaiContext } from "./context.js";
import type {
  PlanMeta,
  SignAndSend,
  Subscription,
  SubscriptionStatusResult,
} from "./types.js";

export interface RelaiResolvedOptions {
  client?: RelaiClient;
  baseUrl?: string;
  wallet?: string;
  signAndSend?: SignAndSend;
}

export interface RelaiResolved {
  client: RelaiClient;
  wallet?: string;
  signAndSend?: SignAndSend;
}

/** Merge per-component props over the provider context (props win). */
export function useRelaiResolved(opts: RelaiResolvedOptions = {}): RelaiResolved {
  const ctx = useRelaiContext();
  return useMemo<RelaiResolved>(() => {
    const client =
      opts.client ??
      ctx?.client ??
      createRelaiClient({ baseUrl: opts.baseUrl });
    return {
      client,
      wallet: opts.wallet ?? ctx?.wallet,
      signAndSend: opts.signAndSend ?? ctx?.signAndSend,
    };
  }, [opts.client, opts.baseUrl, opts.wallet, opts.signAndSend, ctx]);
}

export interface UsePlanMetaResult {
  plan?: PlanMeta;
  loading: boolean;
  error?: Error;
}

/** Fetch public plan terms for `planId`. */
export function usePlanMeta(planId: string, client: RelaiClient): UsePlanMetaResult {
  const [state, setState] = useState<UsePlanMetaResult>({ loading: true });
  useEffect(() => {
    let alive = true;
    setState({ loading: true });
    client
      .meta(planId)
      .then((plan) => alive && setState({ plan, loading: false }))
      .catch((error: Error) => alive && setState({ loading: false, error }));
    return () => {
      alive = false;
    };
  }, [planId, client]);
  return state;
}

export interface UseSubscriptionStatusResult {
  status?: SubscriptionStatusResult;
  loading: boolean;
  error?: Error;
  refetch: () => void;
}

/** Track whether `wallet` is subscribed to `planId`. No-op until a wallet is set. */
export function useSubscriptionStatus(
  planId: string,
  wallet: string | undefined,
  client: RelaiClient,
): UseSubscriptionStatusResult {
  const [state, setState] = useState<Omit<UseSubscriptionStatusResult, "refetch">>({
    loading: false,
  });
  const [nonce, setNonce] = useState(0);
  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!wallet) {
      setState({ loading: false, status: undefined });
      return;
    }
    let alive = true;
    setState({ loading: true });
    client
      .status(planId, wallet)
      .then((status) => alive && setState({ status, loading: false }))
      .catch((error: Error) => alive && setState({ loading: false, error }));
    return () => {
      alive = false;
    };
  }, [planId, wallet, client, nonce]);

  return { ...state, refetch };
}

export type SubscribeState =
  | "idle"
  | "preparing"
  | "signing"
  | "confirming"
  | "done"
  | "error";

export interface UseSubscribeOptions extends RelaiResolvedOptions {
  planId: string;
  onSubscribed?: (sub: Subscription) => void;
  onError?: (err: Error) => void;
}

export interface UseSubscribeResult {
  subscribe: () => Promise<Subscription | undefined>;
  state: SubscribeState;
  error?: Error;
  subscription?: Subscription;
  /** True while the flow is mid-run (preparing/signing/confirming). */
  busy: boolean;
  reset: () => void;
}

/**
 * Runs the full two-stage subscribe flow:
 * prepare → (init-authority sign → prepare again) → sign → confirm.
 */
export function useSubscribe(opts: UseSubscribeOptions): UseSubscribeResult {
  const { client, wallet, signAndSend } = useRelaiResolved(opts);
  const [state, setState] = useState<SubscribeState>("idle");
  const [error, setError] = useState<Error | undefined>();
  const [subscription, setSubscription] = useState<Subscription | undefined>();
  const running = useRef(false);

  const reset = useCallback(() => {
    setState("idle");
    setError(undefined);
    setSubscription(undefined);
  }, []);

  const subscribe = useCallback(async (): Promise<Subscription | undefined> => {
    if (running.current) return undefined;
    if (!wallet) {
      const err = new Error("No wallet — connect a wallet before subscribing.");
      setError(err);
      setState("error");
      opts.onError?.(err);
      return undefined;
    }
    if (!signAndSend) {
      const err = new Error("No signAndSend — pass one (see @relai-fi/subscriptions-react/wallet).");
      setError(err);
      setState("error");
      opts.onError?.(err);
      return undefined;
    }

    running.current = true;
    setError(undefined);
    try {
      setState("preparing");
      let prep = await client.prepareSubscribe(opts.planId, wallet);

      // Stage 1: one-time delegate authority init for this wallet+mint.
      if (prep.stage === "init-authority") {
        setState("signing");
        await signAndSend(prep.wireTransaction);
        setState("preparing");
        prep = await client.prepareSubscribe(opts.planId, wallet);
      }

      // Stage 2: the subscribe transaction.
      setState("signing");
      const sig = await signAndSend(prep.wireTransaction);

      setState("confirming");
      const sub = await client.confirmSubscribe(opts.planId, wallet, sig);
      setSubscription(sub);
      setState("done");
      opts.onSubscribed?.(sub);
      return sub;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      setState("error");
      opts.onError?.(err);
      return undefined;
    } finally {
      running.current = false;
    }
  }, [client, wallet, signAndSend, opts]);

  const busy = state === "preparing" || state === "signing" || state === "confirming";
  return { subscribe, state, error, subscription, busy, reset };
}

export type CancelState = "idle" | "preparing" | "signing" | "confirming" | "done" | "error";

export interface UseCancelOptions {
  /**
   * Fetch the unsigned cancel transaction. Building it needs the merchant API key,
   * so this must hit YOUR backend (which proxies RelAI's authenticated cancel) —
   * the key never touches the browser.
   */
  prepareCancel: () => Promise<{ wireTransaction: string }>;
  /** Confirm the cancel after broadcast (again via your backend). */
  confirmCancel: (signature: string) => Promise<unknown>;
  /** Subscriber's signer (defaults to the provider's signAndSend). */
  signAndSend?: SignAndSend;
  onCanceled?: () => void;
  onError?: (err: Error) => void;
}

export interface UseCancelResult {
  cancel: () => Promise<boolean>;
  state: CancelState;
  error?: Error;
  busy: boolean;
  reset: () => void;
}

/**
 * Orchestrates the subscriber-signed cancel: prepareCancel → sign → confirmCancel.
 * Backend-agnostic — you supply prepare/confirm (pointing at your merchant backend),
 * the hook drives the wallet signature and the state transitions.
 */
export function useCancel(opts: UseCancelOptions): UseCancelResult {
  const { signAndSend } = useRelaiResolved({ signAndSend: opts.signAndSend });
  const [state, setState] = useState<CancelState>("idle");
  const [error, setError] = useState<Error | undefined>();
  const running = useRef(false);

  const reset = useCallback(() => {
    setState("idle");
    setError(undefined);
  }, []);

  const cancel = useCallback(async (): Promise<boolean> => {
    if (running.current) return false;
    if (!signAndSend) {
      const err = new Error("No signAndSend — pass one (see @relai-fi/subscriptions-react/wallet).");
      setError(err);
      setState("error");
      opts.onError?.(err);
      return false;
    }
    running.current = true;
    setError(undefined);
    try {
      setState("preparing");
      const { wireTransaction } = await opts.prepareCancel();
      setState("signing");
      const sig = await signAndSend(wireTransaction);
      setState("confirming");
      await opts.confirmCancel(sig);
      setState("done");
      opts.onCanceled?.();
      return true;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      setState("error");
      opts.onError?.(err);
      return false;
    } finally {
      running.current = false;
    }
  }, [signAndSend, opts]);

  const busy = state === "preparing" || state === "signing" || state === "confirming";
  return { cancel, state, error, busy, reset };
}
