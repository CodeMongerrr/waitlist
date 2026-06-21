// Brand tokens for the Catalyst landing — "Iridescent Spec Room" direction.
// Near-black control room, rationed iridescent accents, spec-sheet markings.
// Change `accent` here and in og/tokens.ts to reskin landing + social cards.
export const THEME = {
  bg: "#08090A",
  bgAlt: "#0E1013",
  fg: "#F4F4F5",
  muted: "rgba(244,244,245,0.56)",
  faint: "rgba(244,244,245,0.40)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",

  // Iridescent accent set. Violet is primary (CTA, links); the others appear
  // in gradients and per-stage status dots. Color is rationed on purpose.
  accent: "#7C5CFF",
  accentCyan: "#23D5E0",
  accentMint: "#5BE9B9",
  accentPeach: "#FF9E7A",
  accentSoft: "rgba(124,92,255,0.16)",
  highlight: "rgba(124,92,255,0.12)",

  inputBg: "#0E1013",
  codeBg: "#0E1013",
  btnBg: "#7C5CFF",
  btnFg: "#ffffff",
  btnBorder: "#7C5CFF",
  danger: "#ff6b6b",
  warning: "#FF9E7A",
  success: "#5BE9B9",
  overlay: "rgba(4,5,6,0.70)",
  radius: 10,
  modalRadius: 16,

  displayFont:
    "var(--font-bricolage), 'Bricolage Grotesque', system-ui, sans-serif",
  serifFont:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  uiFont: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
  monoFont:
    "var(--font-ibm-plex-mono), 'IBM Plex Mono', ui-monospace, monospace",
  ctaLabel: "Join the waitlist",
} as const;

// Back-compat alias for any component still importing PAPER_THEME.
export const PAPER_THEME = THEME;

export type Theme = typeof THEME;
