import type { Theme } from "@/lib/theme";

// Spec-sheet "markings": a [ NN ] index row (index / label / aside) over a
// full-bleed iridescent hairline carrying a centered file-tag chip. Applied to
// every section so the page reads as one filed engineering artifact.
export function SectionMark({
  t,
  index,
  label,
  aside,
  fileTag,
}: {
  t: Theme;
  index: string;
  label: string;
  aside: string;
  fileTag: string;
}) {
  const mono: React.CSSProperties = {
    fontFamily: t.monoFont,
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: t.faint,
  };
  return (
    <div style={{ marginBottom: 36 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          ...mono,
        }}
      >
        <span style={{ color: t.muted }}>[ {index} ]</span>
        <span style={{ color: t.muted }}>{label}</span>
        <span>{aside}</span>
      </div>
      <div
        style={{
          position: "relative",
          height: 1,
          marginTop: 14,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 22%, rgba(255,255,255,0.16) 78%, rgba(255,255,255,0) 100%)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            background: t.bg,
            padding: "0 14px",
            whiteSpace: "nowrap",
            ...mono,
          }}
        >
          {fileTag}
        </span>
      </div>
    </div>
  );
}
