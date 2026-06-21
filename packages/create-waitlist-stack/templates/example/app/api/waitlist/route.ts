import { type NextRequest, NextResponse } from "next/server";
import { WaitlistDb } from "@waitlist-stack/db";
import { signup } from "@waitlist-stack/core";
import { sendWelcome } from "@waitlist-stack/email";
import config from "../../../waitlist.config";
import { env } from "../../../lib/cf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  name?: unknown;
  email?: unknown;
  source?: unknown;
  ref?: unknown;
  website_url?: unknown;
}

export async function POST(req: NextRequest) {
  const e = await env();
  const db = new WaitlistDb(e.DB);

  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "";

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const result = await signup(db, config, {
    name: typeof body.name === "string" ? body.name : "",
    email: typeof body.email === "string" ? body.email : "",
    source: typeof body.source === "string" ? body.source : undefined,
    ref: typeof body.ref === "string" ? body.ref : undefined,
    website_url: typeof body.website_url === "string" ? body.website_url : undefined,
    ip,
    userAgent,
  });

  if (!result.ok) {
    const status =
      result.error === "rate_limited"
        ? 429
        : result.error === "validation"
          ? 400
          : 500;
    const headers: Record<string, string> = {};
    if (result.error === "rate_limited" && result.retryAfterSeconds) {
      headers["Retry-After"] = String(result.retryAfterSeconds);
    }
    return NextResponse.json({ error: result.message }, { status, headers });
  }

  // Fire welcome email on the new signup path. Failures are recorded on the
  // row by sendWelcome (email_status='failed'); the admin retry batch picks
  // them up later. We don't block the response on email success.
  if (!result.duplicate && e.RESEND_API_KEY) {
    await sendWelcome(db, config, {
      apiKey: e.RESEND_API_KEY,
      recipient: { id: result.row.id, email: result.row.email, name: result.row.name },
      referralCode: result.referralCode,
      position: result.position,
    }).catch(() => {
      /* swallow; status already recorded on the row */
    });
  }

  return NextResponse.json({
    ok: true,
    duplicate: result.duplicate,
    referralCode: result.referralCode,
    position: result.position,
    referralCount: result.referralCount,
  });
}
