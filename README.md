# Catalyst

[![CI](https://github.com/CodeMongerrr/waitlist/actions/workflows/ci.yml/badge.svg)](https://github.com/CodeMongerrr/waitlist/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

**Post daily on X, in a voice that's unmistakably yours.**

Catalyst reads Reddit, Hacker News, and Google News in your niche, drafts posts in your voice from what's actually happening, and queues them. You approve the good ones in about ten minutes a day. Every post waits for your approval.

This repo is the **Catalyst waitlist site**: the signup landing, the referral loop, transactional welcome email, personalized OG share cards, and a password-gated admin dashboard. It runs entirely on Cloudflare's free tier.

**Live:** https://catalyst-waitlist.aayushgiri1234.workers.dev

![Catalyst landing](docs/screenshots/landing-hero.png)

## What it does

- **Email-first signup, hard to abuse.** Drop an email, you're on the list. A honeypot catches auto-fill bots, disposable-email domains (mailinator, 10minutemail, etc.) are blocked, one IP can't spam the form, and obvious typos get a polite "did you mean `gmail.com`?".
- **Referrals that move the line.** Every signup gets a link like `catalyst-waitlist.aayushgiri1234.workers.dev/?ref=K7M9P3`. Each friend who joins through it moves you up **5 spots**, and the position you see updates live as they join.
- **OG cards with your name and rank.** Share your link to X, Slack, iMessage, or LinkedIn and the preview reads *"<name> just joined the Catalyst waitlist · #1247"* instead of a generic logo.
- **Admin dashboard you can log into.** Password-gated list of every signup: filter by email status, search by name or email, retry any failed welcome email, export the list to CSV.
- **Welcome email via Resend.** Sent right after signup. If Resend rate-limits the free tier, the row is marked `failed` and you batch-retry later from the admin instead of burning attempts during the 429.
- **SEO and answer-engine discoverability.** JSON-LD, sitemap, robots, a dynamic favicon, and an auto-generated `llms.txt` so Perplexity, ChatGPT, and Claude quote Catalyst correctly.

![Admin dashboard](docs/screenshots/landing-admin.png)

## Run locally

```sh
pnpm install
pnpm dev        # Catalyst landing at http://localhost:3000
```

No Cloudflare setup is needed for local dev. An in-memory SQLite stand-in backs signups, OG, and admin, so the whole flow (signup, referral, admin) works offline with zero config. The admin login in dev uses `ADMIN_PASSWORD` (a dev default is supplied).

```sh
pnpm test       # unit + component tests across the packages and app
pnpm typecheck  # tsc --noEmit, every package
```

## Deploy

Catalyst ships to Cloudflare Workers through [`@opennextjs/cloudflare`](https://github.com/opennextjs/opennextjs-cloudflare). The Worker name, account, and D1 binding are pinned in [`apps/example/wrangler.jsonc`](apps/example/wrangler.jsonc); secrets live in Cloudflare, never in the repo.

```sh
npx wrangler login

# First time only: apply the schema (6 migrations in packages/db/migrations)
# to the remote D1 database named catalyst-waitlist.

# Build (OpenNext) and ship:
pnpm --filter example deploy
```

Set these as Worker secrets (`wrangler secret put <NAME>` or the Cloudflare dashboard):

| Secret | Purpose |
|---|---|
| `RESEND_API_KEY` | sends the welcome email |
| `RESEND_WEBHOOK_SECRET` | verifies Resend delivery/bounce webhooks (Svix) |
| `ADMIN_PASSWORD` | admin login (must be >= 12 chars) |
| `ADMIN_COOKIE_SECRET` | signs admin session cookies (must be >= 12 chars) |

OG caching is in-memory by default (R2 is not provisioned on this account); cards still render on every request. To persist them, enable R2, create a bucket, and add an `OG_CACHE` binding to `wrangler.jsonc`.

## How it works

Each line is the plain-English behavior plus an *under the hood* note.

**Signup.** Email in, position out. Honeypot, per-IP rate limit, disposable-email block, typo suggestion, self-referral block.
> `POST /api/waitlist` runs validation, the `website_url` honeypot check, a per-IP sliding-window rate limit, referral resolution, and an insert with unique-code retry, then a position lookup. The welcome email fires best-effort; failures land in `email_status='failed'` for the admin retry batch. User-supplied text (name, source, X handle) is stripped of control characters at the core boundary before it is stored.

**Referrals.** A friend joining via `?ref=CODE` moves the referrer up 5 spots, live.
> Position is recomputed from the whole table with a SQLite window function (rank by `created_at`, subtract `referral_count * 5`, tiebreak by id), so other people's referrals correctly shift you down. `GET /api/waitlist/me/{code}` returns live `{position, baseRank, referralCount}` for a code. A code reveals position only, not name or email, and codes are 6-char Crockford base32 (~10⁹ keyspace), so enumeration isn't economic.

**OG cards.** Personalized 1200×630 PNG per referral code.
> `GET /api/og?ref=CODE` renders with workers-og (Satori + Yoga + Resvg). Cached by `<code>:<position>:<referralCount>` so a referral bump invalidates the image. Generic fallback (no DB lookup) for missing or invalid refs as a denial-of-cost defense.

**Admin.** Signed-cookie auth, three-tier verification.
> `/admin` is gated by HMAC-SHA256 signed cookies over `<issuedMs>.<sessionVersion>`: a cheap edge check in middleware, a full DB-backed version check inside every page, and the same `requireAdminOrRedirect()` guard on every server action, so a route-matcher misconfig can't leak data. Bumping the DB session-version row revokes every active cookie at once.

**Email.** Resend send, webhook-driven status, batch retry.
> A Svix-signed Resend webhook flips rows to `delivered` / `bounced` / `failed`. Batch retry pulls the latest 100 pending/failed, re-looks-up each row's current position so retries reflect the live queue, and short-circuits on a 429.

## Security

- **Admin auth:** signed cookies (HMAC-SHA256, Web Crypto), DB-backed session-version revoke, edge + handler-level checks, login rate limit, and a min-length guard so a too-short `ADMIN_PASSWORD` fails closed.
- **Open redirect:** the admin login only accepts strictly-relative `?next=` paths.
- **Webhook:** Svix signature plus a 5-minute replay window so captured events can't be replayed later.
- **CSV export:** auth-gated (401, not a redirect), hard-capped at 50k rows, and RFC 4180-quoted with a formula-injection guard. Leading `=`, `+`, `-`, `@` are neutralized and embedded CR/LF are quoted, so a crafted field like `=cmd|...` can't execute when the file opens in a spreadsheet.
- **Honeypot:** the trap field is `website_url` (not the obvious `company`/`url`) and is wired through React state into the signup body, so bots that auto-fill known honeypot names trip it.

Found a vulnerability? See [SECURITY.md](SECURITY.md) for the disclosure email and scope.

## Stack

- Next.js 15 (App Router) on `@opennextjs/cloudflare`
- React 19, TypeScript 5.7 strict
- pnpm 10 + Turborepo workspaces
- D1 (SQLite) with an in-memory SQLite test harness (real schema, real queries)
- R2 for the optional OG image cache
- workers-og for OG rendering (Satori + Yoga + Resvg as WASM)
- Resend for transactional email

---

Built on the open-source [waitlist-stack](https://github.com/Giri-Aayush/waitlist-stack) template. Licensed MIT, see [LICENSE](LICENSE).
