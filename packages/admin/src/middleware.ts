import type { WaitlistConfig } from "@waitlist-stack/config";
import { verifyCookieSignature } from "./auth";
import { readCookie } from "./session";

export type AuthDecision =
  | { allow: true }
  | { allow: false; reason: "not_configured" | "redirect"; redirectTo?: string };

export interface MiddlewareInput {
  /** request URL pathname, e.g. "/admin/users" */
  pathname: string;
  /** raw Cookie header from the request */
  cookieHeader: string | null;
  /** ADMIN_COOKIE_SECRET from the environment */
  cookieSecret: string | undefined;
  config: WaitlistConfig;
}

// Pure auth gate. Caller wraps this in their framework's middleware
// (Next middleware.ts, Hono, plain Workers, anything). Cheap: HMAC +
// expiry only, no DB. Full version check happens at the handler level.

export async function checkAdminMiddleware(
  input: MiddlewareInput,
): Promise<AuthDecision> {
  const adminPath = input.config.admin.path;
  const loginPath = `${adminPath}/login`;

  // The login page itself is public.
  if (input.pathname === loginPath) {
    return { allow: true };
  }
  // Anything outside /admin is none of our concern.
  if (!input.pathname.startsWith(adminPath)) {
    return { allow: true };
  }

  if (!input.cookieSecret) {
    return { allow: false, reason: "not_configured" };
  }

  const cookieValue = readCookie(input.cookieHeader, input.config.admin.cookieName);
  const parsed = await verifyCookieSignature(
    cookieValue,
    input.cookieSecret,
    input.config.admin.sessionTtlSeconds,
  );
  if (!parsed) {
    const next = encodeURIComponent(input.pathname);
    return {
      allow: false,
      reason: "redirect",
      redirectTo: `${loginPath}?next=${next}`,
    };
  }
  return { allow: true };
}
