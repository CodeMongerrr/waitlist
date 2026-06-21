"use client";

import { useEffect, useRef, useState } from "react";
import type { Theme } from "@/lib/theme";
import { SectionMark } from "./SectionMark";

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

export function HowItWorks({ t }: { t: Theme }) {
  const stages: Stage[] = [
    {
      n: "01",
      tag: "Harvest",
      title: "Reads what you'd read",
      color: t.accentCyan,
      next: t.accent,
      annot: "scans your niche",
      body: "Catalyst tracks the releases, threads, and arguments in your corner of crypto, AI, and devtools across Reddit, Hacker News, Google News, and X, the same sources you'd open if you had the time. Every draft starts from something real and current.",
    },
    {
      n: "02",
      tag: "Draft",
      title: (
        <>
          Writes{" "}
          <span style={{ fontFamily: t.serifFont, fontStyle: "italic", fontWeight: 400, color: "rgba(244,244,245,0.55)" }}>
            in your voice
          </span>
        </>
      ),
      color: t.accent,
      next: t.accentMint,
      annot: "from your past posts",
      body: "Catalyst drafts from how you actually write: your phrasing, your takes, your restraint. It amplifies your voice. It does not swap it for a generic high-engagement one. This is not an AI tweet generator.",
    },
    {
      n: "03",
      tag: "Approve",
      title: "You approve, or you don't",
      color: t.accentMint,
      next: t.accentPeach,
      demo: true,
      body: "Open the dashboard, read the queue, ship what's good, kill what isn't. The decision is always a human one.",
    },
    {
      n: "04",
      tag: "Learn",
      title: "Posts on your call, then sharpens",
      color: t.accentPeach,
      next: "transparent",
      annot: "ships on schedule",
      body: "Approved drafts post on schedule. Your edits are the training: what you approve, change, and reject tightens your voice, so the queue needs less from you each week, not more.",
    },
  ];

  const mono: React.CSSProperties = {
    fontFamily: t.monoFont,
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  };

  // The highlight rides the scroll: whichever stage sits nearest the viewport
  // center becomes "active" and lights up (glow behind the numeral, enlarged
  // node, lit title, dimmed siblings). Defaults to 03 so the no-JS render keeps
  // the demo-anchored stage emphasized.
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
    <section
      id="how"
      style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(72px,10vw,128px) clamp(20px,5vw,72px)" }}
    >
      <SectionMark t={t} index="01" label="How it works" aside="Loop" fileTag="· catalyst.loop ·" />

      <h2
        className="reveal"
        data-reveal
        style={{
          fontFamily: t.displayFont,
          fontWeight: 700,
          fontSize: "clamp(28px,5vw,52px)",
          lineHeight: 1.04,
          letterSpacing: "-0.025em",
          margin: "0 0 clamp(24px,4vw,48px)",
          color: t.fg,
          textWrap: "balance",
          maxWidth: 760,
        }}
      >
        A loop you can audit, end to end.
      </h2>

      <div style={{ position: "relative" }}>
        {stages.map((s, i) => {
          const active = i === activeIndex;
          return (
          <div
            key={s.n}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            className="audit-row reveal"
            data-reveal
            style={{ padding: "clamp(28px,4vw,46px) 0", animationDelay: `${i * 70}ms` }}
          >
            {/* col 1: giant numeral (gutter, hidden on mobile) */}
            <div className="rail-gutter" style={{ position: "relative", textAlign: "right", paddingRight: 4 }}>
              {/* wide glow that rides the active numeral */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  right: -20,
                  top: "50%",
                  width: 210,
                  height: 210,
                  transform: `translateY(-50%) scale(${active ? 1 : 0.7})`,
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.18), rgba(255,255,255,0.06) 36%, transparent 70%)",
                  opacity: active ? 1 : 0,
                  filter: "blur(4px)",
                  pointerEvents: "none",
                  transition: "opacity 0.55s ease, transform 0.55s ease",
                  zIndex: 0,
                }}
              />
              <span
                className="stroke-num"
                aria-hidden
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontFamily: t.displayFont,
                  fontWeight: 800,
                  fontSize: "clamp(52px,7vw,100px)",
                  lineHeight: 0.85,
                  display: "block",
                  transformOrigin: "right center",
                  transform: active ? "scale(1.06)" : "scale(1)",
                  transition: "transform 0.55s cubic-bezier(0.16,0.84,0.3,1), color 0.4s ease",
                  ...(active
                    ? { WebkitTextStroke: `1px ${t.accentMint}`, color: "rgba(255,255,255,0.12)" }
                    : {}),
                }}
              >
                {s.n}
              </span>
            </div>

            {/* col 2: spine segment + node */}
            <div style={{ position: "relative", alignSelf: "stretch", zIndex: 1 }}>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: 0,
                  bottom: 0,
                  width: 2,
                  overflow: "hidden",
                  background: `linear-gradient(180deg, ${s.color}, ${s.next})`,
                  boxShadow: "0 0 12px rgba(255,255,255,0.18)",
                  opacity: 0.9,
                }}
              >
                <i
                  style={{
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    height: "32%",
                    background:
                      "linear-gradient(180deg, transparent, rgba(255,255,255,0.85), transparent)",
                    animation: "spineFlow 5s linear infinite",
                    animationDelay: `${i * 0.6}s`,
                  }}
                />
              </div>
              {/* node */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 4,
                  transform: "translateX(-50%)",
                  width: active ? 22 : 14,
                  height: active ? 22 : 14,
                  borderRadius: 99,
                  border: `1.5px solid ${active ? t.accentMint : s.color}`,
                  background: "#08090a",
                  boxShadow: active
                    ? `0 0 28px ${t.accentMint}, 0 0 60px rgba(255,255,255,0.45)`
                    : `0 0 16px ${s.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition:
                    "width 0.45s cubic-bezier(0.16,0.84,0.3,1), height 0.45s cubic-bezier(0.16,0.84,0.3,1), box-shadow 0.45s ease, border-color 0.4s ease",
                  ...(active ? { animation: "dotPulse 2.4s ease-in-out infinite" } : {}),
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 99,
                    background: active ? t.accentMint : s.color,
                    transition: "background 0.4s ease",
                  }}
                />
              </div>
            </div>

            {/* col 3: content (dims when this stage is not the active one) */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                opacity: active ? 1 : 0.5,
                transition: "opacity 0.5s ease",
              }}
            >
              <div style={{ ...mono, color: t.muted, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{s.n} / {s.tag}</span>
                {s.annot && <span style={{ color: t.faint, letterSpacing: "0.06em" }}>· {s.annot}</span>}
              </div>
              <div
                style={{
                  fontFamily: t.displayFont,
                  fontSize: "clamp(20px,2.6vw,27px)",
                  fontWeight: 600,
                  letterSpacing: "-0.015em",
                  color: t.fg,
                  lineHeight: 1.12,
                  paddingLeft: active ? 12 : 0,
                  borderLeft: `2px solid ${active ? t.accentMint : "transparent"}`,
                  transition: "padding-left 0.45s cubic-bezier(0.16,0.84,0.3,1), border-color 0.4s ease",
                }}
              >
                {s.title}
              </div>
              <div style={{ fontFamily: t.uiFont, fontSize: 14, lineHeight: 1.6, color: t.muted, maxWidth: "52ch" }}>
                {s.body}
              </div>
              {s.demo && (
                <>
                  <div style={{ ...mono, fontSize: 10.5, color: t.accentMint, marginTop: 2 }}>
                    You approve every post · ~10 min/day
                  </div>
                  <div style={{ maxWidth: 340, marginTop: 12, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ ...mono, fontSize: 10, color: t.faint, marginBottom: 8 }}>
                        A real draft Catalyst wrote for a devtools founder this week
                      </div>
                      <StaticDraft t={t} />
                    </div>
                    <MiniDraft t={t} />
                  </div>
                </>
              )}
            </div>
          </div>
          );
        })}
      </div>

      <div style={{ ...mono, fontSize: 11, color: t.faint, marginTop: 28, textAlign: "center" }}>
        ↺ The loop only moves when you say go
      </div>
    </section>
  );
}

const EXAMPLE_DRAFT =
  "watched a senior eng spend an hour fighting our setup script today. that hour is the most honest user research we've done all quarter. fixing it before we ship anything new.";

// Static, always-visible sample so visitors who never click the interactive
// card still see what a draft looks like. Same chrome as MiniDraft, no buttons.
function StaticDraft({ t }: { t: Theme }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${t.border}`,
        background: "rgba(0,0,0,0.28)",
        padding: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: 99, background: "linear-gradient(135deg,#3a3a3c,#6e6e74)" }} />
        <span style={{ fontFamily: t.uiFont, fontSize: 12, fontWeight: 600, color: t.fg }}>You</span>
        <span style={{ fontFamily: t.monoFont, fontSize: 11, color: t.faint }}>@yourhandle</span>
      </div>
      <div style={{ fontFamily: t.uiFont, fontSize: 12.5, lineHeight: 1.5, color: t.fg }}>
        {EXAMPLE_DRAFT}
      </div>
    </div>
  );
}

const DRAFTS = [
  "the underrated skill in shipping fast: deleting the feature you were most excited to build.",
  "spent the morning deleting code. net negative 400 lines, net positive product. the best kind of progress.",
  "the hardest part of going solo isn't the work. it's deciding, every day, what not to do.",
  "your roadmap is a list of guesses. ship the smallest one and let the replies tell you which was right.",
];

type Flash = null | "approved" | "rejected";

function MiniDraft({ t }: { t: Theme }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(DRAFTS[0]);
  const [flash, setFlash] = useState<Flash>(null);
  const [approved, setApproved] = useState(0);
  const [busy, setBusy] = useState(false);

  const advance = (action: Exclude<Flash, null>) => {
    if (busy) return;
    setBusy(true);
    setFlash(action);
    if (action !== "rejected") setApproved((n) => n + 1);
    setTimeout(() => {
      const ni = (index + 1) % DRAFTS.length;
      setIndex(ni);
      setText(DRAFTS[ni]);
      setFlash(null);
      setBusy(false);
    }, 820);
  };

  const btn = (color: string, solid?: boolean): React.CSSProperties => ({
    flex: 1,
    fontFamily: t.monoFont,
    fontSize: 10.5,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "8px 4px",
    borderRadius: 7,
    border: `1px solid ${solid ? color : t.border}`,
    background: solid ? color : "transparent",
    color: solid ? "#04130d" : t.muted,
    textAlign: "center",
  });

  const flashLabel = flash === "rejected" ? "Rejected" : "Approved · queued";
  const flashColor = flash === "rejected" ? t.muted : t.accentMint;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        border: `1px solid ${t.border}`,
        background: "rgba(0,0,0,0.28)",
        padding: 12,
      }}
    >
      {flash && (
        <div
          className="md-flash"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(8,9,10,0.74)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: t.monoFont,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: flashColor,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 99,
                border: `1.5px solid ${flashColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                boxShadow: flash === "rejected" ? "none" : `0 0 14px ${t.accentMint}`,
              }}
            >
              {flash === "rejected" ? "×" : "✓"}
            </span>
            {flashLabel}
          </span>
        </div>
      )}

      <div key={index} className="md-enter">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: 99, background: "linear-gradient(135deg,#3a3a3c,#6e6e74)" }} />
          <span style={{ fontFamily: t.uiFont, fontSize: 12, fontWeight: 600, color: t.fg }}>You</span>
          <span style={{ fontFamily: t.monoFont, fontSize: 11, color: t.faint }}>@yourhandle</span>
          <span style={{ marginLeft: "auto", fontFamily: t.monoFont, fontSize: 10.5, color: t.faint }}>
            {index + 1}/{DRAFTS.length}
          </span>
        </div>

        <div style={{ fontFamily: t.uiFont, fontSize: 12.5, lineHeight: 1.5, color: t.fg, marginBottom: 10, minHeight: 54 }}>
          {text}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" className="md-btn" style={btn(t.accentMint, true)} onClick={() => advance("approved")}>
            Approve
          </button>
          <button type="button" className="md-btn" style={btn(t.fg)} onClick={() => advance("rejected")}>
            Reject
          </button>
        </div>
      </div>

      <div style={{ fontFamily: t.monoFont, fontSize: 10, letterSpacing: "0.06em", color: t.faint, marginTop: 9 }}>
        {approved > 0 ? `${approved} approved here · go on, it's a demo` : "Try it · approve or reject"}
      </div>
    </div>
  );
}
