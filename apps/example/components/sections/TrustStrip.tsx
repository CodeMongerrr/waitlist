import type { Theme } from "@/lib/theme";

const POINTS = [
  {
    title: "Nothing posts without your approval",
    body: 'Every post waits for a human click. No auto-posting. No "approved by default after N hours." The approval gate is the point.',
  },
  {
    title: "Your voice, not a bot voice",
    body: "Calibrated on 5–50 of your own best tweets. Catalyst amplifies how you already write — it doesn't replace it with slop.",
  },
  {
    title: "Your account stays yours",
    body: "You bring your own X credentials, encrypted at rest. Your reputation is the asset, and we treat it that way.",
  },
];

export function TrustStrip({ t }: { t: Theme }) {
  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
      <div
        style={{
          border: `1px solid ${t.border}`,
          borderRadius: t.modalRadius,
          background: t.bgAlt,
          padding: "clamp(28px,4vw,44px)",
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        {POINTS.map((p) => (
          <div key={p.title} style={{ flex: "1 1 240px", minWidth: 0 }}>
            <div
              style={{
                fontFamily: t.uiFont,
                fontSize: 16,
                fontWeight: 600,
                color: t.fg,
                marginBottom: 10,
                display: "flex",
                gap: 9,
                alignItems: "flex-start",
              }}
            >
              <span style={{ color: t.accent, lineHeight: 1.4 }}>—</span>
              {p.title}
            </div>
            <div
              style={{
                fontFamily: t.uiFont,
                fontSize: 13.5,
                lineHeight: 1.6,
                color: t.muted,
              }}
            >
              {p.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
