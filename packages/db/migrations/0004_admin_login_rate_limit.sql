-- Per-IP rate limit for /admin/login attempts. Separate from the waitlist
-- rate_limit table so the two limits don't share a counter.
--
-- Policy applied in code: 10 failed attempts per IP per hour. Successful
-- login resets the row.

CREATE TABLE IF NOT EXISTS admin_login_rate_limit (
  ip TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_login_rl_window ON admin_login_rate_limit(window_start);
