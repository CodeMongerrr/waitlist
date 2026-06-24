import * as React from "react";
import { cn } from "@/lib/utils";

// Shared shell + heading for the content sections (HowItWorks, TrustStrip, Faq),
// so the max-width, gutters, vertical rhythm, and H2 type scale live in one place
// instead of being copy-pasted per section. Bespoke sections (Hero, Cta, Footer)
// keep their own <section> but reuse the same gutters/max-width by hand.
export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("section-shell", className)} {...props}>
      {children}
    </section>
  );
}

export function SectionHeading({
  className,
  children,
  reveal = true,
  ...props
}: React.ComponentProps<"h2"> & { reveal?: boolean }) {
  return (
    <h2
      className={cn("section-h2 mb-[clamp(20px,3vw,40px)]", reveal && "reveal", className)}
      {...props}
    >
      {children}
    </h2>
  );
}
