"use client";

import { useState } from "react";
import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { validateEmail } from "@/lib/helpers";

type Props = {
  t: Theme;
  onSuccess?: (signup: Signup) => void;
  dense?: boolean;
};

interface ApiResponse {
  ok?: boolean;
  duplicate?: boolean;
  referralCode?: string;
  position?: number | null;
  referralCount?: number;
  error?: string;
}

function refFromUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("ref") ?? undefined;
}

export function SignupForm({ t, onSuccess, dense = false }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    if (!name.trim()) {
      setError("Add your name.");
      return;
    }
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
          name: name.trim(),
          email: email.trim().toLowerCase(),
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
      onSuccess?.({
        name: name.trim(),
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: dense ? "10px 12px" : "14px 14px",
    fontFamily: t.uiFont,
    fontSize: dense ? 13 : 14,
    color: t.fg,
    background: t.inputBg,
    border: `1px solid ${touched && error ? t.danger : t.border}`,
    borderRadius: t.radius,
    outline: "none",
    transition: "border-color .15s, background .15s",
  };

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: dense ? 8 : 10,
      }}
    >
      <input
        name="name"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
        disabled={submitting}
      />
      <input
        name="email"
        type="text"
        placeholder="you@domain.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setSuggestion("");
        }}
        style={inputStyle}
        disabled={submitting}
      />
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
        <div
          style={{ fontSize: 12.5, color: t.danger, fontFamily: t.uiFont }}
        >
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: dense ? "10px 14px" : "14px 16px",
          background: t.btnBg,
          color: t.btnFg,
          border: `1px solid ${t.btnBorder ?? t.btnBg}`,
          borderRadius: t.radius,
          cursor: submitting ? "wait" : "pointer",
          fontFamily: t.uiFont,
          fontSize: dense ? 13 : 14,
          fontWeight: 600,
          letterSpacing: "0.01em",
          transition: "transform .08s, background .15s",
        }}
      >
        {submitting ? "Reserving your place…" : t.ctaLabel || "Join the waitlist"}
      </button>
      <div
        style={{
          fontSize: 11.5,
          color: t.muted,
          fontFamily: t.uiFont,
          lineHeight: 1.5,
        }}
      >
        Per-IP rate limited · disposable emails blocked · honeypot enabled
      </div>
    </form>
  );
}
