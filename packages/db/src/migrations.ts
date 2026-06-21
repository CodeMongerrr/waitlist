// Ordered migration list. Apply in sequence with `wrangler d1 migrations apply`
// after copying the .sql files into the consuming app's wrangler migrations
// directory, or read the contents at build time.

export const MIGRATION_FILES = [
  "0001_init.sql",
  "0002_referrals.sql",
  "0003_admin_meta.sql",
  "0004_admin_login_rate_limit.sql",
  "0005_email_status_index.sql",
  "0006_catalyst_fields.sql",
] as const;

export type MigrationFile = (typeof MIGRATION_FILES)[number];
