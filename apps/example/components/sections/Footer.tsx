import type { Theme } from "@/lib/theme";

export function Footer({ t }: { t: Theme }) {
  return (
    <footer style={{ borderTop: `1px solid ${t.border}` }}>
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "28px 24px",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: t.uiFont,
            fontWeight: 700,
            fontSize: 16,
            color: t.fg,
          }}
        >
          Catalyst<span style={{ color: t.accent }}>.</span>
        </div>
        <div style={{ fontFamily: t.uiFont, fontSize: 12.5, color: t.muted }}>
          X only. No auto-posting, ever. Your voice, your approval.
        </div>
        <div style={{ fontFamily: t.monoFont, fontSize: 11.5, color: t.muted }}>
          © 2026 Catalyst
        </div>
      </div>
    </footer>
  );
}
