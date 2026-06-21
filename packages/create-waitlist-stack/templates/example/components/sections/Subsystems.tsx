import type { Theme } from "@/lib/theme";
import { PaperHead } from "../PaperHead";

const FEATURES = [
  {
    id: "@db",
    title: "Typed D1 client + 5 migrations.",
    body: "SQLite schema for waitlist + rate_limit + admin meta + admin login throttle. Composite index on (email_status, created_at) so the admin retry batch stays fast past 50K rows. Typed client wraps the access patterns each other package needs; in-memory SQLite test harness so the SQL is exercised end-to-end.",
  },
  {
    id: "@config",
    title: "One file. Plain TypeScript.",
    body: "defineConfig() in waitlist.config.ts is the single source of truth. Brand, founder, pricing, referral mechanics, rate-limit windows, email provider. Every package reads from here. No Zod runtime parser; TypeScript catches errors at build time.",
  },
  {
    id: "@core",
    title: "Signup, validation, referral engine.",
    body: "Pure orchestration: validation, honeypot, per-IP rate limit, referral resolution with self-referral block, insert with unique-code retry, position lookup. Crockford base32 share codes (config-length, default 6 chars). Each successful referral jumps the referrer 10 spots (configurable). Levenshtein typo suggestion + 100-entry disposable-email blocklist.",
  },
  {
    id: "@email",
    title: "Resend adapter + Svix webhook.",
    body: "Resend ships in-box, Postmark + SendGrid stubs alongside. Welcome + launch templates parameterized on brand and founder. Webhook verifies Svix signatures (tampered body / wrong secret rejected) and routes delivered / bounced / failed to db status updates. Admin retry batch picks up failed rows. Verify your API key in 2 minutes with `npm run test-email` — sandbox mode needs no DNS.",
  },
  {
    id: "@og",
    title: "Edge-cached OG images.",
    body: "workers-og + Satori for the render. Each share link gets a personal card with name + position. Cached in R2 keyed by code:position:referralCount, so a referral bump invalidates the image without an explicit purge. Generic fallback for missing or invalid refs avoids hammering the renderer.",
  },
  {
    id: "@seo",
    title: "AI discoverability + structured data.",
    body: "Auto-generated llms.txt so ChatGPT, Claude, Perplexity can answer questions about your product correctly. JSON-LD blocks (Organization, WebSite, SoftwareApplication with priced offers). Dynamic favicon. robots, sitemap, Next metadata, OG, Twitter card, all from waitlist.config.ts.",
  },
  {
    id: "@admin",
    title: "Password-gated dashboard.",
    body: "Signed-cookie sessions (HMAC-SHA256, Web Crypto). DB-stored session-version revoke: bumping the row invalidates every active cookie at once. Two-tier verification: cheap edge check, full version check in every handler. Filterable signups table, retry-failed-emails batch, login is rate-limited.",
  },
  {
    id: "@create-waitlist-stack",
    title: "The 30-second wizard.",
    body: "npm create waitlist-stack <name>. Prompts for brand + founder + Cloudflare account, then writes waitlist.config.ts, wrangler.jsonc, .dev.vars (with a generated admin password and cookie secret), and a CLAUDE.md briefing your Claude Code session on where to edit the design.",
  },
] as const;

export function Subsystems({ t }: { t: Theme }) {
  return (
    <>
      <PaperHead
        t={t}
        num="§4.0"
        kicker="Subsystems"
        title="What every package does."
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
        {FEATURES.map((f, i, arr) => (
          <article
            key={f.id}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 200px",
              gap: 24,
              padding: "28px 0",
              borderBottom:
                i < arr.length - 1 ? `1px solid ${t.border}` : "none",
            }}
          >
            <span
              style={{
                fontFamily: t.monoFont,
                fontSize: 11,
                color: t.accent,
                paddingTop: 8,
                letterSpacing: "0.02em",
              }}
            >
              {f.id}
            </span>
            <div>
              <h3
                style={{
                  fontFamily: t.serifFont,
                  fontSize: 26,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  margin: "0 0 8px",
                  color: t.fg,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: t.serifFont,
                  fontSize: 16.5,
                  lineHeight: 1.6,
                  color: t.muted,
                  margin: 0,
                  textWrap: "pretty",
                }}
              >
                {f.body}
              </p>
            </div>
            <div
              style={{
                fontFamily: t.monoFont,
                fontSize: 10.5,
                color: t.muted,
                paddingTop: 10,
                letterSpacing: "0.04em",
              }}
            >
              fig 4.{i + 1}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
