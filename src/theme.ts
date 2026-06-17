import type { CSSProperties } from "react";
import type { RelaiTheme } from "./types.js";

/** Map a RelaiTheme onto the `--relai-*` CSS variables consumed by styles.css. */
export function themeToCssVars(theme?: RelaiTheme): CSSProperties {
  if (!theme) return {};
  const v: Record<string, string> = {};
  if (theme.primary) v["--relai-primary"] = theme.primary;
  if (theme.primaryForeground) v["--relai-primary-fg"] = theme.primaryForeground;
  if (theme.background) v["--relai-bg"] = theme.background;
  if (theme.card) v["--relai-card"] = theme.card;
  if (theme.foreground) v["--relai-fg"] = theme.foreground;
  if (theme.mutedForeground) v["--relai-muted-fg"] = theme.mutedForeground;
  if (theme.border) v["--relai-border"] = theme.border;
  if (theme.radius) v["--relai-radius"] = theme.radius;
  return v as CSSProperties;
}
