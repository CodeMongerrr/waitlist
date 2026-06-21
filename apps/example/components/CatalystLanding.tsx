"use client";

import { useCallback, useState } from "react";
import { THEME } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { useReferralPosition } from "@/lib/use-referral-position";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { HowItWorks } from "./sections/HowItWorks";
import { TrustStrip } from "./sections/TrustStrip";
import { Cta } from "./sections/Cta";
import { Footer } from "./sections/Footer";

const t = THEME;

// "Iridescent Spec Room" single-scroll landing. One signup state is shared
// between the hero form and the final CTA, so submitting either flips both to
// the referral success card. useReferralPosition keeps the queue position live.
export function CatalystLanding() {
  const [signup, setSignup] = useState<Signup | null>(null);

  const onLivePosition = useCallback((next: { position: number }) => {
    setSignup((prev) => (prev ? { ...prev, position: next.position } : prev));
  }, []);
  useReferralPosition(signup?.code, onLivePosition);

  return (
    <div style={{ background: t.bg, color: t.fg, minHeight: "100vh" }}>
      <div className="grain" aria-hidden />
      <Header t={t} />
      <main>
        <Hero t={t} signup={signup} setSignup={setSignup} />
        <HowItWorks t={t} />
        <TrustStrip t={t} />
        <Marquee t={t} />
        <Cta t={t} signup={signup} setSignup={setSignup} />
      </main>
      <Footer t={t} />
    </div>
  );
}

function Marquee({ t }: { t: typeof THEME }) {
  const items = [
    "Ten minutes a day",
    "Sounds like you, not a bot",
    "Nothing posts without your click",
    "No auto-post, ever",
    "X only, done seriously",
    "Researched, not hallucinated",
    "A loop you can audit",
    "Your voice, amplified",
  ];
  const Strip = () => (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {items.map((x, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
          <span
            style={{
              padding: "0 22px",
              fontFamily: t.monoFont,
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: t.muted,
            }}
          >
            {x}
          </span>
          <span style={{ color: t.accent }}>◆</span>
        </span>
      ))}
    </span>
  );
  return (
    <div
      className="marquee"
      style={{
        borderTop: `1px solid ${t.border}`,
        borderBottom: `1px solid ${t.border}`,
        padding: "16px 0",
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <div className="marquee-track">
        <Strip />
        <Strip />
      </div>
    </div>
  );
}
