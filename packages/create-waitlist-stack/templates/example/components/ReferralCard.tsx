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
  const url = `waitlist.example/r/${signup.code}`;

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(`https://${url}`);
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const share = (where: "x" | "whatsapp" | "linkedin") => {
    const msg = encodeURIComponent(
      `I'm #${signup.position} on the waitlist for waitlist-stack. Skip ahead with my link: https://${url}`
    );
    const links = {
      x: `https://x.com/intent/post?text=${msg}`,
      whatsapp: `https://wa.me/?text=${msg}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https://${url}`,
    };
    window.open(links[where], "_blank");
  };

  return (
    <div style={{ fontFamily: t.uiFont }}>
      <div
        style={{
          fontFamily: t.serifFont,
          fontSize: compact ? 26 : 32,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          fontWeight: 500,
          color: t.fg,
          marginBottom: 6,
        }}
      >
        You&apos;re #{signup.position.toLocaleString()}.
      </div>
      <div
        style={{
          fontSize: 13.5,
          color: t.muted,
          lineHeight: 1.55,
          marginBottom: 18,
        }}
      >
        Welcome, {signup.name.split(" ")[0]}. Confirmation sent to{" "}
        <span style={{ color: t.fg }}>{signup.email}</span>. Refer 3 friends and
        you jump 10 spots.
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          background: t.codeBg,
          border: `1px solid ${t.border}`,
          borderRadius: t.radius,
          marginBottom: 12,
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
          {url}
        </div>
        <button
          onClick={copy}
          style={{
            padding: "5px 10px",
            fontSize: 11.5,
            fontWeight: 600,
            background: copied ? t.accent : "transparent",
            color: copied ? t.btnFg : t.fg,
            border: `1px solid ${copied ? t.accent : t.border}`,
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: t.uiFont,
            transition: "all .15s",
          }}
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 6,
          marginBottom: compact ? 0 : 16,
        }}
      >
        {(
          [
            { k: "x", l: "Share on X" },
            { k: "whatsapp", l: "WhatsApp" },
            { k: "linkedin", l: "LinkedIn" },
          ] as const
        ).map((o) => (
          <button
            key={o.k}
            onClick={() => share(o.k)}
            style={{
              padding: "9px 8px",
              fontSize: 12,
              fontWeight: 500,
              background: "transparent",
              color: t.fg,
              border: `1px solid ${t.border}`,
              borderRadius: t.radius,
              cursor: "pointer",
              fontFamily: t.uiFont,
            }}
          >
            {o.l}
          </button>
        ))}
      </div>
      {onDone && (
        <button
          onClick={onDone}
          style={{
            width: "100%",
            padding: "11px",
            marginTop: 4,
            background: "transparent",
            color: t.muted,
            border: "none",
            cursor: "pointer",
            fontFamily: t.uiFont,
            fontSize: 12.5,
          }}
        >
          ← back to landing
        </button>
      )}
    </div>
  );
}
