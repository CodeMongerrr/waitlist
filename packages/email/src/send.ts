import type { WaitlistConfig } from "@waitlist-stack/config";
import type { WaitlistDb } from "@waitlist-stack/db";
import { getProvider } from "./providers/index";
import { welcomeEmail } from "./templates/welcome";

export interface SendWelcomeInput {
  apiKey: string;
  recipient: { id: number; email: string; name: string };
  referralCode?: string | null;
  position?: number | null;
  /** Optional. List-Unsubscribe mailto target. Falls back to brand.contactEmail. */
  unsubscribeEmail?: string;
}

// Build + send + record-status. Caller invokes after signup() returns ok.
// Failures flip the row to email_status = 'failed' so the admin retry batch
// picks it up.

export type SendWelcomeResult =
  | { ok: true }
  | { ok: false; error: string; rateLimited: boolean };

export async function sendWelcome(
  db: WaitlistDb,
  config: WaitlistConfig,
  input: SendWelcomeInput,
): Promise<SendWelcomeResult> {
  const provider = getProvider(config.email.provider);
  const tmpl = welcomeEmail({
    brand: config.brand,
    founder: config.founder,
    recipientName: input.recipient.name,
    referralCode: input.referralCode,
    position: input.position,
    jumpsPerReferral: config.referral.jumpsPerReferral,
  });

  const unsub = input.unsubscribeEmail ?? config.brand.contactEmail;
  const headers: Record<string, string> | undefined = unsub
    ? {
        "List-Unsubscribe": `<mailto:${unsub}?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      }
    : undefined;

  const result = await provider.send({
    apiKey: input.apiKey,
    from: config.email.fromAddress,
    fromName: config.email.fromName,
    replyTo: config.email.replyTo,
    to: input.recipient.email,
    subject: tmpl.subject,
    html: tmpl.html,
    text: tmpl.text,
    headers,
  });

  if (result.ok) {
    await db.markEmailSent(input.recipient.id, result.id);
    return { ok: true };
  }
  const errMsg = `${result.status}: ${result.error}`;
  await db.markEmailFailed(input.recipient.id, errMsg);
  return { ok: false, error: errMsg, rateLimited: result.rateLimited };
}
