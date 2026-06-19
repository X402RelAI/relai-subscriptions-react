/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RELAI_PLAN_ID?: string;
  readonly VITE_RELAI_PLAN_ID_2?: string;
  readonly VITE_RELAI_PLAN_ID_3?: string;
  readonly VITE_RELAI_API_URL?: string;
  readonly VITE_SOLANA_RPC?: string;
  readonly VITE_BACKEND_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
