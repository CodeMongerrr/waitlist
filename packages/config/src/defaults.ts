import type {
  AdminConfig,
  OgConfig,
  RateLimitConfig,
  ReferralConfig,
} from "./types";

// Defaults are deliberately conservative. Consumers override per-field.

export const DEFAULT_REFERRAL: ReferralConfig = {
  jumpsPerReferral: 10,
  codeLength: 6,
};

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowSeconds: 3600,
};

export const DEFAULT_OG: OgConfig = {
  cache: "r2",
};

export const DEFAULT_ADMIN: AdminConfig = {
  path: "/admin",
  cookieName: "admin_session",
  sessionTtlSeconds: 86400 * 7,
  loginRateLimit: 10,
};
