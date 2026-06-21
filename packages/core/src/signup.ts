import type { WaitlistConfig } from "@waitlist-stack/config";
import type { WaitlistDb, WaitlistRow } from "@waitlist-stack/db";
import { isValidEmail } from "./email-check";
import { generateReferralCode, isValidReferralCode } from "./referrals";
import { checkRateLimit } from "./rate-limit";

const REFERRAL_CODE_RETRIES = 5;

export interface SignupInput {
  name: string;
  email: string;
  /** Where the signup came from (utm_source-equivalent). Capped at 32 chars. */
  source?: string;
  /** Referral code from ?ref=<code>. Validated and existence-checked. */
  ref?: string;
  /**
   * Honeypot field. Must be empty/undefined. Named `website_url` rather than
   * the obvious `company`/`url` so that bots auto-filling all visible-looking
   * fields trip it instead of skipping a known honeypot name.
   */
  website_url?: string;
  /** Client IP for rate limiting. Pass "unknown" to skip. */
  ip: string;
  /** User agent for the signup record. Optional. */
  userAgent?: string;
  /** Optional X handle (without leading @). Normalized by the caller. */
  x_handle?: string | null;
  /** Optional self-reported X tier. Validated by the caller. */
  tier?: string | null;
}

export type SignupResult =
  | {
      ok: true;
      duplicate: false;
      row: WaitlistRow;
      referralCode: string;
      position: number | null;
      referralCount: number;
    }
  | {
      ok: true;
      duplicate: true;
      referralCode: string | null;
      position: number | null;
      referralCount: number;
    }
  | {
      ok: false;
      error: "validation" | "rate_limited" | "honeypot" | "unknown";
      message: string;
      retryAfterSeconds?: number;
    };

// Pure orchestration: validation, honeypot, rate-limit, referral resolution,
// insert with collision retry, referrer credit, position lookup. Email send
// is the caller's responsibility (orthogonal to the signup transaction so a
// transient email outage doesn't block signups).

export async function signup(
  db: WaitlistDb,
  config: WaitlistConfig,
  input: SignupInput,
): Promise<SignupResult> {
  // Honeypot. Bots fill every field; humans don't see this one.
  if (typeof input.website_url === "string" && input.website_url.length > 0) {
    return { ok: true, duplicate: true, referralCode: null, position: null, referralCount: 0 };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "validation", message: "your first name, at least." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "validation", message: "that email looks off." };
  }

  const rl = await checkRateLimit(db, input.ip, config.rateLimit);
  if (!rl.allowed) {
    return {
      ok: false,
      error: "rate_limited",
      message: "easy there. try again later.",
      retryAfterSeconds: rl.retryAfterSeconds,
    };
  }

  // Resolve referrer if a valid code was provided AND it actually exists.
  // Self-referral via the same email is blocked.
  let referredBy: string | null = null;
  if (isValidReferralCode(input.ref, config.referral.codeLength)) {
    const referrer = await db.findByReferralCode(input.ref);
    if (referrer && referrer.email !== email) {
      referredBy = input.ref;
    }
  }

  const source =
    typeof input.source === "string" && input.source.length <= 32
      ? input.source
      : "unknown";

  // Generate a unique referral_code. Unique index rejects collisions; retry
  // with a fresh code up to REFERRAL_CODE_RETRIES times before giving up.
  let row: WaitlistRow | null = null;
  let lastErr: unknown = null;
  for (let i = 0; i < REFERRAL_CODE_RETRIES && !row; i++) {
    const code = generateReferralCode(config.referral.codeLength);
    try {
      row = await db.insertSignup({
        name,
        email,
        source,
        ip: input.ip || null,
        user_agent: input.userAgent ?? null,
        referral_code: code,
        referred_by: referredBy,
        x_handle: input.x_handle ?? null,
        tier: input.tier ?? null,
      });
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      // SQLite UNIQUE constraint: collision on referral_code or email.
      // Email collision is handled below as duplicate; code collision retries.
      if (!msg.includes("UNIQUE")) throw err;
      if (msg.includes("email")) break;
    }
  }

  // Duplicate email path. Return the existing row's position so the UI can
  // show "you're already on the list, you're #N".
  if (!row) {
    const existing = await db.findByEmail(email);
    if (existing?.referral_code) {
      const pos = await db.positionFor(
        existing.referral_code,
        config.referral.jumpsPerReferral,
      );
      return {
        ok: true,
        duplicate: true,
        referralCode: existing.referral_code,
        position: pos?.position ?? null,
        referralCount: pos?.referralCount ?? 0,
      };
    }
    if (existing) {
      return { ok: true, duplicate: true, referralCode: null, position: null, referralCount: 0 };
    }
    return {
      ok: false,
      error: "unknown",
      message: lastErr instanceof Error ? lastErr.message : "could not create signup",
    };
  }

  if (referredBy) {
    await db.incrementReferralCount(referredBy);
  }

  const pos = await db.positionFor(
    row.referral_code!,
    config.referral.jumpsPerReferral,
  );

  return {
    ok: true,
    duplicate: false,
    row,
    referralCode: row.referral_code!,
    position: pos?.position ?? null,
    referralCount: pos?.referralCount ?? 0,
  };
}
