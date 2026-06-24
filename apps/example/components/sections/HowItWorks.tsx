"use client";

import { useEffect, useRef, useState } from "react";
import { Section, SectionHeading } from "./Section";

type Stage = {
  n: string;
  tag: string;
  title: React.ReactNode;
  body: React.ReactNode;
  color: string;
  next: string;
  annot?: string;
  demo?: boolean;
};

// Monochrome rail tones, pulled from CSS tokens. The spine gradient interpolates
// between adjacent stages, so we hand the raw var() to inline styles.
const MINT = "var(--rail-1)";
const CYAN = "var(--rail-2)";
const PEACH = "var(--rail-3)";

export function HowItWorks() {
  const stages: Stage[] = [
    {
      n: "01",
      tag: "Harvest",
      title: "Reads what you'd read",
      color: CYAN,
      next: MINT,
      annot: "scans your niche",
      body: "Pulls from Reddit, Hacker News, and Google News. Drafts start from something real.",
    },
    {
      n: "02",
      tag: "Draft",
      title: (
        <>
          Writes <span className="italic font-normal text-foreground/70">in your voice</span>
        </>
      ),
      color: MINT,
      next: MINT,
      annot: "from your past posts",
      body: "Built from your phrasing and takes, never a generic high-engagement voice.",
    },
    {
      n: "03",
      tag: "Approve",
      title: "You approve, or you don't",
      color: MINT,
      next: PEACH,
      demo: true,
      body: "Read the queue, ship what's good, kill what isn't.",
    },
    {
      n: "04",
      tag: "Learn",
      title: "Posts on your call, then sharpens",
      color: PEACH,
      next: "transparent",
      annot: "ships on schedule",
      body: "Your edits train it, so it needs less from you each week.",
    },
  ];

  // The highlight rides the scroll: whichever stage sits nearest the viewport
  // center becomes "active" and lights up. Defaults to 03 so the no-JS render
  // keeps the demo-anchored stage emphasized.
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(2);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      rowRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActiveIndex((prev) => (prev === best ? prev : best));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <Section id="how">
      <SectionHeading className="mb-[clamp(24px,4vw,48px)]">
        A loop you can audit, end to end.
      </SectionHeading>

      <div className="relative">
        {stages.map((s, i) => {
          const active = i === activeIndex;
          return (
            <div
              key={s.n}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="audit-row reveal py-[clamp(24px,4vw,46px)]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {/* col 1: giant numeral (gutter, hidden on mobile) */}
              <div className="rail-gutter relative pr-1 text-right">
                <span
                  className="stroke-num relative z-[1] block origin-[right_center] text-[clamp(52px,7vw,100px)] font-extrabold leading-[0.85] transition-[transform,color] duration-500"
                  aria-hidden
                  style={{
                    transform: active ? "scale(1.06)" : "scale(1)",
                    ...(active
                      ? { WebkitTextStroke: `1px ${MINT}`, color: "rgba(255,255,255,0.12)" }
                      : {}),
                  }}
                >
                  {s.n}
                </span>
              </div>

              {/* col 2: spine segment + node */}
              <div className="relative z-[1] self-stretch">
                <div
                  aria-hidden
                  className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 overflow-hidden opacity-90 shadow-[0_0_12px_rgba(255,255,255,0.18)]"
                  style={{ background: `linear-gradient(180deg, ${s.color}, ${s.next})` }}
                >
                  <i
                    className="absolute left-0 h-[32%] w-full animate-[spineFlow_5s_linear_infinite] bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.85),transparent)]"
                    style={{ animationDelay: `${i * 0.6}s` }}
                  />
                </div>
                {/* node */}
                <div
                  aria-hidden
                  className="absolute left-1/2 top-1 flex -translate-x-1/2 items-center justify-center rounded-full bg-surface-sink transition-[width,height,box-shadow,border-color] duration-[450ms]"
                  style={{
                    width: active ? 22 : 14,
                    height: active ? 22 : 14,
                    border: `1.5px solid ${active ? MINT : s.color}`,
                    boxShadow: active
                      ? `0 0 28px ${MINT}, 0 0 60px rgba(255,255,255,0.45)`
                      : `0 0 16px ${s.color}`,
                    ...(active ? { animation: "dotPulse 2.4s ease-in-out infinite" } : {}),
                  }}
                >
                  <span
                    className="size-1 rounded-full transition-colors"
                    style={{ background: active ? MINT : s.color }}
                  />
                </div>
              </div>

              {/* col 3: content (dims when this stage is not the active one) */}
              <div
                className="relative z-[1] flex flex-col gap-2 transition-opacity duration-500"
                style={{ opacity: active ? 1 : 0.72 }}
              >
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span>
                    {s.n} / {s.tag}
                  </span>
                  {s.annot && (
                    <span className="tracking-[0.06em] text-faint">· {s.annot}</span>
                  )}
                </div>
                <div
                  className="text-[clamp(20px,2.6vw,27px)] font-semibold leading-[1.12] tracking-[-0.015em] text-foreground transition-[padding-left,border-color] duration-[450ms]"
                  style={{
                    paddingLeft: active ? 12 : 0,
                    borderLeft: `2px solid ${active ? MINT : "transparent"}`,
                  }}
                >
                  {s.title}
                </div>
                <div className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </div>
                {s.demo && (
                  <>
                    <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-foreground">
                      Your call, every time · ~10 min/day
                    </div>
                    <div className="mt-3 max-w-[340px]">
                      <MiniDraft />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

const DRAFTS = [
  "the underrated skill in shipping fast: deleting the feature you were most excited to build.",
  "spent the morning deleting code. net negative 400 lines, net positive product. the best kind of progress.",
  "the hardest part of going solo isn't the work. it's deciding, every day, what not to do.",
  "your roadmap is a list of guesses. ship the smallest one and let the replies tell you which was right.",
];

type Flash = null | "approved" | "rejected";

function MiniDraft() {
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<Flash>(null);
  const [approved, setApproved] = useState(0);
  const [busy, setBusy] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  // The shown draft is derived from `index`; no separate text state to keep in sync.
  const text = DRAFTS[index];

  const advance = (action: Exclude<Flash, null>) => {
    if (busy) return;
    setBusy(true);
    setFlash(action);
    if (action !== "rejected") setApproved((n) => n + 1);
    advanceTimer.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % DRAFTS.length);
      setFlash(null);
      setBusy(false);
    }, 820);
  };

  const flashLabel = flash === "rejected" ? "Rejected" : "Approved · queued";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-black/30 p-3">
      {flash && (
        <div
          role="status"
          className="md-flash absolute inset-0 z-[2] flex items-center justify-center bg-surface-sink/[0.74] backdrop-blur-[2px]"
        >
          <span
            className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] ${
              flash === "rejected" ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex size-[18px] items-center justify-center rounded-full border text-[11px] ${
                flash === "rejected"
                  ? "border-muted-foreground"
                  : "border-foreground shadow-[0_0_14px_#ffffff]"
              }`}
            >
              {flash === "rejected" ? "×" : "✓"}
            </span>
            {flashLabel}
          </span>
        </div>
      )}

      <div key={index} className="md-enter">
        <div className="mb-2 flex items-center gap-2">
          <span className="size-[22px] rounded-full bg-[linear-gradient(135deg,#3a3a3c,#6e6e74)]" />
          <span className="text-xs font-semibold text-foreground">You</span>
          <span className="font-mono text-[11px] text-faint">@yourhandle</span>
          <span className="ml-auto font-mono text-[10.5px] text-faint">
            {index + 1}/{DRAFTS.length}
          </span>
        </div>

        <div className="mb-2.5 min-h-[54px] text-[12.5px] leading-normal text-foreground">
          {text}
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            className="md-btn flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-foreground bg-foreground px-2 py-3 text-center font-mono text-[10.5px] uppercase tracking-[0.06em] text-background sm:min-h-0 sm:py-2"
            onClick={() => advance("approved")}
          >
            Approve
          </button>
          <button
            type="button"
            className="md-btn flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-border bg-transparent px-2 py-3 text-center font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground sm:min-h-0 sm:py-2"
            onClick={() => advance("rejected")}
          >
            Reject
          </button>
        </div>
      </div>

      <div role="status" className="mt-2.5 font-mono text-[10px] tracking-[0.06em] text-faint">
        {approved > 0 ? `${approved} approved here · go on, it's a demo` : "Try it · approve or reject"}
      </div>
    </div>
  );
}
