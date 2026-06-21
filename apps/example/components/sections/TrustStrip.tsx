import type { Theme } from "@/lib/theme";
import { SectionMark } from "./SectionMark";

const HAIRLINE =
  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 22%, rgba(255,255,255,0.16) 78%, rgba(255,255,255,0) 100%)";

export function TrustStrip({ t }: { t: Theme }) {
  const mono: React.CSSProperties = {
    fontFamily: t.monoFont,
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  };

  const clauses = [
    {
      no: "01",
      marker: "In control",
      dot: t.accentMint,
      statement: (
        <>
          You approve{" "}
          <span style={{ fontFamily: t.serifFont, fontStyle: "italic", fontWeight: 400, color: t.fg }}>
            every post
          </span>
        </>
      ),
      sub: "No auto-post mode, no silent timer. Drafts wait in your queue until you say go. Approve what's good, skip the rest, on your schedule.",
      bright: true,
    },
    {
      no: "02",
      marker: "In your voice",
      dot: t.accent,
      statement: (
        <>
          Amplifies you,{" "}
          <span style={{ fontFamily: t.serifFont, fontStyle: "italic", fontWeight: 400, color: t.fg }}>
            never replaces you
          </span>
        </>
      ),
      sub: "The point is to sound like you on a day you can't write, not like an AI tweet generator chasing numbers. If a draft doesn't sound like you, reject it, and it learns.",
    },
    {
      no: "03",
      marker: "Scoped on purpose",
      dot: t.accentCyan,
      statement: (
        <>
          <span style={{ fontFamily: t.serifFont, fontStyle: "italic", fontWeight: 400, color: t.fg }}>
            One platform
          </span>
          , done right
        </>
      ),
      sub: "One platform, done seriously. No LinkedIn cross-posting, no follower promises, no virality theater. Just consistent posts you'd put your name on.",
    },
  ];

  const sigTokens = [
    { t: "Built for X", c: t.accentCyan },
  ];

  return (
    <section
      id="control"
      style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(72px,10vw,128px) clamp(20px,5vw,72px)" }}
    >
      <SectionMark t={t} index="02" label="You are in control" aside="Control" fileTag="· catalyst.control ·" />

      <h2
        className="reveal"
        data-reveal
        style={{
          fontFamily: t.displayFont,
          fontWeight: 700,
          fontSize: "clamp(28px,5vw,52px)",
          lineHeight: 1.04,
          letterSpacing: "-0.025em",
          margin: "0 0 clamp(20px,3vw,40px)",
          color: t.fg,
          textWrap: "balance",
          maxWidth: 760,
        }}
      >
        Built for people who guard their account.
      </h2>

      <div>
        {clauses.map((c, i) => (
          <div
            key={c.no}
            className="reveal"
            data-reveal
            style={{ position: "relative", animationDelay: `${i * 80}ms` }}
          >
            {c.bright && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(60% 100% at 14% 0%, rgba(255,255,255,0.07), transparent 60%)",
                }}
              />
            )}
            <div
              style={{
                height: 1,
                background: c.bright ? "rgba(255,255,255,0.4)" : HAIRLINE,
              }}
            />
            <div className="clause" style={{ position: "relative", zIndex: 1, padding: "clamp(28px,4.5vw,48px) 0" }}>
              <div style={{ ...mono, color: t.muted, display: "flex", alignItems: "center", gap: 9 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 99,
                    background: c.dot,
                    boxShadow: `0 0 10px ${c.dot}`,
                    flex: "none",
                  }}
                />
                {c.no} · {c.marker}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: t.displayFont,
                    fontWeight: 600,
                    fontSize: "clamp(23px,3.4vw,38px)",
                    lineHeight: 1.12,
                    letterSpacing: "-0.02em",
                    color: t.fg,
                    textWrap: "balance",
                  }}
                >
                  {c.statement}
                </div>
                <div
                  style={{
                    fontFamily: t.uiFont,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: t.muted,
                    marginTop: 12,
                    maxWidth: "56ch",
                  }}
                >
                  {c.sub}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Signature line: a single honest tag, centered below the clauses. */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 18,
          borderTop: `1px solid ${t.borderStrong}`,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        {sigTokens.map((s) => (
          <span
            key={s.t}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 12px",
              borderRadius: 999,
              border: `1px solid ${t.border}`,
              background: "rgba(255,255,255,0.02)",
              ...mono,
              fontSize: 11,
              color: t.muted,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: s.c,
                boxShadow: `0 0 9px ${s.c}`,
              }}
            />
            {s.t}
          </span>
        ))}
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 26,
          fontFamily: t.uiFont,
          fontSize: "clamp(14px,1.4vw,16px)",
          color: t.muted,
          maxWidth: 680,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}
      >
        Built for solo founders, DevRel engineers, and technical creators in
        crypto, AI, and devtools. For people whose X account is pipeline, hiring,
        and reputation, not a hobby.
      </div>
      <div style={{ textAlign: "center", marginTop: 10, ...mono, fontSize: 10.5, color: t.faint }}>
        We never post without an explicit approval click · Not affiliated with X
      </div>
    </section>
  );
}
