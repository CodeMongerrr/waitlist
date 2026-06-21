# @waitlist-stack/config

Plain-TypeScript config schema and a `defineConfig()` helper.

## What it does

Exports strictly-typed interfaces (`WaitlistConfig`, `BrandConfig`, `AdminConfig`, etc.) and a no-op `defineConfig()` helper that gives you autocomplete in `waitlist.config.ts`. Validation happens via TypeScript at build time, not at runtime — one less dep, simpler errors, faster cold start than Zod.

## Use it standalone

```ts
// waitlist.config.ts
import { defineConfig } from "@waitlist-stack/config";

export default defineConfig({
  brand: { name: "Acme", tagline: "the future, but sooner" },
  founder: { name: "Jane Doe", twitter: "@jane" },
  email: { provider: "resend", fromAddress: "hi@acme.com", fromName: "Acme" },
  admin: { path: "/admin", cookieName: "ws_admin", sessionTtlSeconds: 86400 },
  // ...
});
```

Defaults for admin, OG, rate limit, and referral live in `DEFAULT_*` exports — spread them if you only want to override a few fields.
