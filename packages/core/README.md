# @waitlist-stack/core

Signup orchestration, referral codes + position math, email validation, and rate limiting.

## What it does

- `signup(db, config, input)` — pure orchestration: validation, honeypot, rate-limit, referral resolution, insert with collision retry, referrer credit, position lookup. Returns a discriminated union you switch on at the API boundary.
- `generateReferralCode(length)` / `isValidReferralCode(code, length)` — Crockford-style base32 (no 0/O, 1/l/I, U).
- `isValidEmail`, `isDisposableEmail`, `suggestEmailFix` — Levenshtein typo suggestion against popular domains plus a ~100-entry disposable blocklist.
- `checkRateLimit(db, ip, config)` — sliding-window per-IP counter backed by D1.

## Use it standalone

```ts
import { signup } from "@waitlist-stack/core";

const result = await signup(db, config, {
  name: body.name,
  email: body.email,
  ref: body.ref,
  company: body.company, // honeypot
  ip,
});

if (!result.ok) return Response.json({ error: result.message }, { status: 400 });
```

Email send is the caller's responsibility — orthogonal to the signup transaction so a transient email outage doesn't block signups.
