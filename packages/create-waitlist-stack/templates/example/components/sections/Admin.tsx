import type { Theme } from "@/lib/theme";
import type { SeedSignup } from "@/lib/helpers";
import { PaperHead } from "../PaperHead";
import { AdminPreview } from "../AdminPreview";

export function Admin({ t, seedSignups }: { t: Theme; seedSignups: SeedSignup[] }) {
  return (
    <>
      <PaperHead
        t={t}
        num="§6.0"
        kicker="Admin"
        title="See who joined. Retry what bounced."
      />
      <div
        style={{
          border: `1px solid ${t.borderStrong}`,
          borderRadius: t.radius,
          overflow: "hidden",
          background: t.bg,
        }}
      >
        <div
          style={{
            padding: "8px 14px",
            borderBottom: `1px solid ${t.border}`,
            fontFamily: t.monoFont,
            fontSize: 11,
            color: t.muted,
            background: t.bgAlt,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>GET /admin · admin_session · 200 OK</span>
          <span>HMAC-verified</span>
        </div>
        <AdminPreview t={t} signups={seedSignups} />
      </div>
    </>
  );
}
