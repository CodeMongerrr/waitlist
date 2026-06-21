"use client";

import { useState } from "react";
import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { validateEmail } from "@/lib/helpers";

type Tier = "starting" | "growing" | "established";

type Props = {
  t: Theme;
  onSuccess?: (signup: Signup) => void;
  dense?: boolean;
};

interface ApiResponse {
  ok?: boolean;
  alreadyJoined?: boolean;
  referralCode?: string;
  position?: number | null;
  referralCount?: number;
  error?: string;
}

const TIERS: { value: Tier; label: string; hint: string }[] = [
  { value: "starting", label: "Starting out", hint: "< 1k" },
  { value: "growing", label: "Growing", hint: "1k–10k" },
  { value: "established", label: "Established", hint: "10k+" },
];

function refFromUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("ref") ?? undefined;
}

export function SignupForm({ t, onSuccess, dense = false }: Props) {
  const [email, setEmail] = useState("");
  // Optional. X handle and tier never block a signup.
  const [handle, setHandle] = useState("");
  const [tier, setTier] = useState<Tier | null>(null);
  // Honeypot. Hidden from humans; bots that auto-fill all inputs trip it.
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    setError("");
    setSuggestion("");
    const v = validateEmail(email);
    if (!v.ok) {
      setError(v.reason);
      return;
    }
    if (v.suggestion) {
      setSuggestion(v.suggestion);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          x_handle: handle.trim() || undefined,
          tier: tier ?? undefined,
          source: "landing",
          ref: refFromUrl(),
          website_url: websiteUrl,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Try again.");
        return;
      }
      const cleanHandle = handle.trim().replace(/^@+/, "");
      const display =
        cleanHandle || email.trim().toLowerCase().split("@")[0] || "you";
      onSuccess?.({
        name: display,
        email: email.trim().toLowerCase(),
        code: body.referralCode ?? "",
        position: body.position ?? 1,
      });
    } catch {
      setError("Network error. Check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  const acceptSuggestion = () => {
    setEmail(suggestion);
    setSuggestion("");
  };

  const fieldPad = dense ? "11px 13px" : "14px 15px";
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: fieldPad,
    fontFamily: t.uiFont,
    fontSize: dense ? 14 : 15,
    color: t.fg,
    background: t.inputBg,
    border: `1px solid ${touched && error ? t.danger : t.border}`,
    borderRadius: t.radius,
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
  };

  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      <input
        className="wl-input"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setSuggestion("");
        }}
        style={inputStyle}
        disabled={submitting}
      />

      {/* Optional X handle with a leading @ affordance. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: t.inputBg,
          border: `1px solid ${t.border}`,
          borderRadius: t.radius,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            padding: `0 4px 0 14px`,
            color: t.muted,
            fontFamily: t.monoFont,
            fontSize: dense ? 14 : 15,
          }}
        >
          @
        </span>
        <input
          className="wl-input"
          name="x_handle"
          type="text"
          autoComplete="off"
          placeholder="yourhandle  ·  X handle (optional)"
          value={handle}
          onChange={(e) => setHandle(e.target.value.replace(/^@+/, ""))}
          style={{
            ...inputStyle,
            border: "none",
            borderRadius: 0,
            padding: `${fieldPad.split(" ")[0]} 14px ${fieldPad.split(" ")[0]} 2px`,
            background: "transparent",
          }}
          disabled={submitting}
        />
      </div>

      {/* Optional tier picker. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span
          style={{
            fontFamily: t.monoFont,
            fontSize: 10.5,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: t.muted,
          }}
        >
          Where are you on X? (optional)
        </span>
        <div style={{ display: "flex", gap: 7 }}>
          {TIERS.map((o) => {
            const active = tier === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setTier(active ? null : o.value)}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "9px 6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  background: active ? t.accentSoft : "transparent",
                  color: active ? t.fg : t.muted,
                  border: `1px solid ${active ? t.accent : t.border}`,
                  borderRadius: t.radius,
                  cursor: "pointer",
                  fontFamily: t.uiFont,
                  transition: "all .12s",
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{o.label}</span>
                <span style={{ fontSize: 10.5, color: t.muted }}>{o.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <input
        name="website_url"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />

      {suggestion && (
        <div
          style={{
            fontSize: 12.5,
            color: t.muted,
            fontFamily: t.uiFont,
            lineHeight: 1.4,
          }}
        >
          Did you mean{" "}
          <button
            type="button"
            onClick={acceptSuggestion}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
              color: t.accent,
              textDecoration: "underline",
              font: "inherit",
            }}
          >
            {suggestion}
          </button>
          ?{" "}
          <button
            type="button"
            onClick={() => submit()}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
              color: t.muted,
              textDecoration: "underline",
              font: "inherit",
              marginLeft: 6,
            }}
          >
            no, send anyway
          </button>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 12.5, color: t.danger, fontFamily: t.uiFont }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: dense ? "12px 16px" : "15px 18px",
          background: t.btnBg,
          color: t.btnFg,
          border: `1px solid ${t.btnBorder}`,
          borderRadius: t.radius,
          cursor: submitting ? "wait" : "pointer",
          fontFamily: t.uiFont,
          fontSize: dense ? 14 : 15,
          fontWeight: 600,
          letterSpacing: "0.01em",
          boxShadow: "0 8px 30px rgba(124,92,255,0.40)",
          transition: "filter .15s, transform .08s",
        }}
      >
        {submitting ? "Reserving your spot…" : t.ctaLabel}
      </button>

      <div
        style={{
          fontSize: 11.5,
          color: t.muted,
          fontFamily: t.uiFont,
          lineHeight: 1.5,
        }}
      >
        Nothing posts without your approval. Disposable emails blocked · rate
        limited.
      </div>
    </form>
  );
}
