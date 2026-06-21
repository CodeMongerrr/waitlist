// Row types mirror the schema in migrations/. SQLite stores TEXT for both
// strings and ISO timestamps; the columns are typed as string here and parsed
// at the boundary where a Date is needed.

export type EmailStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "bounced"
  | "failed";

export interface WaitlistRow {
  id: number;
  name: string;
  email: string;
  source: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  email_status: EmailStatus;
  email_attempts: number;
  email_last_error: string | null;
  email_sent_at: string | null;
  email_delivered_at: string | null;
  email_bounced_at: string | null;
  resend_id: string | null;
  referral_code: string | null;
  referred_by: string | null;
  referral_count: number;
  /** Optional X handle captured at signup (without leading @). */
  x_handle: string | null;
  /** Self-reported X tier: "starting" | "growing" | "established". */
  tier: string | null;
}

export interface RateLimitRow {
  ip: string;
  attempts: number;
  window_start: string;
}

export interface AdminMetaRow {
  key: string;
  value: number;
}

export interface AdminLoginRateLimitRow {
  ip: string;
  attempts: number;
  window_start: string;
}
