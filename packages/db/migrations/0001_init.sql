-- Initial schema. Waitlist signups + per-IP rate limit for the signup endpoint.
-- email_status tracks the lifecycle of the welcome email so the admin retry
-- batch can find pending/failed rows without scanning every row.

CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  email_status TEXT NOT NULL DEFAULT 'pending',
  email_attempts INTEGER NOT NULL DEFAULT 0,
  email_last_error TEXT,
  email_sent_at TEXT,
  email_delivered_at TEXT,
  email_bounced_at TEXT,
  resend_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(email_status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at DESC);

CREATE TABLE IF NOT EXISTS rate_limit (
  ip TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TEXT NOT NULL DEFAULT (datetime('now'))
);
