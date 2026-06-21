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
  return (
    <section
      id="join"
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "clamp(64px,9vw,120px) 24px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: t.uiFont,
            fontSize: "clamp(28px,3.6vw,42px)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            fontWeight: 700,
            margin: "0 0 16px",
            color: t.fg,
            textWrap: "balance",
          }}
        >
          Get consistent on X. Keep your voice. Keep control.
        </h2>
        <p
          style={{
            fontFamily: t.uiFont,
            fontSize: "clamp(15px,1.5vw,17px)",
            lineHeight: 1.6,
            color: t.muted,
            margin: "0 auto",
            maxWidth: 520,
          }}
        >
          Join the waitlist and you get a spot in line plus a referral link.
          Every friend who joins with it moves you up 5 spots.
        </p>
      </div>
      <div
        style={{
          maxWidth: 420,
          margin: "0 auto",
          background: t.bgAlt,
          border: `1px solid ${t.border}`,
          borderRadius: t.modalRadius,
          padding: 24,
        }}
      >
        {!signup ? (
          <SignupForm t={t} onSuccess={setSignup} />
        ) : (
          <ReferralCard t={t} signup={signup} onDone={() => setSignup(null)} />
        )}
      </div>
    </section>
  );
}
