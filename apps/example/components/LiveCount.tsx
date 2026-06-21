"use client";

import { useEffect, useRef, useState } from "react";
import type { Theme } from "@/lib/theme";

// Live social proof: the real waitlist count, fetched on load. Below the reveal
// threshold the number is too small to persuade, so we show a qualitative line
// instead of a weak "3 founders". We never fabricate a number. Past the
// threshold the count animates up once on first reveal, with an explicit
// reduced-motion guard (the global CSS guard only covers CSS animations, not a
// JS-driven counter).
const REVEAL_THRESHOLD = 50;
const LOW_COUNT_LABEL = "Be one of the first founders in line";

export function LiveCount({
  t,
  align = "center",
}: {
  t: Theme;
  align?: "center" | "start";
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
  const label = showNumber
    ? `${display.toLocaleString()} founders already in line`
    : LOW_COUNT_LABEL;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: 8,
        fontFamily: t.monoFont,
        fontSize: 11.5,
        letterSpacing: "0.06em",
        color: t.faint,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 99,
          background: t.live,
          boxShadow: `0 0 9px ${t.live}`,
          flex: "none",
          animation: "dotPulse 2.4s ease-in-out infinite",
        }}
      />
      <span aria-live="polite">{label}</span>
    </div>
  );
}
