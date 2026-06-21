import type { Theme } from "@/lib/theme";

const STEPS = [
  {
    n: "01",
    title: "Harvest",
    body: "Catalyst watches the internet for what's worth posting about in your niche — releases, threads, the conversations your audience already cares about.",
    accent: false,
  },
  {
    n: "02",
    title: "Write it in your voice",
    body: "Every draft comes from a voice profile built on 5–50 of your best tweets. Not a generic high-engagement voice. Yours.",
    accent: false,
  },
  {
    n: "03",
    title: "You approve",
    body: "Drafts wait in your dashboard. Approve, edit, or reject in under ten minutes a day. Nothing posts without a click — every single time.",
    accent: true,
  },
  {
    n: "04",
    title: "It posts, and learns",
    body: "Approved posts ship on schedule. Catalyst learns from what lands and gets sharper over time.",
    accent: false,
  },
];

export function HowItWorks({ t }: { t: Theme }) {
  return (
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "clamp(56px,8vw,104px) 24px",
      }}
    >
      <div style={{ marginBottom: 40, maxWidth: 660 }}>
        <div
          style={{
            fontFamily: t.monoFont,
            fontSize: 11.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: t.accent,
            marginBottom: 14,
          }}
        >
          How it works
        </div>
        <h2
          style={{
            fontFamily: t.uiFont,
            fontSize: "clamp(26px,3.4vw,38px)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            fontWeight: 700,
            margin: 0,
            color: t.fg,
            textWrap: "balance",
          }}
        >
          A loop that keeps you consistent, so you don&apos;t have to
          white-knuckle it.
        </h2>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {STEPS.map((s) => (
          <div
            key={s.n}
            style={{
              flex: "1 1 220px",
              minWidth: 0,
              padding: 22,
              background: t.bgAlt,
              border: `1px solid ${s.accent ? t.accent : t.border}`,
              borderRadius: t.modalRadius,
            }}
          >
            <div
              style={{
                fontFamily: t.monoFont,
                fontSize: 12,
                color: s.accent ? t.accent : t.muted,
                marginBottom: 14,
              }}
            >
              {s.n}
            </div>
            <div
              style={{
                fontFamily: t.uiFont,
                fontSize: 17,
                fontWeight: 600,
                color: t.fg,
                marginBottom: 8,
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
            {s.accent && (
              <div
                style={{
                  marginTop: 14,
                  fontFamily: t.monoFont,
                  fontSize: 10.5,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: t.accent,
                }}
              >
                the control gate
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
