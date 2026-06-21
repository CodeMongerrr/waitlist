// Brand tokens for the default OG card. Inlined as constants because Satori
// (the renderer behind workers-og / next/og) has no access to CSS variables
// or Tailwind. Override by passing your own template.
//
// Catalyst palette: dark, high-contrast, matches the landing theme.
// `cream` = card background, `ink` = text, `red` = accent (keep this key name
// even though the value is no longer red; swapping the brand color stays a
// one-line change here).

export const OG_TOKENS = {
  width: 1200,
  height: 630,
  cream: "#08090a",
  ink: "#f3f4f6",
  // Accent kept on a generic key (not literally "red"). Matches the landing's
  // THEME.accent so social cards read consistent with the page.
  red: "#6e62ff",
  muted: "#8b8d98",
  line: "rgba(255,255,255,0.12)",
  monoStack:
    "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  serifStack: "Georgia, 'Times New Roman', serif",
} as const;

export type OgTokens = typeof OG_TOKENS;
