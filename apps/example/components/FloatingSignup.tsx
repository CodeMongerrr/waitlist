"use client";

import type { Signup } from "@/lib/helpers";
import { SignupForm } from "./SignupForm";
import { ReferralCard } from "./ReferralCard";

// Wraps the signup flow in a 3D-floating glass box (email-only). After success
// the ReferralCard replaces the form in the same floating box, so the card never
// jumps. Styling lives in globals.css (.float-scene / .float-bob / .float-card).
export function FloatingSignup({
  signup,
  setSignup,
}: {
  signup: Signup | null;
  setSignup: (s: Signup | null) => void;
}) {
  return (
    <div className="float-scene">
      <div className="float-bob">
        <div className="float-card">
          {!signup ? (
            <>
              <div className="mb-4 text-left">
                <div className="text-[17px] font-semibold tracking-[-0.01em] text-foreground">
                  Get early access
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Join the Catalyst private beta and claim your spot in the queue.
                </p>
              </div>
              <SignupForm onSuccess={setSignup} />
            </>
          ) : (
            <ReferralCard signup={signup} onDone={() => setSignup(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
