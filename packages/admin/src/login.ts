import type { WaitlistConfig } from "@waitlist-stack/config";
import type { WaitlistDb } from "@waitlist-stack/db";
import { checkPassword, mintSessionSetCookie } from "./auth";
import {
  checkAndIncrementLoginAttempt,
  resetLoginAttempts,
} from "./login-rate-limit";
import { getSessionVersion } from "./session";

export interface LoginInput {
  password: string;
  ip: string;
}

export interface LoginEnv {
  /** Expected admin password (from env, never stored in code or db). */
  expectedPassword: string;
  /** Cookie-signing secret (from env). */
  cookieSecret: string;
}

export type LoginResult =
  | { ok: true; setCookie: string }
  | {
      ok: false;
      reason: "rate_limited" | "wrong_password" | "not_configured";
      retryAfterSeconds?: number;
    };

// Login flow: rate-limit check, password compare, mint cookie at current
// session version. Resets the rate-limit row on success so a legit user
// who fat-fingered isn't blocked.

export async function login(
  db: WaitlistDb,
  config: WaitlistConfig,
  env: LoginEnv,
  input: LoginInput,
): Promise<LoginResult> {
  // Treat whitespace-only secrets as unset. Otherwise an operator who types
  // ADMIN_PASSWORD=" " in env would get an admin gated by a single space —
  // checkPassword(" ", " ") returns true.
  //
  // Min length 12 is a defense-in-depth check against a typo'd very-short
  // password. The CLI wizard generates 256-bit base64url (~43 chars), so
  // legitimate users won't trip this.
  if (
    !env.expectedPassword ||
    env.expectedPassword.trim().length < 12 ||
    !env.cookieSecret ||
    env.cookieSecret.trim().length < 12
  ) {
    return { ok: false, reason: "not_configured" };
  }

  const rl = await checkAndIncrementLoginAttempt(db, input.ip, config);
  if (!rl.allowed) {
    return { ok: false, reason: "rate_limited", retryAfterSeconds: rl.retryAfterSeconds };
  }

  if (!checkPassword(input.password, env.expectedPassword)) {
    return { ok: false, reason: "wrong_password" };
  }

  await resetLoginAttempts(db, input.ip);

  const version = await getSessionVersion(db);
  const setCookie = await mintSessionSetCookie(env.cookieSecret, version, {
    cookieName: config.admin.cookieName,
    maxAgeSeconds: config.admin.sessionTtlSeconds,
  });
  return { ok: true, setCookie };
}
