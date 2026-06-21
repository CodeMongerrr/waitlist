// Single brand-token surface for the Catalyst landing. Dark, high-contrast,
// developer-tool aesthetic (Linear / Vercel / Resend energy). The same accent
// lands in the OG cards (packages/og/src/tokens.ts) so the brand reads
// consistent across landing, social, and inbox. Change `accent` here and in
// og/tokens.ts to reskin the whole surface.
export const THEME = {
  bg: "#08090a",
  bgAlt: "#0e1013",
  fg: "#f3f4f6",
  muted: "rgba(243,244,246,0.56)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.22)",
  accent: "#6e62ff",
  accentSoft: "rgba(110,98,255,0.16)",
  highlight: "rgba(110,98,255,0.12)",
  inputBg: "#0e1013",
  codeBg: "#0e1013",
  btnBg: "#6e62ff",
  btnFg: "#ffffff",
  btnBorder: "#6e62ff",
  danger: "#ff6b6b",
  warning: "#f5a623",
  success: "#3ddc97",
  overlay: "rgba(4,5,6,0.66)",
  radius: 8,
  modalRadius: 12,
  serifFont: "var(--font-inter), Inter, system-ui, sans-serif",
  uiFont: "var(--font-inter), Inter, system-ui, sans-serif",
  monoFont: 'var(--font-jetbrains-mono), "JetBrains Mono", ui-monospace, monospace',
  ctaLabel: "Join the waitlist",
} as const;

// Back-compat alias so any not-yet-removed demo component keeps compiling.
export const PAPER_THEME = THEME;

export type Theme = typeof THEME;
