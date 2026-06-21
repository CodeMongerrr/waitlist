import type { Theme } from "@/lib/theme";

export function Footer({ t }: { t: Theme }) {
  const mono: React.CSSProperties = {
    fontFamily: t.monoFont,
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  };
  const colHead: React.CSSProperties = { ...mono, color: t.faint, marginBottom: 14 };
  const link: React.CSSProperties = {
    display: "block",
    fontFamily: t.uiFont,
    fontSize: 13.5,
    color: t.muted,
    textDecoration: "none",
    marginBottom: 9,
  };

  return (
    <footer style={{ position: "relative", background: t.bgAlt, overflow: "hidden" }}>
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, rgba(124,92,255,0) 0%, rgba(124,92,255,0.42) 16%, rgba(35,213,224,0.42) 50%, rgba(255,158,122,0.42) 84%, rgba(255,158,122,0) 100%)",
        }}
      />
      {/* Ghosted brutalist watermark bleeding off the bottom. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-4%",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: t.displayFont,
          fontWeight: 800,
          fontSize: "24vw",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: "rgba(244,244,245,0.045)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        Catalyst
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(48px,8vw,96px) clamp(20px,5vw,72px) 0",
          display: "flex",
          flexWrap: "wrap",
          gap: 40,
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: "1 1 300px", maxWidth: 440 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                background: "linear-gradient(135deg,#7C5CFF,#23D5E0 55%,#FF9E7A)",
                boxShadow: "0 0 18px rgba(124,92,255,0.5)",
              }}
            />
            <span
              style={{
                fontFamily: t.displayFont,
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: "-0.02em",
                color: t.fg,
              }}
            >
              Catalyst
            </span>
          </div>
          <div style={{ ...mono, color: t.muted, marginBottom: 12 }}>
            Consistency on X, in your voice, on your call
          </div>
          <div style={{ fontFamily: t.uiFont, fontSize: 13.5, lineHeight: 1.6, color: t.muted, maxWidth: 360 }}>
            Catalyst drafts and schedules your X posts in your voice. You approve
            every one. Nothing posts without your click.
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 48 }}>
          <div>
            <div style={colHead}>Product</div>
            <a href="#how" style={link}>How it works</a>
            <a href="#control" style={link}>Control</a>
            <a href="#join" style={link}>Join the waitlist</a>
          </div>
          <div>
            <div style={colHead}>Catalyst</div>
            <span style={{ ...link, color: t.faint }}>X only</span>
            <span style={{ ...link, color: t.faint }}>Human-approved</span>
            <span style={{ ...link, color: t.faint }}>Private beta</span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          margin: "48px auto 0",
          padding: "22px clamp(20px,5vw,72px)",
          borderTop: `1px solid ${t.border}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          ...mono,
          fontSize: 10.5,
          color: t.faint,
        }}
      >
        <span>© 2026 Catalyst · X only · Human-approved</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            borderRadius: 999,
            border: `1px solid ${t.border}`,
            color: t.muted,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: t.accentMint,
              boxShadow: `0 0 10px ${t.accentMint}`,
              animation: "dotPulse 2s infinite",
            }}
          />
          Private waitlist open
        </span>
        <span>Built for people who&apos;d rather build than post</span>
      </div>
    </footer>
  );
}
