"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Live social proof: the real waitlist count, fetched on load. Below the reveal
// threshold the number is too small to persuade, so we show a qualitative line
// instead of a weak "3 founders". We never fabricate a number. Past the
// threshold the count animates up once on first reveal, with an explicit
// reduced-motion guard (the global CSS guard only covers CSS animations, not a
// JS-driven counter).
const REVEAL_THRESHOLD = 50;
const LOW_COUNT_LABEL = "Be one of the first in line";

export function LiveCount({
  align = "center",
  label,
  announce = true,
}: {
  align?: "center" | "start";
  // Optional lead-in (e.g. "Private beta"), folded into the same line + dot so
  // the hero shows ONE status row instead of a separate badge stacked above.
  label?: string;
  // The same count renders in the hero and the CTA; only one should own the
  // screen-reader live region so the number isn't announced twice.
  announce?: boolean;
}) {
  const [count, setCount] = useState<number | null>(null);
  const [display, setDisplay] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/waitlist/count")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (alive && body && typeof body.count === "number") setCount(body.count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (count === null || count < REVEAL_THRESHOLD || animated.current) return;
    animated.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(count);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 850;
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setDisplay(Math.round(count * ease(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count]);

  const showNumber = count !== null && count >= REVEAL_THRESHOLD;
  // Visible "proof" segment. With a label (the hero), keep the row compact and
  // centered: the label alone carries it until there's a real number worth
  // showing. Without a label (the CTA, which has more room), show the scarcity
  // line as the fallback.
  const proof = showNumber
    ? `${display.toLocaleString()} in line`
    : label
      ? null
      : LOW_COUNT_LABEL;
  // Screen readers always hear the full status once (and not every interpolated
  // count-up frame), even when the visible row is trimmed to just the label.
  const announcedProof = showNumber
    ? `${count.toLocaleString()} already in line`
    : LOW_COUNT_LABEL;
  const announced =
    count === null ? "" : label ? `${label}. ${announcedProof}` : announcedProof;

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-[0.08em]",
        align === "start" && "justify-start",
      )}
    >
      <span
        aria-hidden
        className="status-dot animate-[dotPulse_2.4s_ease-in-out_infinite] text-live"
      />
      {label && (
        <span aria-hidden className="uppercase tracking-[0.16em] text-faint">
          {label}
        </span>
      )}
      {proof && (
        <span aria-hidden className="text-muted-foreground">
          {label && <span className="text-muted-foreground/40">· </span>}
          {proof}
        </span>
      )}
      {announce && (
        <span className="sr-only" aria-live="polite">
          {announced}
        </span>
      )}
    </div>
  );
}
