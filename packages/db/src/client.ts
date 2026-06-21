import type { D1Database } from "@cloudflare/workers-types";
import type {
  AdminLoginRateLimitRow,
  AdminMetaRow,
  RateLimitRow,
  WaitlistRow,
} from "./types";

// Thin typed wrapper over D1. Methods are intentionally narrow: each one
// corresponds to a specific access pattern used by core/admin/email packages.
// New queries should be added here rather than callers hand-writing SQL.

export class WaitlistDb {
  constructor(private readonly d1: D1Database) {}

  raw(): D1Database {
    return this.d1;
  }

  async findByEmail(email: string): Promise<WaitlistRow | null> {
    const row = await this.d1
      .prepare("SELECT * FROM waitlist WHERE email = ?")
      .bind(email)
      .first<WaitlistRow>();
    return row ?? null;
  }

  async findByReferralCode(code: string): Promise<WaitlistRow | null> {
    const row = await this.d1
      .prepare("SELECT * FROM waitlist WHERE referral_code = ?")
      .bind(code)
      .first<WaitlistRow>();
    return row ?? null;
  }

  async insertSignup(input: {
    name: string;
    email: string;
    source: string | null;
    ip: string | null;
    user_agent: string | null;
    referral_code: string;
    referred_by: string | null;
    x_handle?: string | null;
    tier?: string | null;
  }): Promise<WaitlistRow> {
    const result = await this.d1
      .prepare(
        `INSERT INTO waitlist
          (name, email, source, ip, user_agent, referral_code, referred_by, x_handle, tier)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`,
      )
      .bind(
        input.name,
        input.email,
        input.source,
        input.ip,
        input.user_agent,
        input.referral_code,
        input.referred_by,
        input.x_handle ?? null,
        input.tier ?? null,
      )
      .first<WaitlistRow>();
    if (!result) {
      throw new Error("insertSignup: D1 returned no row");
    }
    return result;
  }

  async incrementReferralCount(referralCode: string): Promise<void> {
    await this.d1
      .prepare(
        "UPDATE waitlist SET referral_count = referral_count + 1 WHERE referral_code = ?",
      )
      .bind(referralCode)
      .run();
  }

  // Effective queue position for a given referral_code. Position depends on
  // EVERYONE's effective score (base_rank - referrals * jumps), not just the
  // caller's, because other people's referrals shift you down. Tiebreak by id
  // so two rows with the same effective_score get distinct positions.
  async positionFor(
    referralCode: string,
    jumpsPerReferral: number,
  ): Promise<{
    position: number;
    baseRank: number;
    referralCount: number;
  } | null> {
    const row = await this.d1
      .prepare(
        `WITH ranked AS (
           SELECT id, referral_code, referral_count,
             ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS base_rank
           FROM waitlist
         ),
         scored AS (
           SELECT id, referral_code, referral_count, base_rank,
             (base_rank - referral_count * ?) AS effective_score
           FROM ranked
         ),
         me AS (
           SELECT id, base_rank, referral_count, effective_score
           FROM scored
           WHERE referral_code = ?
         )
         SELECT
           me.base_rank      AS base_rank,
           me.referral_count AS referral_count,
           (
             SELECT 1 + COUNT(*)
             FROM scored s
             WHERE s.effective_score < me.effective_score
                OR (s.effective_score = me.effective_score AND s.id < me.id)
           ) AS position
         FROM me`,
      )
      .bind(jumpsPerReferral, referralCode)
      .first<{ base_rank: number; referral_count: number; position: number }>();
    if (!row) return null;
    return {
      position: Math.max(1, row.position),
      baseRank: row.base_rank,
      referralCount: row.referral_count ?? 0,
    };
  }

  async totalSignups(): Promise<number> {
    const row = await this.d1
      .prepare("SELECT COUNT(*) AS n FROM waitlist")
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async leaderboard(limit: number): Promise<
    Array<Pick<WaitlistRow, "name" | "referral_count" | "referral_code">>
  > {
    const result = await this.d1
      .prepare(
        `SELECT name, referral_count, referral_code FROM waitlist
         WHERE referral_count > 0
         ORDER BY referral_count DESC, created_at ASC
         LIMIT ?`,
      )
      .bind(limit)
      .all<Pick<WaitlistRow, "name" | "referral_count" | "referral_code">>();
    return result.results ?? [];
  }

  // ---------- email status (used by webhook + admin retry) ----------

  async markEmailSent(id: number, resendId: string): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE waitlist
         SET email_status = 'sent',
             email_sent_at = datetime('now'),
             email_attempts = email_attempts + 1,
             resend_id = ?
         WHERE id = ?`,
      )
      .bind(resendId, id)
      .run();
  }

  async markEmailFailed(id: number, error: string): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE waitlist
         SET email_status = 'failed',
             email_last_error = ?,
             email_attempts = email_attempts + 1
         WHERE id = ?`,
      )
      .bind(error, id)
      .run();
  }

  async markEmailDelivered(resendId: string): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE waitlist
         SET email_status = 'delivered',
             email_delivered_at = datetime('now')
         WHERE resend_id = ?`,
      )
      .bind(resendId)
      .run();
  }

  async markEmailBounced(resendId: string): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE waitlist
         SET email_status = 'bounced',
             email_bounced_at = datetime('now')
         WHERE resend_id = ?`,
      )
      .bind(resendId)
      .run();
  }

  async findPendingOrFailed(limit: number): Promise<WaitlistRow[]> {
    const result = await this.d1
      .prepare(
        `SELECT * FROM waitlist
         WHERE email_status IN ('pending', 'failed')
         ORDER BY created_at DESC
         LIMIT ?`,
      )
      .bind(limit)
      .all<WaitlistRow>();
    return result.results ?? [];
  }

  // ---------- rate limit ----------

  async getRateLimit(ip: string): Promise<RateLimitRow | null> {
    const row = await this.d1
      .prepare("SELECT * FROM rate_limit WHERE ip = ?")
      .bind(ip)
      .first<RateLimitRow>();
    return row ?? null;
  }

  async upsertRateLimit(ip: string, windowStart: string): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO rate_limit (ip, attempts, window_start)
         VALUES (?, 1, ?)
         ON CONFLICT(ip) DO UPDATE SET
           attempts = attempts + 1,
           window_start = CASE
             WHEN excluded.window_start > rate_limit.window_start THEN excluded.window_start
             ELSE rate_limit.window_start
           END`,
      )
      .bind(ip, windowStart)
      .run();
  }

  async resetRateLimit(ip: string, windowStart: string): Promise<void> {
    await this.d1
      .prepare(
        "UPDATE rate_limit SET attempts = 1, window_start = ? WHERE ip = ?",
      )
      .bind(windowStart, ip)
      .run();
  }

  // ---------- admin meta ----------

  async getAdminMeta(key: string): Promise<AdminMetaRow | null> {
    const row = await this.d1
      .prepare("SELECT * FROM admin_meta WHERE key = ?")
      .bind(key)
      .first<AdminMetaRow>();
    return row ?? null;
  }

  async bumpAdminMeta(key: string): Promise<number> {
    const row = await this.d1
      .prepare(
        `INSERT INTO admin_meta (key, value) VALUES (?, 1)
         ON CONFLICT(key) DO UPDATE SET value = value + 1
         RETURNING value`,
      )
      .bind(key)
      .first<{ value: number }>();
    return row?.value ?? 1;
  }

  // ---------- admin login rate limit ----------

  async getAdminLoginRateLimit(
    ip: string,
  ): Promise<AdminLoginRateLimitRow | null> {
    const row = await this.d1
      .prepare("SELECT * FROM admin_login_rate_limit WHERE ip = ?")
      .bind(ip)
      .first<AdminLoginRateLimitRow>();
    return row ?? null;
  }

  async upsertAdminLoginRateLimit(
    ip: string,
    windowStart: string,
  ): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO admin_login_rate_limit (ip, attempts, window_start)
         VALUES (?, 1, ?)
         ON CONFLICT(ip) DO UPDATE SET
           attempts = attempts + 1,
           window_start = CASE
             WHEN excluded.window_start > admin_login_rate_limit.window_start THEN excluded.window_start
             ELSE admin_login_rate_limit.window_start
           END`,
      )
      .bind(ip, windowStart)
      .run();
  }

  async resetAdminLoginRateLimit(ip: string): Promise<void> {
    await this.d1
      .prepare("DELETE FROM admin_login_rate_limit WHERE ip = ?")
      .bind(ip)
      .run();
  }
}
