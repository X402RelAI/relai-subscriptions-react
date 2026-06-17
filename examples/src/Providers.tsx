import { useMemo } from "react";
import type { ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { RPC_URL } from "./config";

// Wallet-standard wallets (Phantom, Solflare, Backpack…) auto-register, so the
// adapter list can stay empty. The Live section reads the connected wallet from here.
export function Providers({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => RPC_URL, []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
