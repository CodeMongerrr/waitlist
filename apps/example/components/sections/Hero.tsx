"use client";

import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { SignupForm } from "../SignupForm";
import { ReferralCard } from "../ReferralCard";

const CHIPS: { label: string; dot: keyof Pick<Theme, "accentCyan" | "accentMint" | "accent"> }[] = [
  { label: "Consistent, not consuming", dot: "accentCyan" },
  { label: "Sounds like you", dot: "accent" },
  { label: "Nothing posts without approval", dot: "accentMint" },
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
  const mono: React.CSSProperties = {
    fontFamily: t.monoFont,
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  };
  return (
    <section
      id="top"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Aurora signature blob (the first of exactly two glow peaks). */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-16%",
          left: "50%",
          width: "min(1120px,128vw)",
          height: 780,
          transform: "translateX(-50%)",
          filter: "blur(92px) saturate(140%)",
          opacity: 0.9,
          zIndex: 0,
          pointerEvents: "none",
          animation: "auroraDrift 22s ease-in-out infinite alternate",
          background:
            "radial-gradient(60% 80% at 22% 18%, rgba(124,92,255,0.50) 0%, rgba(124,92,255,0) 60%), radial-gradient(50% 70% at 80% 26%, rgba(35,213,224,0.36) 0%, rgba(35,213,224,0) 55%), radial-gradient(55% 65% at 62% 82%, rgba(91,233,185,0.20) 0%, rgba(91,233,185,0) 60%), conic-gradient(from 200deg at 50% 60%, rgba(255,158,122,0.30), rgba(124,92,255,0.28), rgba(35,213,224,0.28), rgba(255,158,122,0.30))",
        }}
      />
      <div className="hero-grid" />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "104px clamp(20px,5vw,72px) 56px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(32px,5vw,64px)",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Copy column */}
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            <div
              style={{
                ...mono,
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${t.border}`,
                color: t.muted,
                marginBottom: 22,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: t.accentCyan,
                  boxShadow: `0 0 12px ${t.accentCyan}`,
                  animation: "dotPulse 2s infinite",
                }}
              />
              Catalyst / X growth system
            </div>

            <h1
              style={{
                fontFamily: t.displayFont,
                fontWeight: 800,
                fontSize: "clamp(40px,7vw,88px)",
                lineHeight: 0.98,
                letterSpacing: "-0.03em",
                margin: "0 0 24px",
                color: t.fg,
                textWrap: "balance",
              }}
            >
              Show up on X <span className="iris-text">every day</span>,
              <br />
              written{" "}
              <span
                style={{
                  fontFamily: t.serifFont,
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#C0A6FF",
                }}
              >
                in your voice
              </span>
              ,<br />
              posted on your call.
            </h1>

            <p
              style={{
                fontFamily: t.uiFont,
                fontSize: "clamp(16px,1.6vw,19px)",
                lineHeight: 1.6,
                color: t.muted,
                maxWidth: "48ch",
                margin: "0 0 28px",
              }}
            >
              Catalyst is an autonomous multi-agent system that researches,
              drafts, and schedules your X posts. You spend about ten minutes a
              day approving drafts. Nothing is ever posted without your click.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CHIPS.map((c) => (
                <span
                  key={c.label}
                  style={{
                    ...mono,
                    fontSize: 10.5,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 12px",
                    borderRadius: 999,
                    border: `1px solid ${t.border}`,
                    background: "rgba(255,255,255,0.03)",
                    color: t.muted,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 99,
                      background: t[c.dot],
                      boxShadow: `0 0 10px ${t[c.dot]}`,
                    }}
                  />
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          {/* Form column */}
          <div style={{ flex: "1 1 380px", minWidth: 0, maxWidth: 460 }}>
            <div
              className="glass"
              style={{ borderRadius: 16, padding: "clamp(20px,3vw,28px)" }}
            >
              {!signup ? (
                <>
                  <div
                    style={{
                      fontFamily: t.displayFont,
                      fontSize: 19,
                      fontWeight: 700,
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
                      marginBottom: 18,
                      lineHeight: 1.5,
                    }}
                  >
                    Early access and a spot in line. Email is all we need.
                  </div>
                  <SignupForm t={t} onSuccess={setSignup} />
                </>
              ) : (
                <ReferralCard
                  t={t}
                  signup={signup}
                  onDone={() => setSignup(null)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          paddingBottom: 26,
          ...mono,
          color: t.faint,
        }}
      >
        <span style={{ display: "inline-block", animation: "scrollBob 2s ease-in-out infinite" }}>
          Scroll / 01—04
        </span>
      </div>
    </section>
  );
}
