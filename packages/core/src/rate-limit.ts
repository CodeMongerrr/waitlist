import type { WaitlistDb } from "@waitlist-stack/db";
import type { RateLimitConfig } from "@waitlist-stack/config";

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

// Sliding-window rate limiter keyed by IP. Window starts on first request;
// when the window expires, attempts reset to 1. Within the window, each
// request bumps attempts by 1. When attempts > maxAttempts, requests are
// rejected with the seconds left in the window.
//
// TOCTOU note: the read-then-upsert sequence is not transactional, so two
// requests that arrive concurrently from the same IP can both observe the
// same `attempts` count and both pass the maxAttempts check. The window
// then increments by 2 instead of 1. The bypass is bounded by request
// concurrency, not exploitable for unbounded abuse — D1 doesn't expose
// SELECT...FOR UPDATE, so we accept the bound. If you need strict caps,
// front this with a Durable Object keyed on IP.

export async function checkRateLimit(
  db: WaitlistDb,
  ip: string,
  config: RateLimitConfig,
  now: Date = new Date(),
): Promise<RateLimitResult> {
  if (ip === "unknown" || !ip) {
    return { allowed: true, remaining: config.maxAttempts };
  }
  const existing = await db.getRateLimit(ip);
  const nowMs = now.getTime();
  const windowMs = config.windowSeconds * 1000;
  const isoNow = toSqliteTimestamp(now);

  if (!existing) {
    await db.upsertRateLimit(ip, isoNow);
    return { allowed: true, remaining: config.maxAttempts - 1 };
  }

  const windowStartMs = parseSqliteTimestamp(existing.window_start);
  const ageMs = nowMs - windowStartMs;

  if (ageMs >= windowMs) {
    await db.resetRateLimit(ip, isoNow);
    return { allowed: true, remaining: config.maxAttempts - 1 };
  }

  if (existing.attempts >= config.maxAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((windowMs - ageMs) / 1000),
    };
  }

  await db.upsertRateLimit(ip, existing.window_start);
  return {
    allowed: true,
    remaining: config.maxAttempts - existing.attempts - 1,
  };
}

// SQLite stores TEXT timestamps without a timezone suffix; appending Z lets
// Date.parse interpret them as UTC. Format matches datetime('now').
function toSqliteTimestamp(d: Date): string {
  return d.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
}

function parseSqliteTimestamp(s: string): number {
  return Date.parse(s + "Z");
}
