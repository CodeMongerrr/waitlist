"use client";

import { useState } from "react";
import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { validateEmail } from "@/lib/helpers";

type Tier = "" | "starting" | "growing" | "established";

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

function refFromUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("ref") ?? undefined;
}

export function SignupForm({ t, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [tier, setTier] = useState<Tier>("");
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
          tier: tier || undefined,
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
      const display = cleanHandle || email.trim().toLowerCase().split("@")[0] || "you";
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

  const field: React.CSSProperties = {
    padding: "13px 14px",
    fontFamily: t.uiFont,
    fontSize: 15,
    color: t.fg,
    background: t.inputBg,
    border: `1px solid ${touched && error ? t.danger : t.border}`,
    borderRadius: t.radius,
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
    width: "100%",
    minWidth: 0,
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
      {/* Row 1: email + submit */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
          style={{ ...field, flex: "1 1 240px" }}
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: "1 1 150px",
            padding: "13px 18px",
            background: t.btnBg,
            color: t.btnFg,
            border: `1px solid ${t.btnBorder}`,
            borderRadius: t.radius,
            cursor: submitting ? "wait" : "pointer",
            fontFamily: t.uiFont,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.01em",
            transition: "filter .15s, transform .08s",
          }}
        >
          {submitting ? "Reserving…" : t.ctaLabel}
        </button>
      </div>

      {/* Row 2: optional handle + tier */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <input
          className="wl-input"
          name="x_handle"
          type="text"
          autoComplete="off"
          placeholder="@yourhandle (optional)"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          style={{ ...field, flex: "1 1 180px" }}
          disabled={submitting}
        />
        <select
          className="wl-input"
          name="tier"
          value={tier}
          onChange={(e) => setTier(e.target.value as Tier)}
          disabled={submitting}
          style={{
            ...field,
            flex: "1 1 180px",
            color: tier ? t.fg : t.muted,
            appearance: "none",
            WebkitAppearance: "none",
            cursor: "pointer",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23999' stroke-width='1.4' fill='none'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            paddingRight: 34,
          }}
        >
          <option value="" style={{ color: t.bg }}>Where are you on X? (optional)</option>
          <option value="starting" style={{ color: t.bg }}>Starting out (&lt;1k)</option>
          <option value="growing" style={{ color: t.bg }}>Growing (1k–10k)</option>
          <option value="established" style={{ color: t.bg }}>Established (10k+)</option>
        </select>
      </div>

      {/* Honeypot */}
      <input
        name="website_url"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      {suggestion && (
        <div style={{ fontSize: 12.5, color: t.muted, fontFamily: t.uiFont, lineHeight: 1.4 }}>
          Did you mean{" "}
          <button
            type="button"
            onClick={acceptSuggestion}
            style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: t.fg, textDecoration: "underline", font: "inherit" }}
          >
            {suggestion}
          </button>
          ?{" "}
          <button
            type="button"
            onClick={() => submit()}
            style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: t.muted, textDecoration: "underline", font: "inherit", marginLeft: 6 }}
          >
            no, send anyway
          </button>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 12.5, color: t.danger, fontFamily: t.uiFont }}>{error}</div>
      )}

      <div
        style={{
          fontFamily: t.monoFont,
          fontSize: 11.5,
          letterSpacing: "0.04em",
          color: t.faint,
          textAlign: "center",
          marginTop: 6,
        }}
      >
        No card. No spam. Just early access.
      </div>
    </form>
  );
}
