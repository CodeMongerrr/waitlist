import type { Theme } from "@/lib/theme";

export function Header({ t }: { t: Theme }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(8,9,10,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "13px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="#top"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            fontFamily: t.uiFont,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: "-0.02em",
            color: t.fg,
          }}
        >
          Catalyst<span style={{ color: t.accent }}>.</span>
        </a>
        <a
          href="#join"
          style={{
            padding: "9px 16px",
            background: t.btnBg,
            color: t.btnFg,
            border: `1px solid ${t.btnBorder}`,
            borderRadius: t.radius,
            textDecoration: "none",
            fontFamily: t.uiFont,
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          Join the waitlist
        </a>
      </div>
    </header>
  );
}
