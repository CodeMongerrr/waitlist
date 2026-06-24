"use client";

import { useCallback, useState } from "react";
import type { Signup } from "@/lib/helpers";
import { useReferralPosition } from "@/lib/use-referral-position";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { HowItWorks } from "./sections/HowItWorks";
import { TrustStrip } from "./sections/TrustStrip";
import { Marquee } from "./sections/Marquee";
import { Faq } from "./sections/Faq";
import { Cta } from "./sections/Cta";
import { Footer } from "./sections/Footer";

// Single-scroll landing rendered as one client island. The hero form and the
// final CTA share one signup so submitting either flips both to the referral
// card; useReferralPosition keeps the queue position and referral count live.
//
// Note on architecture: an RSC split (server page + per-section client islands)
// was measured and *increased* First Load JS by ~64 kB here, because the static
// sections are small while the interactive islands dominate, so fragmenting the
// client module graph cost more than the static sections saved. One cohesive
// client island chunks more efficiently for this page shape.
export function CatalystLanding() {
  const [signup, setSignup] = useState<Signup | null>(null);

  const onLivePosition = useCallback(
    (next: { position: number; referralCount: number; jumpsPerReferral: number }) => {
      setSignup((prev) =>
        prev
          ? {
              ...prev,
              position: next.position,
              referralCount: next.referralCount,
              jumpsPerReferral: next.jumpsPerReferral,
            }
          : prev,
      );
    },
    [],
  );
  useReferralPosition(signup?.code, onLivePosition);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grain" aria-hidden />
      <Header />
      <main>
        <Hero signup={signup} setSignup={setSignup} />
        <HowItWorks />
        <TrustStrip />
        <Marquee />
        <Faq />
        <Cta signup={signup} setSignup={setSignup} />
      </main>
      <Footer />
      <Toaster position="bottom-center" />
    </div>
  );
}
