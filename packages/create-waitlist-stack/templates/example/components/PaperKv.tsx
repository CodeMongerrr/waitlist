import type { Theme } from "@/lib/theme";

type Props = {
  t: Theme;
  k: string;
  v: string;
  last?: boolean;
};

export function PaperKv({ t, k, v, last }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "8px 0",
        borderBottom: last ? "none" : `1px dotted ${t.border}`,
        fontFamily: t.monoFont,
        fontSize: 12,
      }}
    >
      <span style={{ color: t.muted }}>{k}</span>
      <span style={{ color: t.fg, fontWeight: 500 }}>{v}</span>
    </div>
  );
}
