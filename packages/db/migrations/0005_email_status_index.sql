-- Composite index for the admin retry batch. Without it, finding
-- (email_status IN ('pending','failed') ORDER BY created_at DESC) requires a
-- full scan once the table grows past a few thousand rows. The two single-
-- column indexes from 0001 don't compose for this query plan.

CREATE INDEX IF NOT EXISTS idx_waitlist_status_created
  ON waitlist(email_status, created_at DESC);
