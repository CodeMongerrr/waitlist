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
      body: "Agents track the releases, threads, and arguments in your corner of crypto, AI, and devtools — the same sources you'd open if you had the time. Every draft starts from something real and current.",
    },
    {
      n: "02",
      tag: "Draft",
      title: (
        <>
          It writes{" "}
          <span style={{ fontFamily: t.serifFont, fontStyle: "italic", fontWeight: 400, color: "#C0A6FF" }}>
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
      body: "Approved drafts post on schedule. Your edits become the training — what you approve, change, and reject tightens your voice, so the queue needs less from you, not more.",
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
      <SectionMark t={t} index="01" label="How it works" aside="Loop" fileTag="— catalyst.loop —" />

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
            {/* bright-row halo (un-boxed light pool) */}
            {s.bright && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "-10% -4%",
                  zIndex: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(70% 130% at 12% 50%, rgba(91,233,185,0.16), rgba(124,92,255,0.08) 42%, transparent 64%)",
                  filter: "blur(14px)",
                }}
              />
            )}

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
                    ? { WebkitTextStroke: `1px ${t.accentMint}`, color: "rgba(91,233,185,0.10)" }
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
                  boxShadow: "0 0 12px rgba(124,92,255,0.22)",
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
                    ? `0 0 28px ${t.accentMint}, 0 0 60px rgba(91,233,185,0.5)`
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
                    Nothing posts until you click · ~10 min/day
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

function MiniDraft({ t }: { t: Theme }) {
  const btn = (color: string, solid?: boolean): React.CSSProperties => ({
    flex: 1,
    fontFamily: t.monoFont,
    fontSize: 10.5,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "7px 4px",
    borderRadius: 7,
    border: `1px solid ${solid ? color : t.border}`,
    background: solid ? color : "transparent",
    color: solid ? "#04130d" : t.muted,
    textAlign: "center",
  });
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
        <span style={{ width: 22, height: 22, borderRadius: 99, background: "linear-gradient(135deg,#7C5CFF,#23D5E0)" }} />
        <span style={{ fontFamily: t.uiFont, fontSize: 12, fontWeight: 600, color: t.fg }}>You</span>
        <span style={{ fontFamily: t.monoFont, fontSize: 11, color: t.faint }}>@yourhandle</span>
      </div>
      <div style={{ fontFamily: t.uiFont, fontSize: 12.5, lineHeight: 1.5, color: t.fg, marginBottom: 10 }}>
        the underrated skill in shipping fast: deleting the feature you were most
        excited to build.
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <span style={btn(t.accentMint, true)}>Approve</span>
        <span style={btn(t.fg)}>Edit</span>
        <span style={btn(t.fg)}>Skip</span>
      </div>
    </div>
  );
}
