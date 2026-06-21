import type { WaitlistConfig } from "@waitlist-stack/config";

// JSX factory for a dynamic favicon. Consumers wrap this in next/og's
// ImageResponse from their app/icon.tsx file. Renders the brand initial
// in a dark square with a blue accent dot — same visual signature as the
// landing's wordmark.

export interface FaviconInput {
  brand: WaitlistConfig["brand"];
  /**
   * Override the letter shown. Defaults to the lowercase first character
   * of brand.name. Use this if your brand starts with a non-letter or
   * if you want a wordmark like "wl" instead of "w".
   */
  letter?: string;
  /** Hex color. Default #171614 (ink). */
  background?: string;
  /** Hex color. Default #f4efe3 (cream). */
  foreground?: string;
  /** Accent dot color. Default #1d4ed8 (blue), matching landing accent. */
  accent?: string;
}

export const FAVICON_SIZE = { width: 64, height: 64 } as const;
export const FAVICON_CONTENT_TYPE = "image/png";

export function FaviconElement({
  brand,
  letter,
  background = "#171614",
  foreground = "#f4efe3",
  accent = "#1d4ed8",
}: FaviconInput) {
  const ch = (letter ?? brand.name.charAt(0).toLowerCase()).slice(0, 1);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background,
        color: foreground,
        fontSize: 44,
        fontWeight: 600,
        letterSpacing: "-0.06em",
        fontFamily: "serif",
      }}
    >
      <span>{ch}</span>
      <span style={{ color: accent, marginLeft: -2 }}>.</span>
    </div>
  );
}
