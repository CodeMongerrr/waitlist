"use client";

import type { Signup } from "@/lib/helpers";
import { FloatingSignup } from "../FloatingSignup";
import { LiveCount } from "../LiveCount";

export function Cta({
  signup,
  setSignup,
}: {
  signup: Signup | null;
  setSignup: (s: Signup | null) => void;
}) {
  return (
    <section
      id="join"
      className="relative scroll-mt-[68px] overflow-hidden border-t border-border px-5 py-[clamp(72px,11vw,150px)] sm:px-8 lg:px-[72px]"
    >
      {/* faint depth, monochrome */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(60%_70%_at_50%_30%,rgba(255,255,255,0.05),transparent_70%)]"
      />
      <div className="relative z-[1] mx-auto max-w-[720px] text-center">
        <div className="mb-[18px] font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          Early access
        </div>
        <h2 className="m-0 mb-[18px] text-[clamp(34px,6vw,72px)] font-extrabold leading-[0.98] tracking-[-0.04em] text-balance text-foreground">
          Stay consistent on X{" "}
          <span className="iris-text">without it becoming a second job.</span>
        </h2>
        <p className="mx-auto mb-8 max-w-[480px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-muted-foreground">
          Catalyst does the reading and the first draft. You keep your voice,
          your judgment, and your final say.
        </p>
        <div className="mb-5">
          <LiveCount announce={false} />
        </div>
        <div className="mx-auto max-w-[560px]">
          <FloatingSignup signup={signup} setSignup={setSignup} />
        </div>
      </div>
    </section>
  );
}
