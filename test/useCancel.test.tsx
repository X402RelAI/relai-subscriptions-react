import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCancel } from "../src/hooks";

describe("useCancel", () => {
  it("runs prepare → sign → confirm and reports done", async () => {
    const prepareCancel = vi.fn(async () => ({ wireTransaction: "txC" }));
    const confirmCancel = vi.fn(async () => ({}));
    const signAndSend = vi.fn(async () => "sigC");
    const onCanceled = vi.fn();

    const { result } = renderHook(() =>
      useCancel({ prepareCancel, confirmCancel, signAndSend, onCanceled }),
    );

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.cancel();
    });

    expect(ok).toBe(true);
    expect(signAndSend).toHaveBeenCalledWith("txC");
    expect(confirmCancel).toHaveBeenCalledWith("sigC");
    expect(result.current.state).toBe("done");
    expect(onCanceled).toHaveBeenCalledOnce();
  });

  it("errors without a signAndSend and never calls prepare", async () => {
    const prepareCancel = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useCancel({ prepareCancel, confirmCancel: vi.fn(), onError }),
    );

    await act(async () => {
      await result.current.cancel();
    });

    expect(result.current.state).toBe("error");
    expect(prepareCancel).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledOnce();
  });

  it("surfaces a confirm failure as an error", async () => {
    const { result } = renderHook(() =>
      useCancel({
        prepareCancel: async () => ({ wireTransaction: "tx" }),
        confirmCancel: async () => {
          throw new Error("confirm boom");
        },
        signAndSend: async () => "s",
      }),
    );

    await act(async () => {
      await result.current.cancel();
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error?.message).toBe("confirm boom");
  });
});
