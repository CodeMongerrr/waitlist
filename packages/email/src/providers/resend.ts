import type { EmailProvider, SendArgs, SendResult } from "./types";

// Email-deliverability headers. Gmail/Yahoo require List-Unsubscribe for bulk
// senders (>5k/day) starting 2024; transactional senders aren't strictly
// required, but having it protects sender reputation. mailto: form is the
// simplest legal-compliance path. Caller can override via args.headers.

export const ResendProvider: EmailProvider = {
  name: "resend",
  async send(args: SendArgs): Promise<SendResult> {
    try {
      const fromHeader = args.fromName ? `${args.fromName} <${args.from}>` : args.from;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${args.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromHeader,
          to: args.to,
          subject: args.subject,
          html: args.html,
          text: args.text,
          reply_to: args.replyTo,
          headers: args.headers,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
      };
      if (res.ok && body.id) return { ok: true, id: body.id };
      return {
        ok: false,
        rateLimited: res.status === 429,
        status: res.status,
        error: body.message || `HTTP ${res.status}`,
      };
    } catch (e) {
      return {
        ok: false,
        rateLimited: false,
        status: 0,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
};
