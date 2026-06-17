/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RELAI_PLAN_ID?: string;
  readonly VITE_RELAI_API_URL?: string;
  readonly VITE_SOLANA_RPC?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
