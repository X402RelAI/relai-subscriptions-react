import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { createRelaiClient } from "./client.js";
import type { RelaiClient } from "./client.js";
import type { RelaiTheme, SignAndSend } from "./types.js";

export interface RelaiContextValue {
  client: RelaiClient;
  /** The connected subscriber's wallet address (base58), if any. */
  wallet?: string;
  /** Signs + broadcasts a base64 wire tx → signature. */
  signAndSend?: SignAndSend;
  theme?: RelaiTheme;
}

const RelaiContext = createContext<RelaiContextValue | null>(null);

export interface RelaiProviderProps {
  /** Provide a client, or `baseUrl` to build the default one. */
  client?: RelaiClient;
  baseUrl?: string;
  wallet?: string;
  signAndSend?: SignAndSend;
  theme?: RelaiTheme;
  children: ReactNode;
}

/**
 * Optional. Sets the RelAI client, wallet, signAndSend and theme for every
 * component below it. Individual components also accept these as props (props win).
 */
export function RelaiProvider({
  client,
  baseUrl,
  wallet,
  signAndSend,
  theme,
  children,
}: RelaiProviderProps) {
  const value = useMemo<RelaiContextValue>(
    () => ({
      client: client ?? createRelaiClient({ baseUrl }),
      wallet,
      signAndSend,
      theme,
    }),
    [client, baseUrl, wallet, signAndSend, theme],
  );
  return <RelaiContext.Provider value={value}>{children}</RelaiContext.Provider>;
}

/** Read the RelAI context (returns null outside a provider). */
export function useRelaiContext(): RelaiContextValue | null {
  return useContext(RelaiContext);
}
