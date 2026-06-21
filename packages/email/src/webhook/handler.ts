import type { WaitlistDb } from "@waitlist-stack/db";
import { verifySvix, type SvixHeaders } from "./svix";

interface ResendEvent {
  type?: string;
  data?: { email_id?: string; to?: string[] | string };
}

export type WebhookResult =
  | { ok: true; status: 200 }
  | { ok: false; status: number; error: string };

export interface WebhookInput {
  secret: string;
  headers: Partial<SvixHeaders>;
  rawBody: string;
}

// Pure orchestration. Caller wires this into their HTTP route however they
// want. Returns a status + error so the route can construct the response.

export async function handleResendWebhook(
  db: WaitlistDb,
  input: WebhookInput,
): Promise<WebhookResult> {
  if (!input.secret) {
    return { ok: false, status: 503, error: "webhook not configured" };
  }
  const { id, timestamp, signature } = input.headers;
  if (!id || !timestamp || !signature) {
    return { ok: false, status: 400, error: "missing svix headers" };
  }

  const valid = await verifySvix(
    input.secret,
    { id, timestamp, signature },
    input.rawBody,
  );
  if (!valid) {
    return { ok: false, status: 401, error: "bad signature" };
  }

  let evt: ResendEvent;
  try {
    evt = JSON.parse(input.rawBody) as ResendEvent;
  } catch {
    return { ok: false, status: 400, error: "bad json" };
  }

  const resendId = evt.data?.email_id;
  if (!resendId) return { ok: true, status: 200 };

  switch (evt.type) {
    case "email.delivered":
      await db.markEmailDelivered(resendId);
      break;
    case "email.bounced":
    case "email.complained":
      await db.markEmailBounced(resendId);
      break;
    case "email.failed":
      // markEmailFailed wants the row id, not resend_id. Look it up.
      // This branch is rare; the cost is one extra read.
      await markFailedByResendId(db, resendId);
      break;
  }
  return { ok: true, status: 200 };
}

async function markFailedByResendId(db: WaitlistDb, resendId: string) {
  await db
    .raw()
    .prepare(
      `UPDATE waitlist
         SET email_status = 'failed',
             email_last_error = 'provider reported failed'
       WHERE resend_id = ?`,
    )
    .bind(resendId)
    .run();
}
