import type { Theme } from "@/lib/theme";
import { SectionMark } from "./SectionMark";

type Stage = {
  n: string;
  tag: string;
  title: React.ReactNode;
  body: React.ReactNode;
  dot: string;
  bright?: boolean;
};

export function HowItWorks({ t }: { t: Theme }) {
  const stages: Stage[] = [
    {
      n: "01",
      tag: "Harvest",
      title: "Harvest",
      dot: t.accentCyan,
      body: "Agents scan your niche on X — what's landing, what's noise — and surface the threads worth your take.",
    },
    {
      n: "02",
      tag: "Write",
      title: (
        <>
          Written{" "}
          <span style={{ fontFamily: t.serifFont, fontStyle: "italic", fontWeight: 400, color: "#C0A6FF" }}>
            in your voice
          </span>
        </>
      ),
      dot: t.accent,
      body: "Drafts are built from your past posts and notes — matched to your phrasing, structure, and takes. Not generic AI filler.",
    },
    {
      n: "03",
      tag: "You approve",
      title: "You approve",
      dot: t.accentMint,
      bright: true,
      body: "Every draft lands in a review queue. Edit, approve, or kill it. Nothing reaches X until you click. About ten minutes a day.",
    },
    {
      n: "04",
      tag: "Posts & learns",
      title: "Posts & learns",
      dot: t.accentPeach,
      body: "Approved posts ship on schedule. The system learns from what resonates and tightens the next round.",
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
          fontSize: "clamp(30px,5vw,56px)",
          lineHeight: 1.02,
          letterSpacing: "-0.025em",
          margin: "0 0 40px",
          color: t.fg,
          textWrap: "balance",
          maxWidth: 720,
        }}
      >
        A loop you can audit.
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "stretch" }}>
        {stages.map((s, i) => (
          <div
            key={s.n}
            className="reveal"
            data-reveal
            style={{
              flex: "1 1 240px",
              minWidth: 0,
              position: "relative",
              animationDelay: `${i * 70}ms`,
            }}
          >
            {s.bright && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: -36,
                  zIndex: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(120% 120% at 50% 0%, rgba(91,233,185,0.24) 0%, rgba(124,92,255,0.12) 45%, transparent 72%)",
                  filter: "blur(12px)",
                }}
              />
            )}
            <div
              className={s.bright ? undefined : "glass"}
              style={{
                position: "relative",
                zIndex: 1,
                height: "100%",
                borderRadius: 16,
                padding: 22,
                overflow: "hidden",
                ...(s.bright
                  ? {
                      background:
                        "linear-gradient(180deg, rgba(91,233,185,0.08), rgba(255,255,255,0.02))",
                      border: `1px solid ${t.accentMint}`,
                      boxShadow:
                        "0 0 44px rgba(91,233,185,0.22), inset 0 1px 0 rgba(255,255,255,0.12)",
                      backdropFilter: "blur(14px) saturate(130%)",
                      WebkitBackdropFilter: "blur(14px) saturate(130%)",
                    }
                  : {}),
              }}
            >
              <span
                className="stroke-num"
                aria-hidden
                style={{
                  position: "absolute",
                  top: -10,
                  right: 10,
                  fontFamily: t.displayFont,
                  fontWeight: 800,
                  fontSize: 64,
                  lineHeight: 1,
                  ...(s.bright ? { WebkitTextStroke: `1px ${t.accentMint}`, opacity: 0.5 } : {}),
                }}
              >
                {s.n}
              </span>

              <div
                style={{
                  ...mono,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: t.muted,
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 99,
                    background: s.dot,
                    boxShadow: `0 0 10px ${s.dot}`,
                  }}
                />
                {s.n} / {s.tag}
              </div>

              <div
                style={{
                  fontFamily: t.displayFont,
                  fontSize: 21,
                  fontWeight: 600,
                  color: t.fg,
                  letterSpacing: "-0.01em",
                  marginBottom: 10,
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontFamily: t.uiFont,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: t.muted,
                }}
              >
                {s.body}
              </div>

              {s.bright && <MiniDraft t={t} />}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          ...mono,
          fontSize: 11,
          color: t.faint,
          marginTop: 28,
          textAlign: "center",
        }}
      >
        ◆ The loop only moves when you say go ◆
      </div>
    </section>
  );
}

function MiniDraft({ t }: { t: Theme }) {
  const btn = (label: string, color: string, solid?: boolean): React.CSSProperties => ({
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
        marginTop: 16,
        borderRadius: 12,
        border: `1px solid ${t.border}`,
        background: "rgba(0,0,0,0.28)",
        padding: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 99,
            background: "linear-gradient(135deg,#7C5CFF,#23D5E0)",
          }}
        />
        <span style={{ fontFamily: t.uiFont, fontSize: 12, fontWeight: 600, color: t.fg }}>
          You
        </span>
        <span style={{ fontFamily: t.monoFont, fontSize: 11, color: t.faint }}>
          @yourhandle
        </span>
      </div>
      <div
        style={{
          fontFamily: t.uiFont,
          fontSize: 12.5,
          lineHeight: 1.5,
          color: t.fg,
          marginBottom: 10,
        }}
      >
        the underrated skill in shipping fast: deleting the feature you were
        most excited to build.
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <span style={btn("Approve", t.accentMint, true)}>Approve</span>
        <span style={btn("Edit", t.fg)}>Edit</span>
        <span style={btn("Skip", t.fg)}>Skip</span>
      </div>
    </div>
  );
}
