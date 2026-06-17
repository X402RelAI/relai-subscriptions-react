// Optional adapter for @solana/wallet-adapter-react.
// Import from "@relai-fi/subscriptions-react/wallet" so the core stays wallet-agnostic.
import { useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import type { SignAndSend } from "./types.js";

function base64ToBytes(b64: string): Uint8Array {
  if (typeof atob !== "function") {
    throw new Error("atob is unavailable — the wallet adapter helper is browser-only.");
  }
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Returns a `signAndSend` wired to the connected wallet-adapter wallet —
 * deserialize the base64 tx, sign + send it, wait for confirmation, return the signature.
 *
 *   import { useRelaiSignAndSend, useRelaiWallet } from "@relai-fi/subscriptions-react/wallet";
 *   const signAndSend = useRelaiSignAndSend();
 *   const wallet = useRelaiWallet();
 *   <PricingTable planId="pl_x" wallet={wallet} signAndSend={signAndSend} />
 */
export function useRelaiSignAndSend(): SignAndSend {
  const { connection } = useConnection();
  const { sendTransaction } = useWallet();
  return useCallback<SignAndSend>(
    async (wireTransactionBase64) => {
      const bytes = base64ToBytes(wireTransactionBase64);
      let tx: Transaction | VersionedTransaction;
      try {
        tx = VersionedTransaction.deserialize(bytes);
      } catch {
        tx = Transaction.from(bytes);
      }
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      return signature;
    },
    [connection, sendTransaction],
  );
}

/** The connected wallet's base58 address (or undefined). */
export function useRelaiWallet(): string | undefined {
  const { publicKey } = useWallet();
  return publicKey?.toBase58();
}
