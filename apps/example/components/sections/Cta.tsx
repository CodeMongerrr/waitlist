"use client";

import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { FloatingSignup } from "../FloatingSignup";

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
        position: "relative",
        overflow: "hidden",
        borderTop: `1px solid ${t.border}`,
        padding: "clamp(72px,11vw,150px) clamp(20px,5vw,48px)",
      }}
    >
      {/* faint depth, monochrome */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(60% 70% at 50% 30%, rgba(255,255,255,0.05), transparent 70%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 720,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: t.monoFont,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: t.faint,
            marginBottom: 18,
          }}
        >
          Early access
        </div>
        <h2
          style={{
            fontFamily: t.displayFont,
            fontWeight: 800,
            fontSize: "clamp(34px,6vw,72px)",
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
            margin: "0 0 18px",
            color: t.fg,
            textWrap: "balance",
          }}
        >
          Stay consistent on X{" "}
          <span className="iris-text">without it becoming a second job.</span>
        </h2>
        <p
          style={{
            fontFamily: t.uiFont,
            fontSize: "clamp(15px,1.6vw,18px)",
            lineHeight: 1.6,
            color: t.muted,
            margin: "0 auto 32px",
            maxWidth: 520,
          }}
        >
          Let Catalyst do the reading and the first draft. You keep your voice,
          your judgment, and ten minutes a day. Every post waits for your
          approval.
        </p>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <FloatingSignup t={t} signup={signup} setSignup={setSignup} />
        </div>
      </div>
    </section>
  );
}
