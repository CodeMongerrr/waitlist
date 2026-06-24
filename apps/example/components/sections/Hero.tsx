"use client";

import type { Signup } from "@/lib/helpers";
import { FloatingSignup } from "../FloatingSignup";
import { LiveCount } from "../LiveCount";

export function Hero({
  signup,
  setSignup,
}: {
  signup: Signup | null;
  setSignup: (s: Signup | null) => void;
}) {
  return (
    <section
      id="top"
      className="relative flex flex-col overflow-hidden sm:min-h-[100svh]"
    >
      <div className="hero-grid" />
      {/* Monochrome spotlight: a soft column of light behind the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 z-0 h-[620px] w-[820px] max-w-[120vw] -translate-x-1/2 bg-[radial-gradient(50%_50%_at_50%_30%,rgba(255,255,255,0.07),transparent_72%)]"
      />

      <div className="relative z-[1] mx-auto flex w-full max-w-[1180px] flex-1 flex-col items-center justify-start px-5 pb-16 pt-4 text-center sm:justify-center sm:px-8 sm:py-24 lg:px-[72px]">
        {/* One status row: stage + live proof on a single line with one green dot. */}
        <div className="reveal mb-4 sm:mb-9" style={{ animationDelay: "80ms" }}>
          <LiveCount label="Private beta" />
        </div>

        {/* Two tiers via weight and tone, one type size: the claim (bold, with
            the differentiator "yourself" emphasized) over a quieter qualifier. */}
        <h1
          className="reveal m-0 max-w-[960px] text-balance font-extrabold tracking-[-0.035em] text-foreground"
          style={{ animationDelay: "160ms" }}
        >
          <span className="block text-[clamp(30px,5vw,54px)] leading-[1.05]">
            Sound like{" "}
            <span className="hero-gradient-word bg-gradient-to-b from-white to-white/45 bg-clip-text text-transparent">
              yourself
            </span>{" "}
            on X
          </span>
          <span className="mt-2 block bg-gradient-to-b from-white/70 to-white/35 bg-clip-text text-transparent text-[clamp(30px,5vw,54px)] font-semibold leading-[1.1] tracking-[-0.02em] sm:mt-3">
            even on the days you can&apos;t write.
          </span>
        </h1>

        <p
          className="reveal mx-auto mt-6 max-w-[600px] text-[clamp(16px,1.7vw,20px)] leading-relaxed text-muted-foreground sm:mt-8"
          style={{ animationDelay: "280ms" }}
        >
          Catalyst drafts posts{" "}
          <span className="italic text-foreground">in your voice</span> from
          what&apos;s actually happening. You approve the good ones in ten
          minutes a day.
        </p>

        <div
          className="reveal mt-6 w-full max-w-[560px] sm:mt-12"
          style={{ animationDelay: "400ms" }}
        >
          <FloatingSignup signup={signup} setSignup={setSignup} />
        </div>
      </div>
    </section>
  );
}
