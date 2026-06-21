import type { WaitlistDb } from "@waitlist-stack/db";

// DB-backed session-version helpers. Bumping the version revokes every
// active cookie because the HMAC message each was signed against changes.

const SESSION_VERSION_KEY = "session_version";

export async function getSessionVersion(db: WaitlistDb): Promise<number> {
  const row = await db.getAdminMeta(SESSION_VERSION_KEY);
  return row?.value ?? 1;
}

export async function bumpSessionVersion(db: WaitlistDb): Promise<number> {
  return db.bumpAdminMeta(SESSION_VERSION_KEY);
}

// Read the value of a named cookie out of a Cookie header string. Returns
// undefined if the cookie isn't present. Pure string parsing — no Next or
// browser API dependency.
export function readCookie(
  cookieHeader: string | null | undefined,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const p of parts) {
    if (p.startsWith(`${name}=`)) return p.slice(name.length + 1);
  }
  return undefined;
}
