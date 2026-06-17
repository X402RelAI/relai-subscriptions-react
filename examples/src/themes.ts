import type { RelaiTheme } from "@relai-fi/subscriptions-react";

export interface ThemePreset {
  id: string;
  label: string;
  note: string;
  /** Passed to <PricingTable theme={...}>. Omit for the default RelAI look. */
  theme?: RelaiTheme;
  /** Example-only: background behind the section, to show the theme in context. */
  surface: string;
  /** Example-only: text color for the section heading on that surface. */
  onSurface: string;
  /**
   * Example-only: instead of the `theme` prop, style via a CSS class that overrides
   * the --relai-* variables (see example.css). Demonstrates the stylesheet approach.
   */
  cssClass?: string;
}

export const THEMES: ThemePreset[] = [
  {
    id: "default",
    label: "RelAI (default)",
    note: "No theme prop — the shipped electric-violet palette on a light surface.",
    surface: "#f6f7f9",
    onSurface: "#0c0e16",
  },
  {
    id: "dark",
    label: "Dark",
    note: "theme={{ card, background, foreground, border, primary }} for a dark surface.",
    surface: "#0b0d14",
    onSurface: "#f4f4f6",
    theme: {
      primary: "#a78bfa",
      background: "transparent",
      card: "#13141d",
      foreground: "#f4f4f6",
      mutedForeground: "#9aa0ae",
      border: "#262838",
    },
  },
  {
    id: "minimal",
    label: "Minimal / neutral",
    note: "theme={{ primary: '#111827', radius: '10px' }} — monochrome, tighter corners.",
    surface: "#ffffff",
    onSurface: "#0c0e16",
    theme: { primary: "#111827", radius: "10px", border: "#e5e7eb" },
  },
  {
    id: "emerald",
    label: "Emerald / finance",
    note: "theme={{ primary: '#059669' }} — swap the accent to match your brand.",
    surface: "#f3faf7",
    onSurface: "#06281d",
    theme: { primary: "#059669" },
  },
  {
    id: "playful",
    label: "Rounded / playful",
    note: "theme={{ primary: '#db2777', radius: '24px' }} — bigger radius, pink accent.",
    surface: "#fff5fb",
    onSurface: "#3b0a25",
    theme: { primary: "#db2777", radius: "24px" },
  },
  {
    id: "css-override",
    label: "Styled via CSS (no theme prop)",
    note: "Override --relai-* on your own class instead of the prop. See .demo-amber in example.css.",
    surface: "#1a1205",
    onSurface: "#fde68a",
    cssClass: "demo-amber",
  },
];
