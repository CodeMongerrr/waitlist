import type { Theme } from "@/lib/theme";

type Layer = {
  id: string;
  desc: string;
  col: "a" | "b";
};

const LAYERS: Layer[] = [
  { id: "apps/example", desc: "Next.js 16 reference app you fork", col: "a" },
  { id: "@waitlist-stack/admin", desc: "Password-gated dashboard", col: "a" },
  { id: "@waitlist-stack/og", desc: "workers-og + Satori → R2 cache", col: "b" },
  { id: "@waitlist-stack/email", desc: "React Email + Resend webhooks", col: "b" },
  { id: "@waitlist-stack/core", desc: "Signup, validation, referrals", col: "a" },
  { id: "@waitlist-stack/db", desc: "D1 schema, migrations, queries", col: "b" },
  { id: "cloudflare workers", desc: "Compute · D1 · R2", col: "a" },
];

export function StackDiagram({ t }: { t: Theme }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 12,
      }}
    >
      {LAYERS.map((l, i) => (
        <div
          key={l.id}
          style={{
            gridColumn: `${i + 1} / span 1`,
            padding: "20px 14px",
            background: l.col === "a" ? t.bg : t.codeBg,
            border: `1px solid ${l.col === "a" ? t.borderStrong : t.border}`,
            borderRadius: t.radius,
            minHeight: 140,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: t.monoFont,
              fontSize: 10.5,
              color: t.accent,
              fontWeight: 600,
              lineHeight: 1.4,
              wordBreak: "break-word",
            }}
          >
            {l.id}
          </div>
          <div
            style={{
              fontFamily: t.uiFont,
              fontSize: 11,
              color: t.muted,
              lineHeight: 1.4,
              marginTop: 12,
            }}
          >
            {l.desc}
          </div>
        </div>
      ))}
    </div>
  );
}
