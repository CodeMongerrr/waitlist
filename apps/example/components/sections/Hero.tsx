"use client";

import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { SignupForm } from "../SignupForm";
import { ReferralCard } from "../ReferralCard";

const CHIPS = [
  "Nothing posts without approval",
  "Your voice, not a bot",
  "~10 min a day",
];

export function Hero({
  t,
  signup,
  setSignup,
}: {
  t: Theme;
  signup: Signup | null;
  setSignup: (s: Signup | null) => void;
}) {
  return (
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "clamp(56px,8vw,104px) 24px clamp(40px,6vw,72px)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 48,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 440px", minWidth: 0 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              border: `1px solid ${t.border}`,
              borderRadius: 999,
              marginBottom: 24,
              animation: "wlRise .5s ease both",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: t.accent,
                display: "block",
              }}
            />
            <span
              style={{
                fontFamily: t.monoFont,
                fontSize: 11.5,
                letterSpacing: "0.04em",
                color: t.muted,
              }}
            >
              Autonomous X growth · human-approved
            </span>
          </div>
          <h1
            style={{
              fontFamily: t.uiFont,
              fontSize: "clamp(34px,5.4vw,60px)",
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              fontWeight: 700,
              margin: "0 0 22px",
              color: t.fg,
              textWrap: "balance",
              maxWidth: 640,
            }}
          >
            Grow on X in your own voice. Without it becoming your job.
          </h1>
          <p
            style={{
              fontFamily: t.uiFont,
              fontSize: "clamp(16px,1.6vw,19px)",
              lineHeight: 1.6,
              color: t.muted,
              margin: "0 0 28px",
              maxWidth: 560,
            }}
          >
            Catalyst researches, drafts, and schedules posts that sound like you.
            You spend about ten minutes a day approving them. Nothing goes out
            without your say-so.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {CHIPS.map((c) => (
              <span
                key={c}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontFamily: t.uiFont,
                  fontSize: 13,
                  color: t.fg,
                  padding: "7px 12px",
                  background: t.bgAlt,
                  border: `1px solid ${t.border}`,
                  borderRadius: t.radius,
                }}
              >
                <span style={{ color: t.accent }}>✓</span>
                {c}
              </span>
            ))}
          </div>
        </div>

        <div style={{ flex: "1 1 360px", minWidth: 0, maxWidth: 440 }}>
          <div
            style={{
              background: t.bgAlt,
              border: `1px solid ${t.border}`,
              borderRadius: t.modalRadius,
              padding: 22,
            }}
          >
            {!signup ? (
              <>
                <div
                  style={{
                    fontFamily: t.uiFont,
                    fontSize: 16,
                    fontWeight: 600,
                    color: t.fg,
                    marginBottom: 4,
                  }}
                >
                  Join the waitlist
                </div>
                <div
                  style={{
                    fontFamily: t.uiFont,
                    fontSize: 13,
                    color: t.muted,
                    marginBottom: 16,
                    lineHeight: 1.5,
                  }}
                >
                  Early access and a spot in line. Email is all we need.
                </div>
                <SignupForm t={t} onSuccess={setSignup} />
              </>
            ) : (
              <ReferralCard t={t} signup={signup} onDone={() => setSignup(null)} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
