# @waitlist-stack/email

Provider-agnostic transactional email plus templates and a Svix-verified webhook.

## What it does

- **Providers**: Resend (in-box, production-ready), Postmark and SendGrid (stubs to flesh out — PRs welcome). Switch via one line in `waitlist.config.ts`.
- **Templates**: HTML + text welcome and launch emails, brand-tokenized, with `List-Unsubscribe` headers (Gmail/Yahoo bulk-sender requirement).
- **Webhook**: Svix signature verification (timestamp + HMAC) wired to the D1 row so bounce/delivery events flip `email_status` correctly.
- **`sendWelcome()`**: Builds template, sends via the configured provider, records status on the row. Returns `{ ok: true } | { ok: false, error, rateLimited }` so callers can detect 429s.

## Use it standalone

```ts
import { sendWelcome } from "@waitlist-stack/email";

const r = await sendWelcome(db, config, {
  apiKey: env.RESEND_API_KEY,
  recipient: { id: row.id, email: row.email, name: row.name },
  referralCode: row.referral_code,
  position: 42,
});
```

DNS / SPF / DKIM / DMARC walkthrough lives in `RESEND_SETUP.md` in the example app. Without those, deliverability is a coin flip.
