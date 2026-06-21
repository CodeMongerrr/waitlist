// Brand tokens for the default OG card. Inlined as constants because Satori
// (the renderer behind workers-og / next/og) has no access to CSS variables
// or Tailwind. Override by passing your own template.
//
// Catalyst palette: minimal monochrome. `cream` = card background (near-black),
// `ink` = text (near-white), `red` = the accent key (kept for one-line swaps;
// here it is white to match the monochrome landing).

export const OG_TOKENS = {
  width: 1200,
  height: 630,
  cream: "#0a0a0a",
  ink: "#f4f4f5",
  red: "#ffffff",
  muted: "#8a8a90",
  line: "rgba(255,255,255,0.12)",
  monoStack:
    "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  serifStack: "Georgia, 'Times New Roman', serif",
} as const;

export type OgTokens = typeof OG_TOKENS;
