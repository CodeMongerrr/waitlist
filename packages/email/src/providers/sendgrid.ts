import type { EmailProvider, SendArgs, SendResult } from "./types";

// Stub. To finish: POST https://api.sendgrid.com/v3/mail/send with
// Authorization: Bearer <key>, body shape { personalizations, from,
// content, headers, ... }. SendGrid returns the message id in the
// X-Message-Id response header, not the body. PRs welcome.

export const SendGridProvider: EmailProvider = {
  name: "sendgrid",
  async send(_args: SendArgs): Promise<SendResult> {
    return {
      ok: false,
      rateLimited: false,
      status: 501,
      error: "sendgrid provider is a stub; implement send() and open a PR",
    };
  },
};
