import type { Theme } from "@/lib/theme";
import { SectionMark } from "./SectionMark";

export function TrustStrip({ t }: { t: Theme }) {
  const cards = [
    {
      eyebrow: "In control",
      dot: t.accentMint,
      title: "You are the only thing that publishes",
      body: "Catalyst drafts and queues. You click. No auto-post, no set-and-forget, no “approved by default after N hours.”",
    },
    {
      eyebrow: "In your voice",
      dot: t.accent,
      title: "Trained on you, not a template",
      body: "It learns from your existing posts, so drafts read like your account on a good day. Not a generic high-engagement bot voice.",
    },
    {
      eyebrow: "Scoped on purpose",
      dot: t.accentCyan,
      title: "X only. One job, done well",
      body: "No cross-posting sprawl, no follower promises. Just consistency in your voice, without the daily time sink.",
    },
  ];
  const mono: React.CSSProperties = {
    fontFamily: t.monoFont,
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  };

  return (
    <section
      id="control"
      style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(72px,10vw,128px) clamp(20px,5vw,72px)" }}
    >
      <SectionMark t={t} index="02" label="You are in control" aside="Control" fileTag="— catalyst.control —" />

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
          maxWidth: 760,
        }}
      >
        Built for people who guard their account.
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {cards.map((c, i) => (
          <div
            key={c.eyebrow}
            className="glass reveal"
            data-reveal
            style={{
              flex: "1 1 260px",
              minWidth: 0,
              borderRadius: 16,
              padding: 24,
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div style={{ ...mono, display: "flex", alignItems: "center", gap: 8, color: t.muted, marginBottom: 16 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: c.dot,
                  boxShadow: `0 0 10px ${c.dot}`,
                }}
              />
              {c.eyebrow}
            </div>
            <div
              style={{
                fontFamily: t.displayFont,
                fontSize: 20,
                fontWeight: 600,
                color: t.fg,
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
                marginBottom: 10,
              }}
            >
              {c.title}
            </div>
            <div style={{ fontFamily: t.uiFont, fontSize: 13.5, lineHeight: 1.6, color: t.muted }}>
              {c.body}
            </div>
          </div>
        ))}
      </div>

      {/* Reassurance bar: honest anti-claims build trust with skeptics. */}
      <div
        style={{
          marginTop: 16,
          borderRadius: 14,
          border: `1px solid ${t.border}`,
          background: "rgba(255,255,255,0.02)",
          borderTop: `1px solid ${t.borderStrong}`,
          padding: "16px 20px",
          textAlign: "center",
          ...mono,
          fontSize: 11,
          color: t.muted,
        }}
      >
        No auto-posting · No follower guarantees · X only · Human-approved
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 28,
          fontFamily: t.uiFont,
          fontSize: "clamp(14px,1.4vw,16px)",
          color: t.muted,
        }}
      >
        Built for solo founders, DevRel, and technical creators in crypto, AI,
        and devtools.
      </div>
      <div style={{ textAlign: "center", marginTop: 8, ...mono, fontSize: 10.5, color: t.faint }}>
        Currently a private waitlist · No pricing yet · You&apos;re early
      </div>
    </section>
  );
}
