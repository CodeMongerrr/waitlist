import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WaitlistDb } from "@waitlist-stack/db";
import { getSessionVersion, verifySessionFull } from "@waitlist-stack/admin";
import config from "../waitlist.config";
import { env } from "./cf";

// Belt-and-suspenders: middleware already gates /admin/*, but every server
// action and admin route also checks here. If the matcher config ever drifts,
// an unauth'd POST would otherwise become a one-line catastrophe (DB dump,
// mass re-send).

export async function verifyAdmin(): Promise<boolean> {
  const e = await env();
  // Same trim guard as login.ts: whitespace-only secret would still produce a
  // deterministic HMAC, letting an attacker who suspects misconfiguration
  // forge cookies.
  if (!e.ADMIN_COOKIE_SECRET || e.ADMIN_COOKIE_SECRET.trim().length === 0) {
    return false;
  }
  const db = new WaitlistDb(e.DB);
  const store = await cookies();
  const cookieValue = store.get(config.admin.cookieName)?.value;
  const version = await getSessionVersion(db);
  return verifySessionFull(
    cookieValue,
    e.ADMIN_COOKIE_SECRET,
    version,
    config.admin.sessionTtlSeconds,
  );
}

export async function requireAdminOrRedirect(): Promise<void> {
  if (!(await verifyAdmin())) redirect(`${config.admin.path}/login`);
}
