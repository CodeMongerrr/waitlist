import type { WaitlistConfig } from "@waitlist-stack/config";
import type { WaitlistDb } from "@waitlist-stack/db";

export type LoginRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

const WINDOW_MS = 60 * 60 * 1000;

// Per-IP rate limit for /admin/login. Uses its own table
// (admin_login_rate_limit, see migration 0004) to keep the counter
// isolated from the public signup rate limit.
//
// Policy: config.admin.loginRateLimit failed attempts per hour.
// Successful login resets the row so a legit user who fat-fingered
// isn't stuck for an hour after they finally get in.

export async function checkAndIncrementLoginAttempt(
  db: WaitlistDb,
  ip: string,
  config: WaitlistConfig,
  now: Date = new Date(),
): Promise<LoginRateLimitResult> {
  if (!ip || ip === "unknown") return { allowed: true };

  const row = await db.getAdminLoginRateLimit(ip);
  const nowMs = now.getTime();
  const isoNow = toSqliteTimestamp(now);

  if (!row) {
    await db.upsertAdminLoginRateLimit(ip, isoNow);
    return { allowed: true };
  }

  const windowStartMs = parseSqliteTimestamp(row.window_start);
  const ageMs = nowMs - windowStartMs;

  if (ageMs >= WINDOW_MS) {
    await db.resetAdminLoginRateLimit(ip);
    await db.upsertAdminLoginRateLimit(ip, isoNow);
    return { allowed: true };
  }

  if (row.attempts >= config.admin.loginRateLimit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((WINDOW_MS - ageMs) / 1000)),
    };
  }

  await db.upsertAdminLoginRateLimit(ip, row.window_start);
  return { allowed: true };
}

export async function resetLoginAttempts(
  db: WaitlistDb,
  ip: string,
): Promise<void> {
  if (!ip || ip === "unknown") return;
  await db.resetAdminLoginRateLimit(ip);
}

function toSqliteTimestamp(d: Date): string {
  return d.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
}

function parseSqliteTimestamp(s: string): number {
  return Date.parse(s + "Z");
}
