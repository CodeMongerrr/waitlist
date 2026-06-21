import type { Theme } from "@/lib/theme";

type Props = {
  t: Theme;
  name?: string;
  position?: number;
  code?: string;
  theme?: "light" | "dark";
};

export function OgPreview({
  t,
  name,
  position,
  code,
  theme = "light",
}: Props) {
  const W = 1200;
  const H = 630;
  const dark = theme === "dark";
  const bg = dark ? "#1a1816" : "#faf8f3";
  const fg = dark ? "#f5f0e6" : "#1a1816";
  const sub = dark ? "rgba(245,240,230,0.55)" : "rgba(26,24,22,0.55)";
  const accent = t.accent;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        borderRadius: t.radius,
        border: `1px solid ${t.border}`,
      }}
    >
      <rect width={W} height={H} fill={bg} />
      <g opacity="0.06" stroke={fg}>
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1={(i + 1) * 100}
            y1="0"
            x2={(i + 1) * 100}
            y2={H}
            strokeWidth="1"
          />
        ))}
      </g>
      <text
        x="80"
        y="120"
        fontFamily="Inter, sans-serif"
        fontSize="22"
        fontWeight="600"
        fill={accent}
        letterSpacing="2"
      >
        WAITLIST-STACK
      </text>
      <text
        x="80"
        y="270"
        fontFamily="Source Serif 4, serif"
        fontSize="100"
        fontWeight="500"
        letterSpacing="-3"
        fill={fg}
      >
        {name || "Your name"}
      </text>
      <text
        x="80"
        y="370"
        fontFamily="Source Serif 4, serif"
        fontSize="64"
        fontWeight="400"
        fill={sub}
        fontStyle="italic"
      >
        is #{(position || 1247).toLocaleString()} in line.
      </text>
      <line x1="80" y1="470" x2="1120" y2="470" stroke={fg} strokeOpacity="0.15" />
      <text
        x="80"
        y="540"
        fontFamily="JetBrains Mono, monospace"
        fontSize="22"
        fill={sub}
      >
        waitlist.example/r/{code || "XXXXXXXXXX"}
      </text>
      <text
        x="1120"
        y="540"
        textAnchor="end"
        fontFamily="JetBrains Mono, monospace"
        fontSize="22"
        fill={sub}
      >
        cached · edge-served
      </text>
    </svg>
  );
}
