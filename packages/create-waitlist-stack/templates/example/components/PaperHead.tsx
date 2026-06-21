import type { Theme } from "@/lib/theme";

type Props = {
  t: Theme;
  num: string;
  kicker: string;
  title: string;
};

export function PaperHead({ t, num, kicker, title }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr",
        gap: 24,
        marginBottom: 40,
      }}
    >
      <div
        style={{
          fontFamily: t.monoFont,
          fontSize: 10.5,
          color: t.muted,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          paddingTop: 12,
        }}
      >
        {num}
      </div>
      <div>
        <div
          style={{
            fontFamily: t.monoFont,
            fontSize: 10.5,
            color: t.accent,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {kicker}
        </div>
        <h2
          style={{
            fontFamily: t.serifFont,
            fontSize: 44,
            fontWeight: 400,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            margin: 0,
            color: t.fg,
            textWrap: "balance",
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}
