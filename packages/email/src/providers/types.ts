// Provider-agnostic send interface. Resend ships in-box; Postmark and
// SendGrid are stubs the user can flesh out (PRs welcome). Switching is a
// one-line change in waitlist.config.ts.

export interface SendArgs {
  apiKey: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Optional headers (e.g. List-Unsubscribe). Provider must merge in. */
  headers?: Record<string, string>;
}

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; rateLimited: boolean; status: number; error: string };

export interface EmailProvider {
  name: string;
  send(args: SendArgs): Promise<SendResult>;
}
