// Single source of truth for product-specific config. The CLI wizard
// (`pnpm create waitlist-stack`) writes a populated `waitlist.config.ts`
// into the consumer's project that exports a `WaitlistConfig` matching
// these types. Every other package reads from that config.
//
// Plain TS, not Zod: vibecoders fork and edit; TS errors at build time
// are clearer than runtime parse errors and there's one fewer dep.

export interface BrandConfig {
  /** Display name. Appears in subject lines, OG images, JSON-LD, page titles. */
  name: string;
  /** One-sentence description used in meta tags + JSON-LD. */
  tagline: string;
  /** Longer pitch used in JSON-LD `description` and llms.txt. */
  description: string;
  /** Canonical site origin. No trailing slash. e.g. "https://your-app.com". */
  siteUrl: string;
  /** Optional contact email for unsubscribe headers + footer. */
  contactEmail?: string;
}

export interface FounderConfig {
  /** Real name. Goes in JSON-LD Organization.founder + email signature. */
  name: string;
  /** Twitter/X handle without the @. Linked from welcome email + footer. */
  twitterHandle?: string;
  /** GitHub repo URL. Used in JSON-LD `sameAs` and footer. */
  githubUrl?: string;
}

export interface ReferralConfig {
  /** Queue jumps awarded per successful referral. Default 10. */
  jumpsPerReferral: number;
  /** Length of generated referral codes (Crockford base32). Default 6. */
  codeLength: number;
}

export interface RateLimitConfig {
  /** Max signup attempts per IP per window. Default 5. */
  maxAttempts: number;
  /** Window length in seconds. Default 3600 (1 hour). */
  windowSeconds: number;
}

export interface EmailConfig {
  /** Provider. Resend ships in-box; Postmark/SendGrid require an adapter. */
  provider: "resend" | "postmark" | "sendgrid";
  /** From address. Must be on a domain you've verified with the provider. */
  fromAddress: string;
  /** From display name. Shown in inbox preview. */
  fromName: string;
  /** Optional reply-to. If unset, replies go to fromAddress. */
  replyTo?: string;
}

export interface OgConfig {
  /** Title shown in the OG card hero. Falls back to brand.name. */
  title?: string;
  /** Subtitle shown under the title. Falls back to brand.tagline. */
  subtitle?: string;
  /**
   * Cache strategy. "r2" caches rendered images in R2 keyed by
   * <code>:<position>:<referralCount>. "memory" disables persistent cache
   * (re-renders on every request — fine for low traffic).
   */
  cache: "r2" | "memory";
}

export interface AdminConfig {
  /** Path the admin dashboard mounts at. Default "/admin". */
  path: string;
  /** Cookie name. Default "admin_session". */
  cookieName: string;
  /** Session lifetime in seconds. Default 86400 * 7 (7 days). */
  sessionTtlSeconds: number;
  /** Failed-login attempts per IP per hour before lockout. Default 10. */
  loginRateLimit: number;
}

export interface SeoConfig {
  /**
   * Optional path to a hand-written llms.txt. If set, served as-is.
   * If unset, a default llms.txt is generated from brand + features.
   */
  llmsTxtPath?: string;
  /** Comma-separated keywords for meta tags. */
  keywords?: string[];
}

export interface PricingOffer {
  name: string;
  price: number;
  currency: string;
  description?: string;
  /** Cap on Pre-Order availability. Used for founding-cohort offers. */
  maxQuantity?: number;
}

export interface WaitlistConfig {
  brand: BrandConfig;
  founder: FounderConfig;
  referral: ReferralConfig;
  rateLimit: RateLimitConfig;
  email: EmailConfig;
  og: OgConfig;
  admin: AdminConfig;
  seo: SeoConfig;
  /** Optional pricing tiers. Rendered in JSON-LD SoftwareApplication.offers. */
  pricing?: PricingOffer[];
}
