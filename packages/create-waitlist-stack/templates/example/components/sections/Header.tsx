import type { Theme } from "@/lib/theme";

export function Header({ t }: { t: Theme }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "32px 0 0",
        borderBottom: `1px solid ${t.border}`,
        paddingBottom: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <span
          style={{
            fontFamily: t.monoFont,
            fontSize: 13,
            fontWeight: 600,
            color: t.fg,
            letterSpacing: "-0.01em",
          }}
        >
          waitlist-stack
        </span>
        <span style={{ fontFamily: t.monoFont, fontSize: 11, color: t.muted }}>
          v0.4.0
        </span>
        <span
          style={{
            fontFamily: t.monoFont,
            fontSize: 11,
            color: t.muted,
            padding: "2px 6px",
            border: `1px solid ${t.border}`,
            borderRadius: 3,
          }}
        >
          npm create waitlist-stack
        </span>
      </div>
      <nav
        style={{
          display: "flex",
          gap: 22,
          fontFamily: t.monoFont,
          fontSize: 11,
          alignItems: "center",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        <a
          style={{ color: t.muted, textDecoration: "none" }}
          href="https://github.com/Giri-Aayush/waitlist-stack#readme"
          target="_blank"
          rel="noopener noreferrer"
        >
          ./docs
        </a>
        <a
          style={{ color: t.muted, textDecoration: "none" }}
          href="https://github.com/Giri-Aayush/waitlist-stack/tree/main/packages"
          target="_blank"
          rel="noopener noreferrer"
        >
          ./packages
        </a>
        <a
          style={{ color: t.muted, textDecoration: "none" }}
          href="https://github.com/Giri-Aayush/waitlist-stack/releases"
          target="_blank"
          rel="noopener noreferrer"
        >
          ./changelog
        </a>
        <a
          href="https://github.com/Giri-Aayush/waitlist-stack"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "6px 12px",
            background: t.fg,
            color: t.bg,
            textDecoration: "none",
            fontWeight: 500,
            borderRadius: 3,
            letterSpacing: "0.04em",
          }}
        >
          ★ STAR REPO
        </a>
      </nav>
    </header>
  );
}
