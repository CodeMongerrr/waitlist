import type { Theme } from "@/lib/theme";
import type { Signup, SeedSignup } from "@/lib/helpers";
import { PaperHead } from "../PaperHead";
import { OgPreview } from "../OgPreview";
import { LeaderboardPreview } from "../LeaderboardPreview";

export function WorkedExample({
  t,
  signup,
  seedSignups,
}: {
  t: Theme;
  signup: Signup | null;
  seedSignups: SeedSignup[];
}) {
  return (
    <>
      <PaperHead
        t={t}
        num="§5.0"
        kicker="Worked example"
        title="A signup, a share, a referral."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 56,
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
            Fig 5.1 · OG card · live render
          </div>
          <OgPreview
            t={t}
            name={signup?.name || "Mira Okafor"}
            position={signup?.position || 1247}
            code={signup?.code || "K7M9PXR2WQ"}
          />
          <div
            style={{
              marginTop: 14,
              fontFamily: t.monoFont,
              fontSize: 11,
              color: t.muted,
              lineHeight: 1.6,
            }}
          >
            GET /api/og?ref=K7M9PXR2WQ → R2 hit, 12ms, 87KB
          </div>
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
            Fig 5.2 · Top referrers
          </div>
          <LeaderboardPreview
            t={t}
            signups={seedSignups}
            currentEmail={signup?.email}
          />
          <div
            style={{
              marginTop: 18,
              padding: 14,
              background: t.codeBg,
              border: `1px solid ${t.border}`,
              borderRadius: t.radius,
              fontFamily: t.monoFont,
              fontSize: 11.5,
              color: t.muted,
              lineHeight: 1.6,
            }}
          >
            jumpsPerReferral: <span style={{ color: t.accent }}>10</span>
            &nbsp;·&nbsp; codeLength: <span style={{ color: t.accent }}>6</span>
          </div>
        </div>
      </div>
    </>
  );
}
