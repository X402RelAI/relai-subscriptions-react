// Real-mode config, from .env (see .env.example). Falls back to sensible defaults
// so `npm run dev` works even before you create .env.
export const PLAN_ID = import.meta.env.VITE_RELAI_PLAN_ID ?? "10898734391234361336";
export const API_URL = import.meta.env.VITE_RELAI_API_URL ?? "https://api.relai.fi";
export const RPC_URL = import.meta.env.VITE_SOLANA_RPC ?? "https://api.devnet.solana.com";
