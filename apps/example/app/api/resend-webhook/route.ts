import { type NextRequest, NextResponse } from "next/server";
import { WaitlistDb } from "@waitlist-stack/db";
import { handleResendWebhook } from "@waitlist-stack/email";
import { env } from "../../../lib/cf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const e = await env();
  const db = new WaitlistDb(e.DB);

  const rawBody = await req.text();
  const result = await handleResendWebhook(db, {
    secret: e.RESEND_WEBHOOK_SECRET ?? "",
    headers: {
      id: req.headers.get("svix-id") ?? undefined,
      timestamp: req.headers.get("svix-timestamp") ?? undefined,
      signature: req.headers.get("svix-signature") ?? undefined,
    },
    rawBody,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
