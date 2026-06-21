import {
  DEFAULT_ADMIN,
  DEFAULT_OG,
  DEFAULT_RATE_LIMIT,
  DEFAULT_REFERRAL,
} from "./defaults";
import type { WaitlistConfig } from "./types";

// Partial input that the consumer's `waitlist.config.ts` actually writes.
// Only `brand`, `founder`, and `email` are required; everything else gets
// sensible defaults. Keeps the consumer-facing config short.

export interface DefineConfigInput {
  brand: WaitlistConfig["brand"];
  founder: WaitlistConfig["founder"];
  email: WaitlistConfig["email"];
  referral?: Partial<WaitlistConfig["referral"]>;
  rateLimit?: Partial<WaitlistConfig["rateLimit"]>;
  og?: Partial<WaitlistConfig["og"]>;
  admin?: Partial<WaitlistConfig["admin"]>;
  seo?: WaitlistConfig["seo"];
  pricing?: WaitlistConfig["pricing"];
}

export function defineConfig(input: DefineConfigInput): WaitlistConfig {
  return {
    brand: input.brand,
    founder: input.founder,
    email: input.email,
    referral: { ...DEFAULT_REFERRAL, ...input.referral },
    rateLimit: { ...DEFAULT_RATE_LIMIT, ...input.rateLimit },
    og: { ...DEFAULT_OG, ...input.og },
    admin: { ...DEFAULT_ADMIN, ...input.admin },
    seo: input.seo ?? {},
    pricing: input.pricing,
  };
}
