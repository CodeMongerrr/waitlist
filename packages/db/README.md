# @waitlist-stack/db

Cloudflare D1 schema, migrations, and a typed query client.

## What it does

- Five SQL migrations covering signups, referrals, admin meta, login rate limit, and an `(email_status, created_at)` index.
- `WaitlistDb` — narrow typed wrapper around D1 with one method per access pattern (`findByEmail`, `insertSignup`, `positionFor`, `findPendingOrFailed`, `bumpAdminMeta`, etc.).
- In-memory test harness using `better-sqlite3` so tests run the real schema and real queries without spinning up D1.

## Use it standalone

```ts
import { WaitlistDb } from "@waitlist-stack/db";

const db = new WaitlistDb(env.DB);
const row = await db.findByEmail("you@example.com");
```

Apply migrations with wrangler:

```sh
wrangler d1 migrations apply <db-name> --local
wrangler d1 migrations apply <db-name> --remote
```

New queries should be added as methods on `WaitlistDb` rather than hand-written SQL at the call site.
