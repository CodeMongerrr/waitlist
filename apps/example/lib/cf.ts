import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

// Typed accessor for the Cloudflare bindings + secrets the app expects.
// Centralized so handlers don't have to repeat the unsafe casts.
//
// Dev fallback: when running under `npm run dev` (no Cloudflare context, no
// D1 binding), env() lazy-loads an in-memory SQLite stand-in via dev-db.ts
// so signups, OG, and admin all work end-to-end with zero setup. The dev
// import never reaches the production Worker bundle (it lives behind a
// dynamic import that the build doesn't resolve into a Worker; better-
// sqlite3 is also marked serverExternal in next.config.ts).

export interface AppEnv {
  DB: D1Database;
  OG_CACHE?: R2Bucket;
  RESEND_API_KEY?: string;
  RESEND_WEBHOOK_SECRET?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_COOKIE_SECRET?: string;
  /** True when DB is the in-memory dev fallback. */
  isDev?: boolean;
}

export async function env(): Promise<AppEnv> {
  let cf: Partial<AppEnv> | null = null;
  try {
    const ctx = await getCloudflareContext({ async: true });
    cf = ctx.env as unknown as Partial<AppEnv>;
  } catch {
    // No Cloudflare runtime; fall through to dev fallback.
  }
  if (!cf || !cf.DB) {
    const { getDevD1 } = await import("./dev-db");
    const DB = await getDevD1();
    return {
      ...(cf ?? {}),
      DB,
      RESEND_API_KEY: cf?.RESEND_API_KEY ?? process.env.RESEND_API_KEY,
      RESEND_WEBHOOK_SECRET:
        cf?.RESEND_WEBHOOK_SECRET ?? process.env.RESEND_WEBHOOK_SECRET,
      ADMIN_PASSWORD: cf?.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "dev",
      ADMIN_COOKIE_SECRET:
        cf?.ADMIN_COOKIE_SECRET ??
        process.env.ADMIN_COOKIE_SECRET ??
        "dev-cookie-secret-replace-in-prod-with-openssl-rand-base64-32",
      isDev: true,
    };
  }
  return cf as AppEnv;
}
