# Resend setup

Resend is the transactional email provider this template ships with. Free tier covers 100 emails/day and 3,000/month.

This doc walks you from **zero** (no Resend account) to **emails arriving in your users' inboxes**. ~15 minutes if your DNS is on Cloudflare.

## Quick verify (2 min, no DNS)

You can prove the wire is alive — API key, send, response — **before** doing any DNS work. Resend gives you two helpers for this:

- **`onboarding@resend.dev`** — a sender address that needs no domain verification.
- **`delivered@resend.dev`** — a recipient that simulates a successful delivery without touching a real inbox.

So the fastest path is:

1. Sign up at <https://resend.com> (free, no card)
2. Create an API key at <https://resend.com/api-keys> with **Sending access**
3. Paste into `apps/example/.dev.vars`:
   ```
   RESEND_API_KEY=re_your_key_here
   ```
4. From `apps/example/`, run:
   ```sh
   npm run test-email
   ```
   (No recipient argument → sandbox mode.)

If you see `✓ Sandbox roundtrip succeeded`, your API key is valid and the integration is wired correctly. **Now** do the DNS section below to send from your own domain.

## 1. Create a Resend account

Sign up at <https://resend.com>. The free tier needs no card.

## 2. Add your sending domain

Resend won't deliver from a domain it can't verify. You need to own a real domain (the same one in `waitlist.config.ts` → `brand.siteUrl`). Domains like `gmail.com` or `outlook.com` will not work as sender addresses.

In the Resend dashboard:

1. **Domains → Add Domain**
2. Enter the domain (e.g. `your-app.com` — not the full URL, just the host)
3. Pick a region close to your users (US East is the default)
4. Resend shows you 3 DNS records to add: **SPF**, **DKIM**, and **DMARC**

## 3. Add the DNS records (Cloudflare path)

Each record is a TXT (or in DKIM's case, sometimes CNAME) record. The exact values are shown in the Resend dashboard — do not copy from this README, the keys are unique per domain.

In the Cloudflare dashboard for your domain:

1. **DNS → Records → Add record**
2. For each record Resend shows:
   - **Type**: TXT (or CNAME for DKIM if Resend says so)
   - **Name**: copy verbatim from Resend (e.g. `send` or `resend._domainkey`)
   - **Content**: copy verbatim from Resend
   - **Proxy status**: **DNS only** (do NOT proxy through Cloudflare's orange cloud)
   - **TTL**: Auto

3. Click **Save** for each.

Three records typically added:

| Type | Name | Purpose |
|---|---|---|
| TXT | `send` | SPF — tells receivers Resend is allowed to send for you |
| TXT/CNAME | `resend._domainkey` | DKIM — cryptographic signature for each message |
| TXT | `_dmarc` | DMARC — what to do with messages that fail SPF/DKIM |

## 4. Verify in Resend

Back in the Resend dashboard, click **Verify DNS Records** on your domain. Cloudflare DNS propagates quickly (usually under 5 minutes); verification often passes on the first click. If it fails:

- Wait 5-10 more minutes and retry
- Confirm the records show in `dig TXT send.your-app.com` (replace with your actual record name)
- Confirm Cloudflare proxy is OFF on the records (gray cloud, not orange)

## 5. Create an API key

In Resend: **API Keys → Create API Key**. Choose **Sending access** (not Full access). Copy the key (starts with `re_`).

## 6. Paste the key locally

Open `.dev.vars` in your scaffolded project. Replace the placeholder:

```
RESEND_API_KEY=re_your_actual_key_here
```

For production (Cloudflare Workers), set the secret:

```sh
npx wrangler secret put RESEND_API_KEY
```

## 7. Verify your setup with a test send

The example app ships with a verification script:

```sh
npm run test-email -- you@example.com
```

This calls Resend with a one-off message using your `from` address from `waitlist.config.ts`. If you receive the email within a minute, you're done. If not, the script prints the exact failure reason from Resend's API.

## 8. Set up the webhook (after first deploy)

Welcome emails work without the webhook — the API call returns a message ID and your `email_status` flips to `sent`. The webhook adds **delivered / bounced / complained / failed** status updates so the admin retry batch knows what to retry.

After your first `npm run deploy`:

1. In Resend: **Webhooks → Add Endpoint**
2. URL: `https://your-deployed-site.com/api/resend-webhook`
3. Subscribe to events: `email.delivered`, `email.bounced`, `email.complained`, `email.failed`
4. Copy the **Signing Secret** (starts with `whsec_`)
5. Set it in production:
   ```sh
   npx wrangler secret put RESEND_WEBHOOK_SECRET
   ```
6. For local dev, paste it into `.dev.vars`:
   ```
   RESEND_WEBHOOK_SECRET=whsec_your_secret_here
   ```

## Troubleshooting

| Symptom | Most likely cause |
|---|---|
| 401 Unauthorized | API key wrong or revoked. Generate a new one. |
| 403 Forbidden on send | Domain not verified in Resend, or the `from` address isn't on a verified domain. |
| 422 Unprocessable Entity, "from invalid" | The from address in `waitlist.config.ts` doesn't match a verified domain. |
| 429 Too Many Requests | Free tier limit hit (100/day or 3K/month). Wait or upgrade. |
| Email never arrives, no error | Check spam folder. Then check the message in Resend's dashboard → Logs to see if it bounced. |
| Webhook returns 401 | `RESEND_WEBHOOK_SECRET` wrong or missing. Make sure you set it in Cloudflare secrets, not just local `.dev.vars`. |
| `email_status` stuck at `sent`, never goes `delivered` | Webhook not configured (see step 8) or webhook URL unreachable. |

## DMARC policy

The default DMARC record Resend gives you uses `p=none` (monitor only). This is fine for getting started. Once you've sent a few hundred emails and confirmed they're not bouncing, you can tighten to `p=quarantine` or `p=reject` for better deliverability over time. Edit the `_dmarc` TXT record in Cloudflare DNS to update.
