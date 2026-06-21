"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { WaitlistDb } from "@waitlist-stack/db";
import {
  bumpSessionVersion,
  clearSessionSetCookie,
  login,
} from "@waitlist-stack/admin";
import { sendWelcome } from "@waitlist-stack/email";
import config from "../../waitlist.config";
import { env } from "../../lib/cf";
import { requireAdminOrRedirect } from "../../lib/admin-guard";
import { safeNextOr } from "../../lib/safe-next";

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  // Open-redirect guard: only accept strictly-relative paths for `next`.
  const next = safeNextOr(formData.get("next"), config.admin.path);

  const e = await env();
  const db = new WaitlistDb(e.DB);
  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const result = await login(
    db,
    config,
    {
      expectedPassword: e.ADMIN_PASSWORD ?? "",
      cookieSecret: e.ADMIN_COOKIE_SECRET ?? "",
    },
    { password, ip },
  );

  if (!result.ok) {
    if (result.reason === "rate_limited") {
      return { error: `too many attempts. retry in ${result.retryAfterSeconds}s.` };
    }
    if (result.reason === "wrong_password") {
      return { error: "wrong password." };
    }
    return { error: "admin auth not configured." };
  }

  const cookieValue = result.setCookie.split(";")[0].split("=").slice(1).join("=");
  const store = await cookies();
  store.set(config.admin.cookieName, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: config.admin.sessionTtlSeconds,
  });
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  // No auth check on logout: anyone clicking sign-out should be allowed to
  // clear their own cookie. Bumping the DB session version invalidates every
  // active cookie server-side too.
  const e = await env();
  const db = new WaitlistDb(e.DB);
  await bumpSessionVersion(db);
  const setCookie = clearSessionSetCookie(config.admin.cookieName);
  const cookieValue = setCookie.split(";")[0].split("=").slice(1).join("=");
  const store = await cookies();
  store.set(config.admin.cookieName, cookieValue, { maxAge: 0 });
  redirect(`${config.admin.path}/login`);
}

export interface RetryBatchResult {
  attempted: number;
  sent: number;
  errors: number;
  /** Resend returned 429. Could be the per-day or per-month free-tier cap. */
  hitProviderRateLimit: boolean;
}

const RETRY_BATCH_LIMIT = 100;

export async function retryFailedEmailsAction(): Promise<RetryBatchResult> {
  await requireAdminOrRedirect();
  const e = await env();
  const db = new WaitlistDb(e.DB);
  if (!e.RESEND_API_KEY) {
    return { attempted: 0, sent: 0, errors: 0, hitProviderRateLimit: false };
  }

  const rows = await db.findPendingOrFailed(RETRY_BATCH_LIMIT);
  let sent = 0;
  let errors = 0;
  let hitProviderRateLimit = false;

  for (const row of rows) {
    if (!row.referral_code) {
      errors++;
      continue;
    }
    // Re-look-up position so retries reflect the current queue state, not the
    // position the row had when it first signed up.
    const pos = await db.positionFor(row.referral_code, config.referral.jumpsPerReferral);
    const r = await sendWelcome(db, config, {
      apiKey: e.RESEND_API_KEY,
      recipient: { id: row.id, email: row.email, name: row.name },
      referralCode: row.referral_code,
      position: pos?.position ?? null,
    });
    if (r.ok) {
      sent++;
      continue;
    }
    if (r.rateLimited) {
      hitProviderRateLimit = true;
      break;
    }
    errors++;
  }

  revalidatePath(config.admin.path);
  return { attempted: rows.length, sent, errors, hitProviderRateLimit };
}

export interface ResendOneResult {
  ok: boolean;
  error?: string;
  rateLimited?: boolean;
}

export async function resendOneEmailAction(formData: FormData): Promise<ResendOneResult> {
  await requireAdminOrRedirect();
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" ? parseInt(idRaw, 10) : NaN;
  if (!Number.isFinite(id)) return { ok: false, error: "bad id" };

  const e = await env();
  const db = new WaitlistDb(e.DB);
  if (!e.RESEND_API_KEY) return { ok: false, error: "resend not configured" };

  const row = await db
    .raw()
    .prepare("SELECT id, name, email, referral_code FROM waitlist WHERE id = ?")
    .bind(id)
    .first<{ id: number; name: string; email: string; referral_code: string | null }>();
  if (!row || !row.referral_code) return { ok: false, error: "not found" };

  const pos = await db.positionFor(row.referral_code, config.referral.jumpsPerReferral);
  const r = await sendWelcome(db, config, {
    apiKey: e.RESEND_API_KEY,
    recipient: { id: row.id, email: row.email, name: row.name },
    referralCode: row.referral_code,
    position: pos?.position ?? null,
  });
  revalidatePath(config.admin.path);
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error, rateLimited: r.rateLimited };
}
