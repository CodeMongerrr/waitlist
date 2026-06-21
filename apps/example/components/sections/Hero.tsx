"use client";

import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { FloatingSignup } from "../FloatingSignup";

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
      id="top"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div className="hero-grid" />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "96px clamp(20px,5vw,48px) 72px",
        }}
      >
        {/* status badge */}
        <div
          className="reveal"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "7px 14px",
            borderRadius: 999,
            border: `1px solid ${t.border}`,
            background: "rgba(255,255,255,0.02)",
            fontFamily: t.monoFont,
            fontSize: 11.5,
            letterSpacing: "0.08em",
            color: t.muted,
            marginBottom: "clamp(28px,4vw,44px)",
            animationDelay: "60ms",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              background: t.live,
              boxShadow: `0 0 10px ${t.live}`,
              animation: "dotPulse 2.4s ease-in-out infinite",
            }}
          />
          Now in private beta · v0.4
        </div>

        <h1
          className="reveal"
          style={{
            fontFamily: t.displayFont,
            fontWeight: 800,
            fontSize: "clamp(48px,11vw,132px)",
            lineHeight: 0.94,
            letterSpacing: "-0.045em",
            margin: 0,
            color: t.fg,
            textWrap: "balance",
            maxWidth: 1000,
            animationDelay: "160ms",
          }}
        >
          Grow on X <span className="iris-text">without</span> the full-time job.
        </h1>

        <p
          className="reveal"
          style={{
            fontFamily: t.uiFont,
            fontSize: "clamp(16px,1.7vw,20px)",
            lineHeight: 1.6,
            color: t.muted,
            margin: "clamp(24px,3vw,36px) 0 0",
            maxWidth: 660,
            animationDelay: "280ms",
          }}
        >
          Catalyst reads your niche, drafts posts{" "}
          <span style={{ fontStyle: "italic", color: t.fg }}>in your voice</span>,
          and lines them up for you. Spend ten minutes a day approving the good
          ones. Every post waits for your call.
        </p>

        <div
          className="reveal"
          style={{ width: "100%", maxWidth: 560, marginTop: "clamp(32px,4vw,52px)", animationDelay: "400ms" }}
        >
          <FloatingSignup t={t} signup={signup} setSignup={setSignup} />
        </div>
      </div>
    </section>
  );
}
