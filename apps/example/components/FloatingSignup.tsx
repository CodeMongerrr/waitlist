"use client";

import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { SignupForm } from "./SignupForm";
import { ReferralCard } from "./ReferralCard";

// Wraps the signup flow in a 3D-floating glass box. Email is required; the X
// handle stays optional inside SignupForm. After success the
// ReferralCard replaces the form in the same floating box, so the card never
// jumps. Styling lives in globals.css (.float-scene / .float-bob / .float-card)
// and uses only existing monochrome tokens.
export function FloatingSignup({
  t,
  signup,
  setSignup,
}: {
  t: Theme;
  signup: Signup | null;
  setSignup: (s: Signup | null) => void;
}) {
  return (
    <div className="float-scene">
      <div className="float-bob">
        <div className="float-card">
          {!signup ? (
            <>
              <div className="float-eyebrow">Join the waitlist</div>
              <SignupForm t={t} onSuccess={setSignup} />
            </>
          ) : (
            <ReferralCard t={t} signup={signup} onDone={() => setSignup(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
