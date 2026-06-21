# waitlist-stack

A public, MIT-licensed, Cloudflare-native waitlist template. Ships signup, referrals, email (Resend), edge-cached OG images, password-gated admin, SEO/llms.txt, and anti-fraud, all deployable to Cloudflare's free tier in under 30 minutes via a CLI wizard (`pnpm create waitlist-stack`).

## Layout

- `apps/example` — Next.js 15 app wired to every package; deploy-ready demo and the source the CLI wizard scaffolds from
- `packages/db` — D1 schema (5 migrations) + typed client + in-memory test harness
- `packages/config` — plain TS product config schema with `defineConfig` helper
- `packages/core` — signup orchestration, referral codes, position math, email check, rate limit
- `packages/email` — Resend adapter (Postmark + SendGrid stubs), templates, Svix webhook. `sendWelcome()` returns `{ ok, error, rateLimited }` so callers distinguish 429 from a hard failure.
- `packages/og` — brand-tokenized OG cards, R2 cache, renderer-agnostic handler
- `packages/seo` — JSON-LD, llms.txt, robots, sitemap, dynamic favicon
- `packages/admin` — signed-cookie auth, login rate limit, middleware
- `packages/create-waitlist-stack` — the CLI wizard

## Key apps/example endpoints + helpers

- `app/api/waitlist/route.ts` — POST signup
- `app/api/waitlist/me/[code]/route.ts` — public position lookup. Returns `{position, baseRank, referralCount, jumpsPerReferral}` for any valid code. Powers live "you're #N" updates.
- `app/api/og/route.tsx` — personalized OG image (deferred workers-og import)
- `app/api/resend-webhook/route.ts` — Svix-verified webhook
- `app/admin/page.tsx` — dashboard with search + filter (incl. synthetic `queued`) + per-row + batch retry + CSV link
- `app/admin/export.csv/route.ts` — auth-gated CSV download. Returns 401 (not redirect) on unauth. Filter-aware. Formula-injection-safe.
- `app/admin/actions.ts` — server actions: `loginAction`, `logoutAction`, `retryFailedEmailsAction` (returns `RetryBatchResult` with `hitProviderRateLimit`), `resendOneEmailAction` (per-row).
- `app/admin/retry-controls.tsx` — client component with `BatchRetryButton` + `RowRetryButton`.
- `lib/admin-guard.ts` — `verifyAdmin()` + `requireAdminOrRedirect()`. Every admin route + server action calls one of these. Belt-and-suspenders against middleware drift. Both functions reject whitespace-only `ADMIN_COOKIE_SECRET`.
- `lib/safe-next.ts` — `isSafePath()` / `safeNextOr()`. Use for ANY redirect that takes user input (login `?next=`). Rejects `//evil.com`, `/\evil.com`, absolute URLs, and empty strings. Never `redirect()` a raw search param or form field without it.
- `middleware.ts` — edge gate calling `checkAdminMiddleware` from `@waitlist-stack/admin`.

## Adding a new admin server action

Always start with:

```ts
"use server";
import { requireAdminOrRedirect } from "../../lib/admin-guard";

export async function myAction(formData: FormData) {
  await requireAdminOrRedirect();
  // ...
}
```

Middleware already gates `/admin/*`, but a Next matcher misconfig should never become a one-line catastrophe. Same rule for new admin pages: call `requireAdminOrRedirect()` at the top of the server component.

## Security boundaries to preserve

- Honeypot is `website_url` (renamed from `company`). The form must include it in the JSON body — without that, the trap is dead. See `apps/example/components/SignupForm.tsx`.
- Any `redirect(userInput)` must go through `safeNextOr()` first. `loginAction` and `LoginPage` already do.
- Svix webhook verification uses a 5-minute replay window. Tests pin `nowMs` to make signature checks deterministic across CI clock drift.
- CSV export hard-caps at 50k rows. Don't remove the cap without thinking through the worker's 128MB memory limit.
- `ADMIN_PASSWORD` and `ADMIN_COOKIE_SECRET` must be ≥12 chars after trim. Both `login.ts` and `admin-guard.ts` reject anything shorter.

Vulnerability disclosure: SECURITY.md at repo root. Don't file public issues for security bugs.

## Stack

- Next.js 15.1.6 on `@opennextjs/cloudflare`
- React 19, TypeScript 5.7 strict
- pnpm 10 + Turborepo
- vitest with better-sqlite3 for in-memory D1 tests (real schema, real queries)
- workers-og for OG rendering (Satori + Yoga + Resvg as WASM)
- Resend for email (Postmark + SendGrid adapter stubs)

## Common commands

```sh
pnpm dev          # turbo run dev (apps/example at :3000)
pnpm build        # turbo run build
pnpm typecheck    # turbo run typecheck
pnpm test         # turbo run test (vitest, 124 tests)
```

## Style conventions

- No em dashes. Banned words: "genuinely," "straightforward," "crucially," "moreover," "furthermore," "delve," "unlock," "ecosystem" as a buzzword, "seamlessly," "holistic," "transformative."
- Plain statement headings. No emoji unless explicitly requested.
- Default to no comments; explain WHY only when non-obvious.
- Per-package commits, not big batches. Stage files explicitly. Don't push without asking.
