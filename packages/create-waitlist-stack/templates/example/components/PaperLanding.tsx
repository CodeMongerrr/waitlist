"use client";

import { useCallback, useMemo, useState } from "react";
import { PAPER_THEME } from "@/lib/theme";
import { buildSeedSignups, type Signup } from "@/lib/helpers";
import { useReferralPosition } from "@/lib/use-referral-position";
import { LeftRail } from "./sections/LeftRail";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { Stack } from "./sections/Stack";
import { Quickstart } from "./sections/Quickstart";
import { Subsystems } from "./sections/Subsystems";
import { WorkedExample } from "./sections/WorkedExample";
import { Admin } from "./sections/Admin";
import { Scope } from "./sections/Scope";
import { Cta } from "./sections/Cta";
import { Footer } from "./sections/Footer";

const SECTION_GAP = 112;
const t = PAPER_THEME;

// Top-level composition. Each section lives in components/sections/ so
// editing one (color, copy, layout) doesn't require loading the others.
// Customizing the design? Open Claude Code, point at the section file you
// want to change, and iterate. The shared theme tokens are in lib/theme.ts.

export function PaperLanding() {
  const [signup, setSignup] = useState<Signup | null>(null);
  const seedSignups = useMemo(() => buildSeedSignups(), []);

  // After a signup, poll /api/waitlist/me/{code} to keep the displayed
  // position + the OG preview in sync as referrals land. Both ReferralCard
  // and OgPreview read from the same `signup` state, so updating it here
  // refreshes both at once.
  const onLivePosition = useCallback(
    (next: { position: number; referralCount: number }) => {
      setSignup((prev) =>
        prev
          ? { ...prev, position: next.position }
          : prev,
      );
    },
    [],
  );
  useReferralPosition(signup?.code, onLivePosition);

  return (
    <div style={{ background: t.bg, color: t.fg, minHeight: "100vh" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "120px 1fr",
        }}
      >
        <LeftRail t={t} />
        <div style={{ padding: "0 64px 0 56px" }}>
          <Header t={t} />
          <Section><Hero t={t} signup={signup} setSignup={setSignup} /></Section>
          <Section bordered><Stack t={t} /></Section>
          <Section bordered><Quickstart t={t} /></Section>
          <Section bordered><Subsystems t={t} /></Section>
          <Section bordered>
            <WorkedExample t={t} signup={signup} seedSignups={seedSignups} />
          </Section>
          <Section bordered><Admin t={t} seedSignups={seedSignups} /></Section>
          <Section bordered><Scope t={t} /></Section>
          <Section bordered><Cta t={t} /></Section>
          <Footer t={t} />
        </div>
      </div>
    </div>
  );
}

function Section({
  children,
  bordered,
}: {
  children: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <section
      style={{
        padding: `${SECTION_GAP}px 0`,
        borderTop: bordered ? `1px solid ${t.border}` : undefined,
      }}
    >
      {children}
    </section>
  );
}
