import type { Theme } from "@/lib/theme";
import type { Signup } from "@/lib/helpers";
import { SignupForm } from "../SignupForm";
import { ReferralCard } from "../ReferralCard";
import { PaperKv } from "../PaperKv";

const HEADLINE = "A waitlist that ships in an afternoon.";

const STEPS = [
  { n: "01", code: "npm create waitlist-stack" },
  { n: "02", code: "Answer brand + Cloudflare prompts" },
  { n: "03", code: "npm run deploy" },
] as const;

export function Hero({
  t,
  signup,
  setSignup,
}: {
  t: Theme;
  signup: Signup | null;
  setSignup: (s: Signup | null) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr",
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: t.monoFont,
          fontSize: 10.5,
          color: t.muted,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          paddingTop: 14,
        }}
      >
        §1.0
      </div>
      <div>
        <div
          style={{
            fontFamily: t.monoFont,
            fontSize: 11,
            color: t.accent,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          Fig 1.0 · A complete, opinionated waitlist system for Cloudflare
        </div>
        <h1
          style={{
            fontFamily: t.serifFont,
            fontSize: 80,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            fontWeight: 400,
            margin: "0 0 32px",
            color: t.fg,
            textWrap: "balance",
          }}
        >
          {HEADLINE}
        </h1>
        <p
          style={{
            fontFamily: t.serifFont,
            fontSize: 21,
            lineHeight: 1.55,
            color: t.muted,
            fontWeight: 400,
            margin: "0 0 16px",
            maxWidth: 720,
            fontStyle: "italic",
          }}
        >
          Five subsystems, signup, referrals, email, OG images, admin, wired
          together and deployable to Cloudflare&apos;s free tier in one command.
          Free for the first ~3,000 signups per month.
        </p>
        <p
          style={{
            fontFamily: t.monoFont,
            fontSize: 12.5,
            lineHeight: 1.5,
            color: t.fg,
            margin: "0 0 40px",
            maxWidth: 720,
            padding: "10px 14px",
            background: t.inputBg,
            border: `1px dashed ${t.border}`,
            borderRadius: 3,
          }}
        >
          <span style={{ color: t.accent, fontWeight: 600 }}>
            You&apos;re reading the demo.
          </span>{" "}
          This whole page was scaffolded with{" "}
          <code style={{ background: t.bg, padding: "1px 5px" }}>
            npm create waitlist-stack
          </code>{" "}
          and deployed to Cloudflare&apos;s free tier. Every component below
          ships in your project too.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: t.monoFont,
                fontSize: 10.5,
                color: t.muted,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              ↓ Demo · the signup form your users would see
            </div>
            {!signup ? (
              <SignupForm t={t} onSuccess={setSignup} />
            ) : (
              <ReferralCard t={t} signup={signup} onDone={() => setSignup(null)} />
            )}
          </div>
          <div>
            <div
              style={{
                fontFamily: t.monoFont,
                fontSize: 10.5,
                color: t.muted,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Quickstart · for your own waitlist
            </div>
            <ol
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {STEPS.map((step) => (
                <li
                  key={step.n}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr",
                    gap: 12,
                    alignItems: "baseline",
                    paddingBottom: 10,
                    borderBottom: `1px dashed ${t.border}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: t.monoFont,
                      fontSize: 11,
                      color: t.muted,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {step.n}
                  </span>
                  <span
                    style={{
                      fontFamily: t.monoFont,
                      fontSize: 13,
                      color: t.fg,
                      lineHeight: 1.4,
                    }}
                  >
                    {step.code}
                  </span>
                </li>
              ))}
              <li
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr",
                  gap: 12,
                  alignItems: "baseline",
                  paddingTop: 4,
                  paddingBottom: 10,
                }}
              >
                <span style={{ fontFamily: t.monoFont, fontSize: 13, color: t.accent }}>
                  →
                </span>
                <span
                  style={{
                    fontFamily: t.serifFont,
                    fontSize: 14,
                    fontStyle: "italic",
                    color: t.fg,
                    lineHeight: 1.4,
                  }}
                >
                  Live waitlist with referrals in &lt;10 min.
                </span>
              </li>
            </ol>
            <div style={{ marginTop: 24 }}>
              <PaperKv t={t} k="cost" v="$0 / first ~3K signups" />
              <PaperKv t={t} k="deploy time" v="<10 min" />
              <PaperKv t={t} k="license" v="MIT" last />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
