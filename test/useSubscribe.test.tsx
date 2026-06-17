import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSubscribe } from "../src/hooks";
import type { RelaiClient } from "../src/client";

function makeClient(overrides: Partial<RelaiClient> = {}): RelaiClient {
  return {
    baseUrl: "mock://relai",
    meta: vi.fn(),
    status: vi.fn(async () => ({ active: false })),
    prepareSubscribe: vi.fn(async () => ({ stage: "subscribe", wireTransaction: "tx" })),
    confirmSubscribe: vi.fn(async () => ({ subscriptionId: "sub_1", status: "active" }) as never),
    ...overrides,
  };
}

describe("useSubscribe", () => {
  beforeEach(() => vi.clearAllMocks());

  it("runs the single-stage flow: idle → done", async () => {
    const client = makeClient();
    const signAndSend = vi.fn(async () => "sig1");
    const onSubscribed = vi.fn();

    const { result } = renderHook(() =>
      useSubscribe({ planId: "pl_x", wallet: "W", client, signAndSend, onSubscribed }),
    );

    expect(result.current.state).toBe("idle");

    await act(async () => {
      await result.current.subscribe();
    });

    expect(client.prepareSubscribe).toHaveBeenCalledTimes(1);
    expect(signAndSend).toHaveBeenCalledOnce();
    expect(signAndSend).toHaveBeenCalledWith("tx");
    expect(client.confirmSubscribe).toHaveBeenCalledWith("pl_x", "W", "sig1");
    expect(result.current.state).toBe("done");
    expect(result.current.busy).toBe(false);
    expect(result.current.subscription?.subscriptionId).toBe("sub_1");
    expect(onSubscribed).toHaveBeenCalledOnce();
  });

  it("handles the two-stage init-authority flow (signs twice)", async () => {
    const prepareSubscribe = vi
      .fn()
      .mockResolvedValueOnce({ stage: "init-authority", wireTransaction: "txAuth" })
      .mockResolvedValueOnce({ stage: "subscribe", wireTransaction: "txSub" });
    const client = makeClient({ prepareSubscribe });
    const signAndSend = vi
      .fn()
      .mockResolvedValueOnce("sigAuth")
      .mockResolvedValueOnce("sigSub");

    const { result } = renderHook(() =>
      useSubscribe({ planId: "pl_x", wallet: "W", client, signAndSend }),
    );

    await act(async () => {
      await result.current.subscribe();
    });

    expect(prepareSubscribe).toHaveBeenCalledTimes(2);
    expect(signAndSend).toHaveBeenNthCalledWith(1, "txAuth");
    expect(signAndSend).toHaveBeenNthCalledWith(2, "txSub");
    expect(client.confirmSubscribe).toHaveBeenCalledWith("pl_x", "W", "sigSub");
    expect(result.current.state).toBe("done");
  });

  it("errors without a wallet and never calls the client", async () => {
    const client = makeClient();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useSubscribe({ planId: "pl_x", client, signAndSend: vi.fn(), onError }),
    );

    let returned: unknown;
    await act(async () => {
      returned = await result.current.subscribe();
    });

    expect(returned).toBeUndefined();
    expect(result.current.state).toBe("error");
    expect(client.prepareSubscribe).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledOnce();
  });

  it("errors without a signAndSend", async () => {
    const client = makeClient();
    const { result } = renderHook(() =>
      useSubscribe({ planId: "pl_x", wallet: "W", client }),
    );

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.state).toBe("error");
    expect(client.prepareSubscribe).not.toHaveBeenCalled();
  });

  it("surfaces a confirm failure as an error state", async () => {
    const client = makeClient({
      confirmSubscribe: vi.fn(async () => {
        throw new Error("settlement failed");
      }),
    });
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useSubscribe({ planId: "pl_x", wallet: "W", client, signAndSend: vi.fn(async () => "s"), onError }),
    );

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error?.message).toBe("settlement failed");
    expect(onError).toHaveBeenCalledOnce();
  });
});
