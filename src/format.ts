import type { Network } from "./types.js";

const USDC_DECIMALS = 6;

/** "5000000" → "5.00" (or "5.00 USDC" with the ticker). */
export function formatUsdc(
  amountBaseUnits: string | number,
  opts: { withTicker?: boolean; decimals?: number } = {},
): string {
  const decimals = opts.decimals ?? USDC_DECIMALS;
  const n = Number(amountBaseUnits) / 10 ** decimals;
  // Trim to 2 dp for whole-cent USDC; keep more only if the value needs it.
  const dp = Number.isInteger(n * 100) ? 2 : Math.min(decimals, 6);
  const s = n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: dp });
  return opts.withTicker ? `${s} USDC` : s;
}

/** Short price suffix for a pricing card: 720 → "/mo", 24 → "/day", 1 → "/hr". */
export function formatPeriodSuffix(periodHours: number): string {
  switch (periodHours) {
    case 1:
      return "/hr";
    case 24:
      return "/day";
    case 168:
      return "/wk";
    case 720:
      return "/mo";
    case 8760:
      return "/yr";
    default:
      return periodHours % 24 === 0 ? `/${periodHours / 24}d` : `/${periodHours}h`;
  }
}

/** Human label: 720 → "Billed monthly", 1 → "Billed hourly". */
export function formatPeriodLabel(periodHours: number): string {
  const map: Record<number, string> = {
    1: "hourly",
    24: "daily",
    168: "weekly",
    720: "monthly",
    8760: "yearly",
  };
  const known = map[periodHours];
  if (known) return `Billed ${known}`;
  if (periodHours % 24 === 0) return `Billed every ${periodHours / 24} days`;
  return `Billed every ${periodHours} hours`;
}

export function formatNetwork(network: Network): string {
  return network === "solana-devnet" ? "Solana devnet" : "Solana";
}
