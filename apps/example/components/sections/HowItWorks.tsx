"use client";

import { useState } from "react";
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
  bright?: boolean;
};

export function HowItWorks({ t }: { t: Theme }) {
  const stages: Stage[] = [
    {
      n: "01",
      tag: "Harvest",
      title: "It reads what you'd read",
      color: t.accentCyan,
      next: t.accent,
      annot: "scans your niche",
      body: "Catalyst tracks the releases, threads, and arguments in your corner of crypto, AI, and devtools, the same sources you'd open if you had the time. Every draft starts from something real and current.",
    },
    {
      n: "02",
      tag: "Draft",
      title: (
        <>
          It writes{" "}
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
      bright: true,
      body: "Open the dashboard, read the queue, ship what's good, kill what isn't. Roughly ten minutes. The decision is always a human one.",
    },
    {
      n: "04",
      tag: "Learn",
      title: "It posts on your call, then sharpens",
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
        {stages.map((s, i) => (
          <div
            key={s.n}
            className="audit-row reveal"
            data-reveal
            style={{ padding: "clamp(28px,4vw,46px) 0", animationDelay: `${i * 70}ms` }}
          >
            {/* col 1: giant numeral (gutter, hidden on mobile) */}
            <div className="rail-gutter" style={{ position: "relative", textAlign: "right", paddingRight: 4 }}>
              <span
                className="stroke-num"
                aria-hidden
                style={{
                  fontFamily: t.displayFont,
                  fontWeight: 800,
                  fontSize: "clamp(52px,7vw,100px)",
                  lineHeight: 0.85,
                  display: "block",
                  ...(s.bright
                    ? { WebkitTextStroke: `1px ${t.accentMint}`, color: "rgba(255,255,255,0.10)" }
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
                  width: s.bright ? 22 : 14,
                  height: s.bright ? 22 : 14,
                  borderRadius: 99,
                  border: `1.5px solid ${s.color}`,
                  background: "#08090a",
                  boxShadow: s.bright
                    ? `0 0 28px ${t.accentMint}, 0 0 60px rgba(255,255,255,0.45)`
                    : `0 0 16px ${s.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...(s.bright ? { animation: "dotPulse 2.4s ease-in-out infinite" } : {}),
                }}
              >
                <span style={{ width: 4, height: 4, borderRadius: 99, background: s.color }} />
              </div>
            </div>

            {/* col 3: content */}
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
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
                  ...(s.bright ? { paddingLeft: 12, borderLeft: `2px solid ${t.accentMint}` } : {}),
                }}
              >
                {s.title}
              </div>
              <div style={{ fontFamily: t.uiFont, fontSize: 14, lineHeight: 1.6, color: t.muted, maxWidth: "52ch" }}>
                {s.body}
              </div>
              {s.bright && (
                <>
                  <div style={{ ...mono, fontSize: 10.5, color: t.accentMint, marginTop: 2 }}>
                    You approve every post · ~10 min/day
                  </div>
                  <div style={{ maxWidth: 340, marginTop: 10 }}>
                    <MiniDraft t={t} />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...mono, fontSize: 11, color: t.faint, marginTop: 28, textAlign: "center" }}>
        ↺ The loop only moves when you say go
      </div>
    </section>
  );
}

const DRAFTS = [
  "the underrated skill in shipping fast: deleting the feature you were most excited to build.",
  "spent the morning deleting code. net negative 400 lines, net positive product. the best kind of progress.",
  "the hardest part of going solo isn't the work. it's deciding, every day, what not to do.",
  "your roadmap is a list of guesses. ship the smallest one and let the replies tell you which was right.",
];

type Flash = null | "approved" | "skipped" | "edited";

function MiniDraft({ t }: { t: Theme }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(DRAFTS[0]);
  const [editing, setEditing] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [approved, setApproved] = useState(0);
  const [busy, setBusy] = useState(false);

  const advance = (action: Exclude<Flash, null>) => {
    if (busy) return;
    setBusy(true);
    setEditing(false);
    setFlash(action);
    if (action !== "skipped") setApproved((n) => n + 1);
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

  const flashLabel =
    flash === "skipped" ? "Skipped" : flash === "edited" ? "Edited · queued" : "Approved · queued";
  const flashColor = flash === "skipped" ? t.muted : t.accentMint;

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
                boxShadow: flash === "skipped" ? "none" : `0 0 14px ${t.accentMint}`,
              }}
            >
              {flash === "skipped" ? "×" : "✓"}
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

        {editing ? (
          <textarea
            className="md-edit"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              resize: "none",
              fontFamily: t.uiFont,
              fontSize: 12.5,
              lineHeight: 1.5,
              color: t.fg,
              background: "rgba(0,0,0,0.35)",
              border: `1px solid ${t.accentMint}`,
              borderRadius: 8,
              padding: "8px 10px",
              marginBottom: 10,
            }}
          />
        ) : (
          <div style={{ fontFamily: t.uiFont, fontSize: 12.5, lineHeight: 1.5, color: t.fg, marginBottom: 10, minHeight: 54 }}>
            {text}
          </div>
        )}

        <div style={{ display: "flex", gap: 6 }}>
          {editing ? (
            <>
              <button type="button" className="md-btn" style={btn(t.accentMint, true)} onClick={() => advance("edited")}>
                Save
              </button>
              <button type="button" className="md-btn" style={btn(t.fg)} onClick={() => setEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" className="md-btn" style={btn(t.accentMint, true)} onClick={() => advance("approved")}>
                Approve
              </button>
              <button type="button" className="md-btn" style={btn(t.fg)} onClick={() => setEditing(true)}>
                Edit
              </button>
              <button type="button" className="md-btn" style={btn(t.fg)} onClick={() => advance("skipped")}>
                Skip
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ fontFamily: t.monoFont, fontSize: 10, letterSpacing: "0.06em", color: t.faint, marginTop: 9 }}>
        {approved > 0 ? `${approved} approved here · go on, it's a demo` : "Try it · approve, edit, or skip"}
      </div>
    </div>
  );
}
