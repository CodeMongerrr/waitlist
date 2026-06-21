import type { Theme } from "@/lib/theme";
import type { SeedSignup } from "@/lib/helpers";

type Props = {
  t: Theme;
  signups: SeedSignup[];
  currentEmail?: string;
};

export function LeaderboardPreview({ t, signups, currentEmail }: Props) {
  const top = [...signups].sort((a, b) => b.refs - a.refs).slice(0, 5);

  return (
    <div style={{ fontFamily: t.uiFont }}>
      {top.map((s, i) => {
        const me = s.email === currentEmail;
        return (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom:
                i < top.length - 1 ? `1px solid ${t.border}` : "none",
              background: me ? t.highlight : "transparent",
              marginLeft: me ? -10 : 0,
              marginRight: me ? -10 : 0,
              paddingLeft: me ? 10 : 0,
              paddingRight: me ? 10 : 0,
              borderRadius: me ? t.radius : 0,
            }}
          >
            <span
              style={{
                width: 22,
                fontFamily: t.monoFont,
                fontSize: 12,
                color: t.muted,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ flex: 1, fontSize: 13.5, color: t.fg }}>
              {s.name}
              {me ? " · you" : ""}
            </span>
            <span
              style={{
                fontSize: 12,
                color: t.muted,
                fontFamily: t.monoFont,
              }}
            >
              {s.refs} ref{s.refs === 1 ? "" : "s"}
            </span>
            <span
              style={{
                fontSize: 11.5,
                color: t.accent,
                fontFamily: t.monoFont,
                width: 40,
                textAlign: "right",
              }}
            >
              ↑{s.refs * 3}
            </span>
          </div>
        );
      })}
    </div>
  );
}
