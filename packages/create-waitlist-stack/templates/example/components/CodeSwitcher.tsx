"use client";

import { useState } from "react";
import type { Theme } from "@/lib/theme";

type CodeTab = {
  file: string;
  lang: string;
  code: string;
};

const CODE_TABS: Record<string, CodeTab> = {
  config: {
    file: "apps/example/config/product.ts",
    lang: "ts",
    code: `export const product = {
  name: "Loomscape",
  domain: "loomscape.app",
  founder: { name: "You", twitter: "@you" },
  pricing: {
    foundingPrice: 39,
    listPrice: 99,
    cohortSize: 500,
  },
  referral: {
    spotsPerThree: 10,    // jump 10 spots per 3 referrals
    code: { length: 10 },
  },
  copy: {
    hero: "The thing you're shipping.",
    sub:  "One sentence. No buzzwords.",
  },
};`,
  },
  setup: {
    file: "terminal",
    lang: "sh",
    code: `$ git clone github.com/you/waitlist-stack
$ cd waitlist-stack && pnpm install
$ pnpm setup
  ✓ created D1 database (waitlist-prod)
  ✓ applied 14 migrations
  ✓ wrote .dev.vars (RESEND_API_KEY)
  ✓ provisioned R2 bucket (og-cache)
$ pnpm dev
  → http://localhost:3000  ready in 1.4s`,
  },
  schema: {
    file: "packages/db/schema.sql",
    lang: "sql",
    code: `CREATE TABLE signups (
  id          INTEGER PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  share_code  TEXT NOT NULL UNIQUE,
  referred_by TEXT REFERENCES signups(share_code),
  position    INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  ip_hash     TEXT NOT NULL,
  created_at  INTEGER NOT NULL
);

CREATE INDEX idx_signups_referred_by ON signups(referred_by);
CREATE INDEX idx_signups_position    ON signups(position);`,
  },
  og: {
    file: "packages/og/route.ts",
    lang: "ts",
    code: `import { ImageResponse } from "workers-og";

export async function GET(req: Request, ctx: Ctx) {
  const code = new URL(req.url).searchParams.get("c");
  const cached = await ctx.R2.get(\`og/\${code}.png\`);
  if (cached) return new Response(cached.body, { headers });

  const user = await ctx.DB.prepare(
    "SELECT name, position FROM signups WHERE share_code = ?"
  ).bind(code).first();

  const png = await ImageResponse(<Card user={user} />);
  ctx.waitUntil(ctx.R2.put(\`og/\${code}.png\`, png.clone()));
  return png;
}`,
  },
};

type Props = {
  t: Theme;
  defaultTab?: keyof typeof CODE_TABS;
};

export function CodeSwitcher({ t, defaultTab = "config" }: Props) {
  const [tab, setTab] = useState<keyof typeof CODE_TABS>(defaultTab);
  const tabs = Object.keys(CODE_TABS) as (keyof typeof CODE_TABS)[];
  const cur = CODE_TABS[tab];

  return (
    <div
      style={{
        background: t.codeBg,
        border: `1px solid ${t.border}`,
        borderRadius: t.radius,
        overflow: "hidden",
        fontFamily: t.monoFont,
      }}
    >
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${t.border}`,
          background: t.codeBg,
        }}
      >
        {tabs.map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              padding: "10px 14px",
              fontSize: 11.5,
              background: tab === k ? t.bg : "transparent",
              color: tab === k ? t.fg : t.muted,
              border: "none",
              borderRight: `1px solid ${t.border}`,
              cursor: "pointer",
              fontFamily: t.monoFont,
              letterSpacing: "0.02em",
              fontWeight: tab === k ? 600 : 400,
            }}
          >
            {k}
          </button>
        ))}
        <div style={{ flex: 1, borderRight: "none" }} />
        <span
          style={{
            padding: "10px 14px",
            fontSize: 11,
            color: t.muted,
            fontFamily: t.monoFont,
          }}
        >
          {cur.file}
        </span>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "18px 20px",
          fontSize: 12.5,
          lineHeight: 1.65,
          color: t.fg,
          fontFamily: t.monoFont,
          overflowX: "auto",
          background: t.bg,
        }}
      >
        <code>{cur.code}</code>
      </pre>
    </div>
  );
}
