"use client";

import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { SignupForm } from "../SignupForm";
import { ReferralCard } from "../ReferralCard";

export function Cta({
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
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  };
  return (
    <section
      id="join"
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        minHeight: "82vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(64px,10vw,128px) clamp(20px,5vw,40px)",
      }}
    >
      {/* Conic reprise: the second and final color bloom, earned by restraint. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-25%",
          zIndex: 0,
          pointerEvents: "none",
          filter: "blur(80px)",
          opacity: 0.5,
          animation: "spinSlow 50s linear infinite",
          background:
            "conic-gradient(from 140deg at 50% 50%, rgba(124,92,255,0.30), rgba(35,213,224,0.22), rgba(91,233,185,0.18), rgba(255,158,122,0.24), rgba(124,92,255,0.30))",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 55%, #08090A 100%)",
        }}
      />

      <div
        className="glass"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 720,
          borderRadius: 24,
          padding: "clamp(36px,6vw,72px)",
          textAlign: "center",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.10), 0 30px 120px rgba(124,92,255,0.20)",
        }}
      >
        <div style={{ ...mono, color: t.muted, marginBottom: 18 }}>
          Early access
        </div>
        <h2
          style={{
            fontFamily: t.displayFont,
            fontWeight: 800,
            fontSize: "clamp(34px,6vw,72px)",
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
            margin: "0 0 16px",
            color: t.fg,
            textWrap: "balance",
          }}
        >
          Stay consistent on X
          <br />
          <span className="iris-text">without it becoming a second job.</span>
        </h2>
        <p
          style={{
            fontFamily: t.uiFont,
            fontSize: "clamp(15px,1.5vw,17px)",
            lineHeight: 1.6,
            color: t.muted,
            margin: "0 auto 26px",
            maxWidth: 460,
          }}
        >
          Join the waitlist for early access. Ten minutes a day, your voice,
          your call on every post.
        </p>
        <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "left" }}>
          {!signup ? (
            <SignupForm t={t} onSuccess={setSignup} />
          ) : (
            <ReferralCard t={t} signup={signup} onDone={() => setSignup(null)} />
          )}
        </div>
        <div style={{ ...mono, fontSize: 10.5, color: t.faint, marginTop: 18 }}>
          We&apos;ll only email you about Catalyst. No spam, no list-selling,
          unsubscribe anytime.
        </div>
      </div>
    </section>
  );
}
