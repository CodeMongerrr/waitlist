-- Referral skip-the-queue mechanic. Each row gets a unique short referral_code.
-- When someone signs up with ?ref=<code>, the referrer's referral_count
-- increments. Displayed queue position is (rank by created_at) -
-- referral_count * JUMPS_PER_REFERRAL, clamped to 1.

ALTER TABLE waitlist ADD COLUMN referral_code TEXT;
ALTER TABLE waitlist ADD COLUMN referred_by TEXT;
ALTER TABLE waitlist ADD COLUMN referral_count INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by ON waitlist(referred_by);
