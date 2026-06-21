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

// Single-scroll Catalyst landing. One signup state is shared between the hero
// form and the final CTA, so submitting either flips both to the referral
// success card. useReferralPosition polls /api/waitlist/me/{code} to keep the
// displayed queue position live as referrals land.
export function CatalystLanding() {
  const [signup, setSignup] = useState<Signup | null>(null);

  const onLivePosition = useCallback((next: { position: number }) => {
    setSignup((prev) => (prev ? { ...prev, position: next.position } : prev));
  }, []);
  useReferralPosition(signup?.code, onLivePosition);

  return (
    <div id="top" style={{ background: t.bg, color: t.fg, minHeight: "100vh" }}>
      <Header t={t} />
      <main>
        <Hero t={t} signup={signup} setSignup={setSignup} />
        <HowItWorks t={t} />
        <TrustStrip t={t} />
        <Cta t={t} signup={signup} setSignup={setSignup} />
      </main>
      <Footer t={t} />
    </div>
  );
}
