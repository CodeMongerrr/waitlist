import type { Theme } from "@/lib/theme";

export function Cta({ t }: { t: Theme }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 56,
        alignItems: "center",
      }}
    >
      <h2
        style={{
          fontFamily: t.serifFont,
          fontSize: 56,
          fontWeight: 400,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          margin: 0,
          color: t.fg,
          textWrap: "balance",
        }}
      >
        Fork it.{" "}
        <span style={{ fontStyle: "italic", color: t.accent }}>Ship it.</span>{" "}
        Sell what you build with it.
      </h2>
      <div>
        <p
          style={{
            fontFamily: t.serifFont,
            fontSize: 17,
            color: t.muted,
            margin: "0 0 22px",
            lineHeight: 1.55,
          }}
        >
          MIT-licensed. No attribution. Each subsystem publishable standalone,
          pull{" "}
          <span style={{ fontFamily: t.monoFont }}>@waitlist-stack/core</span>{" "}
          into a different project, or take the whole thing.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <a
            href="https://github.com/Giri-Aayush/waitlist-stack"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "12px 18px",
              background: t.fg,
              color: t.bg,
              border: "none",
              borderRadius: t.radius,
              cursor: "pointer",
              fontFamily: t.monoFont,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            ★ STAR ON GITHUB
          </a>
          <a
            href="https://github.com/Giri-Aayush/waitlist-stack#readme"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "12px 18px",
              background: "transparent",
              color: t.fg,
              border: `1px solid ${t.borderStrong}`,
              borderRadius: t.radius,
              cursor: "pointer",
              fontFamily: t.monoFont,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            READ DOCS →
          </a>
        </div>
      </div>
    </div>
  );
}
