import type { Theme } from "@/lib/theme";

export function LeftRail({ t }: { t: Theme }) {
  return (
    <aside
      style={{
        borderRight: `1px solid ${t.border}`,
        padding: "32px 16px",
        fontFamily: t.monoFont,
        fontSize: 10.5,
        color: t.muted,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        position: "relative",
      }}
    >
      <div
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          position: "absolute",
          top: 32,
          left: 12,
          color: t.fg,
          fontWeight: 600,
        }}
      >
        §0.4.0 — TECHNICAL OVERVIEW
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 16,
          transform: "rotate(-90deg)",
          transformOrigin: "left bottom",
          whiteSpace: "nowrap",
        }}
      >
        MIT · 2026 · ./README.md
      </div>
    </aside>
  );
}
