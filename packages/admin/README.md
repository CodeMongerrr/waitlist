# @waitlist-stack/admin

Signed-cookie session auth, login rate limit, and edge middleware for the admin dashboard.

## What it does

- **Cookie format**: `<issuedMs>.<version>.<base64urlHmacSig>` — HMAC-SHA256 over `${issuedMs}.${version}`. Web Crypto only (Workers, Node 18+, browsers).
- **Two verifiers**: `verifyCookieSignature` (cheap HMAC + expiry, edge-safe, no DB) for middleware; `verifySessionFull` (adds DB version check) for handlers — bumping `admin_meta.session_version` revokes every active cookie.
- **`login(db, config, env, input)`**: rate-limit check, constant-time password compare, mints a cookie at the current session version. Resets the rate-limit row on success.
- **`checkAdminMiddleware(input)`**: framework-agnostic auth gate — pass pathname + cookie header, get back `{ allow: true }` or `{ allow: false, reason, redirectTo }`. Wrap it in your framework's middleware.

## Use it standalone

```ts
// middleware.ts (Next, Hono, plain Workers — same shape)
import { checkAdminMiddleware } from "@waitlist-stack/admin";

const decision = await checkAdminMiddleware({
  pathname: req.nextUrl.pathname,
  cookieHeader: req.headers.get("cookie"),
  cookieSecret: process.env.ADMIN_COOKIE_SECRET,
  config,
});
```

Handlers should re-verify with `verifySessionFull` belt-and-suspenders so a middleware-matcher drift can't leak data.
