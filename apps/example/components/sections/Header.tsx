import type { Theme } from "@/lib/theme";

export function Header({ t }: { t: Theme }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        className="reveal"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          height: 68,
          padding: "0 clamp(20px,5vw,48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <a
          href="#top"
          style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: t.fg,
              color: t.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: t.displayFont,
              fontWeight: 800,
              fontSize: 17,
              lineHeight: 1,
            }}
          >
            c
          </span>
          <span
            style={{
              fontFamily: t.displayFont,
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: "-0.01em",
              color: t.fg,
            }}
          >
            Catalyst
          </span>
        </a>

        <span
          style={{
            fontFamily: t.monoFont,
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: t.faint,
          }}
        >
          Private beta
        </span>
      </div>
    </header>
  );
}
