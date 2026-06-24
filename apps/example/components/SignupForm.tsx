"use client";

import { useId, useRef, useState } from "react";
import type { Signup } from "@/lib/helpers";
import { validateEmail } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onSuccess?: (signup: Signup) => void;
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

export function SignupForm({ onSuccess }: Props) {
  const emailId = useId();
  const helperId = useId();
  const errorId = useId();

  const [email, setEmail] = useState("");
  // Honeypot. Hidden from humans; bots that auto-fill all inputs trip it.
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Validate on blur (not on every keystroke): show the error only once the
  // user has finished with the field. Skill rule: inline-validation.
  const validateOnBlur = () => {
    if (!email) return;
    setTouched(true);
    const v = validateEmail(email);
    if (!v.ok) {
      setError(v.reason);
      setSuggestion("");
    } else if (v.suggestion) {
      setSuggestion(v.suggestion);
      setError("");
    } else {
      setError("");
    }
  };

  const submit = async (e?: React.FormEvent, force = false) => {
    e?.preventDefault();
    setTouched(true);
    setError("");
    setSuggestion("");
    const v = validateEmail(email);
    if (!v.ok) {
      setError(v.reason);
      emailRef.current?.focus();
      return;
    }
    // `force` is the "no, send anyway" path: skip the typo suggestion and send
    // the address as typed (otherwise a real typo-shaped domain can't get past).
    if (v.suggestion && !force) {
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
          source: "landing",
          ref: refFromUrl(),
          website_url: websiteUrl,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Try again.");
        emailRef.current?.focus();
        return;
      }
      const display = email.trim().toLowerCase().split("@")[0] || "you";
      // Capture the card now: onSuccess swaps this form for the taller referral
      // card in the same .float-card, which can push its Share button below the
      // fold on mobile. Scroll it into view so the success state stays on screen.
      const card = formRef.current?.closest<HTMLElement>(".float-card") ?? null;
      onSuccess?.({
        name: display,
        email: email.trim().toLowerCase(),
        code: body.referralCode ?? "",
        position: body.position ?? 1,
        referralCount: body.referralCount ?? 0,
      });
      if (card) {
        // Two frames: let React commit the taller referral card before we
        // center it, otherwise we'd center the old (shorter) form layout.
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            card.scrollIntoView({ behavior: "smooth", block: "center" }),
          ),
        );
      }
    } catch {
      setError("Network error. Check your connection and retry.");
      emailRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const acceptSuggestion = () => {
    setEmail(suggestion);
    setSuggestion("");
  };

  const showError = touched && !!error;

  return (
    <form ref={formRef} onSubmit={submit} className="flex flex-col gap-2 text-left" noValidate>
      {/* Email (the only field; everything else is asked for after signup). */}
      <div className="flex flex-col gap-1">
        <Label htmlFor={emailId} className="sr-only">
          Email address
        </Label>
        <Input
          ref={emailRef}
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSuggestion("");
            if (error) setError("");
          }}
          onBlur={validateOnBlur}
          disabled={submitting}
          aria-invalid={showError}
          aria-describedby={`${helperId}${showError ? ` ${errorId}` : ""}`}
          className="h-12 text-base md:text-base dark:bg-black/20"
        />
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
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="mt-1 h-12 w-full text-base font-semibold"
      >
        {submitting ? "Reserving…" : "Join the waitlist"}
      </Button>

      {suggestion && (
        <div role="status" aria-live="polite" className="text-[12.5px] leading-snug text-muted-foreground">
          Did you mean{" "}
          <button
            type="button"
            onClick={acceptSuggestion}
            className="inline-flex min-h-[24px] cursor-pointer items-center py-1 align-baseline font-[inherit] text-foreground underline"
          >
            {suggestion}
          </button>
          ?{" "}
          <button
            type="button"
            onClick={() => submit(undefined, true)}
            className="ml-1.5 inline-flex min-h-[24px] cursor-pointer items-center py-1 align-baseline font-[inherit] text-muted-foreground underline"
          >
            no, send anyway
          </button>
        </div>
      )}

      {showError && (
        <div id={errorId} role="alert" className="text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      {/* One-line reassurance + referral hook (fits a single line on mobile). */}
      <p
        id={helperId}
        className="mt-2 text-center font-mono text-[11px] tracking-[0.04em] text-faint"
      >
        No card. No spam. Refer to skip ahead.
      </p>
    </form>
  );
}
