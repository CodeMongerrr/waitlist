import type { Theme } from "@/lib/theme";

export function Footer({ t }: { t: Theme }) {
  return (
    <footer
      style={{
        padding: "40px 0 60px",
        borderTop: `1px solid ${t.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: t.monoFont,
        fontSize: 11,
        color: t.muted,
        letterSpacing: "0.04em",
      }}
    >
      <span>WAITLIST-STACK · MIT · 2026</span>
      <span>BUILT FOR SOLO FOUNDERS · NOT MULTI-TENANT</span>
    </footer>
  );
}
