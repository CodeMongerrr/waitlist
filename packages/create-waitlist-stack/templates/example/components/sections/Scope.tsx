import type { Theme } from "@/lib/theme";
import { PaperHead } from "../PaperHead";

const INCLUDED = [
  "Signup form, validation, anti-spam",
  "Referral engine + leaderboard",
  "React Email + Resend webhooks",
  "Edge-cached OG images",
  "Admin dashboard + CSV export",
  "llms.txt + JSON-LD structured data",
  "Landing page reference (this one)",
];

const EXCLUDED = [
  "Not a CRM. Export to your own tools.",
  "Not multi-tenant. One waitlist per deploy.",
  "Not a no-code tool. You will edit TS.",
  "Not free at scale. ~$5–20/mo past 3K.",
  "Not a payment system. Wire Stripe.",
  "Not battle-tested at million-user scale.",
];

export function Scope({ t }: { t: Theme }) {
  return (
    <>
      <PaperHead t={t} num="§7.0" kicker="Scope" title="What's in. What's out." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <Card t={t} label="+ included" color={t.success} items={INCLUDED} bold />
        <Card t={t} label="− out of scope" color={t.danger} items={EXCLUDED} />
      </div>
    </>
  );
}

function Card({
  t,
  label,
  color,
  items,
  bold,
}: {
  t: Theme;
  label: string;
  color: string;
  items: string[];
  bold?: boolean;
}) {
  return (
    <div
      style={{
        padding: 28,
        border: `1px solid ${t.border}`,
        borderRadius: t.radius,
        background: t.bg,
      }}
    >
      <div
        style={{
          fontFamily: t.monoFont,
          fontSize: 11,
          color,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {label}
      </div>
      {items.map((s) => (
        <div
          key={s}
          style={{
            padding: "8px 0",
            fontFamily: t.serifFont,
            fontSize: 16,
            color: bold ? t.fg : t.muted,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          {s}
        </div>
      ))}
    </div>
  );
}
