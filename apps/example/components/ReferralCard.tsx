"use client";

import { useState } from "react";
import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";

type Props = {
  t: Theme;
  signup: Signup;
  onDone?: () => void;
  compact?: boolean;
};

export function ReferralCard({ t, signup, onDone, compact = false }: Props) {
  const [copied, setCopied] = useState(false);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://catalyst.app";
  const url = `${origin}/?ref=${signup.code}`;
  const display = url.replace(/^https?:\/\//, "");

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const shareX = () => {
    const text =
      "I just joined the Catalyst waitlist — autonomous X growth in my own voice, and nothing posts without my approval. Skip the line with my link:";
    const u = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(u, "_blank", "noopener");
  };

  return (
    <div style={{ fontFamily: t.uiFont, animation: "wlPop .35s ease both" }}>
      <div
        style={{
          fontFamily: t.monoFont,
          fontSize: 10.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: t.accent,
          marginBottom: 12,
        }}
      >
        You&apos;re on the list
      </div>
      <div
        style={{
          fontSize: compact ? 40 : 52,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          fontWeight: 700,
          color: t.fg,
          marginBottom: 8,
        }}
      >
        #{signup.position.toLocaleString()}
        <span style={{ color: t.accent }}>.</span>
      </div>
      <div
        style={{
          fontSize: 14,
          color: t.muted,
          lineHeight: 1.6,
          marginBottom: 20,
          maxWidth: 420,
        }}
      >
        Confirmation sent to <span style={{ color: t.fg }}>{signup.email}</span>.
        Every friend who joins with your link moves you up{" "}
        <span style={{ color: t.fg }}>5 spots</span>. Your position updates live.
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 13px",
          background: t.codeBg,
          border: `1px solid ${t.border}`,
          borderRadius: t.radius,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            fontFamily: t.monoFont,
            fontSize: 12.5,
            color: t.fg,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {display}
        </div>
        <button
          onClick={copy}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            background: copied ? t.accent : "transparent",
            color: copied ? t.btnFg : t.fg,
            border: `1px solid ${copied ? t.accent : t.borderStrong}`,
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: t.uiFont,
            transition: "all .15s",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <button
        onClick={shareX}
        style={{
          width: "100%",
          padding: "13px 16px",
          fontSize: 14,
          fontWeight: 600,
          background: t.btnBg,
          color: t.btnFg,
          border: `1px solid ${t.btnBorder}`,
          borderRadius: t.radius,
          cursor: "pointer",
          fontFamily: t.uiFont,
        }}
      >
        Share on X &rarr; skip the line
      </button>

      {onDone && (
        <button
          onClick={onDone}
          style={{
            width: "100%",
            padding: "11px",
            marginTop: 6,
            background: "transparent",
            color: t.muted,
            border: "none",
            cursor: "pointer",
            fontFamily: t.uiFont,
            fontSize: 12.5,
          }}
        >
          &larr; back
        </button>
      )}
    </div>
  );
}
