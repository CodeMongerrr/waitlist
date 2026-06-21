// Brand tokens for the Catalyst landing: minimal monochrome direction.
// Near-black canvas, white type, gray support, white primary action. The only
// color anywhere is `live` (the green "in private beta" status dot). Keeping
// the accent* token names (now grayscale) means existing components re-skin
// without structural changes.
export const THEME = {
  bg: "#0a0a0a",
  bgAlt: "#161616",
  fg: "#f4f4f5",
  muted: "rgba(244,244,245,0.52)",
  faint: "rgba(244,244,245,0.34)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.20)",

  // Monochrome "accents". Mint reads as pure white (the brightest emphasis);
  // the others are grays so gradients/dots stay tonal, not colorful.
  accent: "#ffffff",
  accentCyan: "#9a9aa0",
  accentMint: "#ffffff",
  accentPeach: "#6e6e74",
  accentSoft: "rgba(255,255,255,0.08)",
  highlight: "rgba(255,255,255,0.06)",
  // The single permitted color: the live/beta status dot.
  live: "#34d399",

  inputBg: "#141414",
  codeBg: "#141414",
  btnBg: "#ffffff",
  btnFg: "#0a0a0a",
  btnBorder: "#ffffff",
  danger: "#ff6b6b",
  warning: "#e0b341",
  success: "#34d399",
  overlay: "rgba(0,0,0,0.72)",
  radius: 8,
  modalRadius: 12,

  displayFont: "var(--font-inter), Inter, system-ui, sans-serif",
  serifFont: "var(--font-inter), Inter, system-ui, sans-serif",
  uiFont: "var(--font-inter), Inter, system-ui, sans-serif",
  monoFont: "var(--font-ibm-plex-mono), 'IBM Plex Mono', ui-monospace, monospace",
  ctaLabel: "Join the waitlist",
} as const;

export const PAPER_THEME = THEME;

export type Theme = typeof THEME;
