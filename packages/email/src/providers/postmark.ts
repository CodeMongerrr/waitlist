import type { EmailProvider, SendArgs, SendResult } from "./types";

// Stub. To finish: POST https://api.postmarkapp.com/email with
// X-Postmark-Server-Token header, body { From, To, Subject, HtmlBody,
// TextBody, ReplyTo, Headers: [{Name,Value},...] }. Map MessageID -> id.
// PRs welcome.

export const PostmarkProvider: EmailProvider = {
  name: "postmark",
  async send(_args: SendArgs): Promise<SendResult> {
    return {
      ok: false,
      rateLimited: false,
      status: 501,
      error: "postmark provider is a stub; implement send() and open a PR",
    };
  },
};
