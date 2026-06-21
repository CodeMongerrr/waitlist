// Single brand-token surface for the landing. Same accent (#1d4ed8) lands
// in the OG cards (packages/og/src/tokens.ts) and welcome email so the
// brand reads consistent across landing, social, and inbox.
export const PAPER_THEME = {
  bg: "#f4f4f1",
  bgAlt: "#eaeae5",
  fg: "#16181a",
  muted: "rgba(22,24,26,0.55)",
  border: "rgba(22,24,26,0.12)",
  borderStrong: "rgba(22,24,26,0.28)",
  accent: "#1d4ed8",
  highlight: "rgba(29,78,216,0.06)",
  inputBg: "#ffffff",
  codeBg: "#eaeae5",
  btnBg: "#16181a",
  btnFg: "#f4f4f1",
  btnBorder: "#16181a",
  danger: "#1d4ed8",
  warning: "#a16207",
  success: "#15803d",
  overlay: "rgba(22,24,26,0.55)",
  radius: 4,
  modalRadius: 6,
  serifFont: '"Newsreader", "Source Serif 4", Georgia, serif',
  uiFont: "var(--font-inter), Inter, system-ui, sans-serif",
  monoFont: 'var(--font-jetbrains-mono), "JetBrains Mono", ui-monospace, monospace',
  ctaLabel: "Submit signup",
} as const;

export type Theme = typeof PAPER_THEME;
