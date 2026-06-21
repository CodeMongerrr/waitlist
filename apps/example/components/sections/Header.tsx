import type { Theme } from "@/lib/theme";

export function Header({ t }: { t: Theme }) {
  const mono: React.CSSProperties = {
    fontFamily: t.monoFont,
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  };
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(8,9,10,0.66)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          height: 64,
          padding: "0 clamp(20px,5vw,72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <a
          href="#top"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 6,
              background:
                "linear-gradient(135deg,#7C5CFF,#23D5E0 55%,#FF9E7A)",
              boxShadow: "0 0 18px rgba(124,92,255,0.5)",
            }}
          />
          <span
            style={{
              fontFamily: t.displayFont,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.02em",
              color: t.fg,
            }}
          >
            Catalyst
          </span>
        </a>

        <nav className="hide-sm" style={{ display: "flex", gap: 22 }}>
          {[
            { l: "how it works", h: "#how" },
            { l: "control", h: "#control" },
            { l: "join", h: "#join" },
          ].map((x) => (
            <a
              key={x.h}
              href={x.h}
              style={{ ...mono, color: t.muted, textDecoration: "none" }}
            >
              [ {x.l} ]
            </a>
          ))}
        </nav>

        <a
          href="#join"
          style={{
            ...mono,
            fontSize: 11,
            color: t.fg,
            textDecoration: "none",
            padding: "8px 14px",
            borderRadius: 999,
            border: `1px solid ${t.borderStrong}`,
            background: t.accentSoft,
          }}
        >
          Join the waitlist
        </a>
      </div>
    </header>
  );
}
