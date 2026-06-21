-- Admin session-version table. Lets the server invalidate all admin sessions
-- at once (e.g. on logout or if a cookie is suspected stolen) without rotating
-- ADMIN_COOKIE_SECRET. The version is included in the HMAC message of every
-- session cookie; bumping it makes every existing cookie's signature stop
-- matching, forcing re-login.

CREATE TABLE IF NOT EXISTS admin_meta (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);

INSERT OR IGNORE INTO admin_meta (key, value) VALUES ('session_version', 1);
