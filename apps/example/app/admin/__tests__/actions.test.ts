import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// actions.ts pulls in the Cloudflare env accessor, the D1 client, the admin
// crypto package (login/session helpers), the email sender, next/headers
// cookies, next/navigation redirect, and the admin guard. We mock every
// boundary so the unit under test is the action wiring itself: which guard it
// calls, what cookie it sets, where it redirects, and the result shapes it
// documents (RetryBatchResult / ResendOneResult). No real cookies, DB, crypto,
// email, or Cloudflare runtime.

const envMock = vi.fn();

const cookieSetMock = vi.fn();
const cookiesMock = vi.fn(async () => ({ set: cookieSetMock }));

const headersGetMock = vi.fn();
const headersMock = vi.fn(async () => ({ get: headersGetMock }));

const redirectMock = vi.fn();
const revalidatePathMock = vi.fn();

const loginMock = vi.fn();
const bumpSessionVersionMock = vi.fn(async () => 1);
const clearSessionSetCookieMock = vi.fn(() => "admin_session=; Path=/; Max-Age=0");

const sendWelcomeMock = vi.fn();

const requireAdminOrRedirectMock = vi.fn(async () => {});

// DB stand-in: each action does `new WaitlistDb(e.DB)` then calls a handful of
// query methods. We back the constructed instance with controllable spies.
const dbFindPendingOrFailed = vi.fn(async () => [] as unknown[]);
const dbPositionFor = vi.fn(async () => ({ position: 1 }));
const dbRawFirst = vi.fn(async () => null as unknown);
const dbRaw = vi.fn(() => ({
  prepare: () => ({
    bind: () => ({ first: dbRawFirst }),
  }),
}));
const waitlistDbCtor = vi.fn();

vi.mock("@/lib/cf", () => ({
  env: () => envMock(),
}));

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
  headers: () => headersMock(),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirectMock(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

vi.mock("@waitlist-stack/db", () => ({
  WaitlistDb: class {
    constructor(...args: unknown[]) {
      waitlistDbCtor(...args);
    }
    findPendingOrFailed(...args: unknown[]) {
      return dbFindPendingOrFailed(...args);
    }
    positionFor(...args: unknown[]) {
      return dbPositionFor(...args);
    }
    raw() {
      return dbRaw();
    }
  },
}));

vi.mock("@waitlist-stack/admin", () => ({
  login: (...args: unknown[]) => loginMock(...args),
  bumpSessionVersion: (...args: unknown[]) => bumpSessionVersionMock(...args),
  clearSessionSetCookie: (...args: unknown[]) => clearSessionSetCookieMock(...args),
}));

vi.mock("@waitlist-stack/email", () => ({
  sendWelcome: (...args: unknown[]) => sendWelcomeMock(...args),
}));

vi.mock("@/lib/admin-guard", () => ({
  requireAdminOrRedirect: () => requireAdminOrRedirectMock(),
}));

// Real config: import after mocks so we assert against true cookieName/path.
import config from "@/waitlist.config";
import {
  loginAction,
  logoutAction,
  retryFailedEmailsAction,
  resendOneEmailAction,
} from "@/app/admin/actions";

const validEnv = () => ({
  DB: { __d1: true },
  ADMIN_PASSWORD: "a-real-admin-password",
  ADMIN_COOKIE_SECRET: "a-real-secret-value-1234",
  RESEND_API_KEY: "re_test_key",
});

const fd = (entries: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
};

beforeEach(() => {
  envMock.mockReset().mockResolvedValue(validEnv());
  cookieSetMock.mockReset();
  headersGetMock.mockReset().mockReturnValue("203.0.113.7");
  redirectMock.mockReset();
  revalidatePathMock.mockReset();
  loginMock.mockReset();
  bumpSessionVersionMock.mockReset().mockResolvedValue(1);
  clearSessionSetCookieMock.mockReset().mockReturnValue("admin_session=; Path=/; Max-Age=0");
  sendWelcomeMock.mockReset();
  requireAdminOrRedirectMock.mockReset().mockResolvedValue(undefined);
  dbFindPendingOrFailed.mockReset().mockResolvedValue([]);
  dbPositionFor.mockReset().mockResolvedValue({ position: 1 });
  dbRawFirst.mockReset().mockResolvedValue(null);
  dbRaw.mockClear();
  waitlistDbCtor.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("loginAction", () => {
  it("sets the session cookie and redirects on a correct password", async () => {
    loginMock.mockResolvedValue({ ok: true, setCookie: "admin_session=signed.payload; Path=/; HttpOnly" });

    const res = await loginAction(fd({ password: "a-real-admin-password" }));

    // Success path ends in redirect(next); no error object is returned.
    // (In prod, redirect() throws to halt; the mock records the call instead.)
    expect(res).toBeUndefined();

    // Cookie is set under the configured name with the parsed value.
    expect(cookieSetMock).toHaveBeenCalledTimes(1);
    const [name, value, opts] = cookieSetMock.mock.calls[0];
    expect(name).toBe(config.admin.cookieName);
    expect(value).toBe("signed.payload");
    expect(opts).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: config.admin.sessionTtlSeconds,
    });

    // Redirects to the default admin path when no `next` is provided.
    expect(redirectMock).toHaveBeenCalledWith(config.admin.path);
  });

  it("forwards a safe relative `next` to the redirect", async () => {
    loginMock.mockResolvedValue({ ok: true, setCookie: "admin_session=v; Path=/" });

    await loginAction(fd({ password: "a-real-admin-password", next: "/admin/users?x=1" }));

    expect(redirectMock).toHaveBeenCalledWith("/admin/users?x=1");
  });

  it("ignores an unsafe open-redirect `next` and falls back to the admin path", async () => {
    loginMock.mockResolvedValue({ ok: true, setCookie: "admin_session=v; Path=/" });

    await loginAction(fd({ password: "a-real-admin-password", next: "//evil.com" }));

    expect(redirectMock).toHaveBeenCalledWith(config.admin.path);
    expect(redirectMock).not.toHaveBeenCalledWith("//evil.com");
  });

  it("returns 'wrong password.' without setting a cookie or redirecting on a bad password", async () => {
    loginMock.mockResolvedValue({ ok: false, reason: "wrong_password" });

    const res = await loginAction(fd({ password: "nope" }));

    expect(res).toEqual({ error: "wrong password." });
    expect(cookieSetMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("surfaces a rate-limit message with the retry window", async () => {
    loginMock.mockResolvedValue({ ok: false, reason: "rate_limited", retryAfterSeconds: 42 });

    const res = await loginAction(fd({ password: "a-real-admin-password" }));

    expect(res.error).toMatch(/too many attempts/i);
    expect(res.error).toContain("42");
    expect(cookieSetMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("returns a not-configured message for any other failure reason", async () => {
    loginMock.mockResolvedValue({ ok: false, reason: "not_configured" });

    const res = await loginAction(fd({ password: "" }));

    expect(res).toEqual({ error: "admin auth not configured." });
  });

  it("passes the client IP and configured secrets through to login()", async () => {
    loginMock.mockResolvedValue({ ok: true, setCookie: "admin_session=v; Path=/" });
    headersGetMock.mockImplementation((h: string) =>
      h === "cf-connecting-ip" ? "198.51.100.9" : null,
    );

    await loginAction(fd({ password: "a-real-admin-password" }));

    expect(loginMock).toHaveBeenCalledTimes(1);
    const args = loginMock.mock.calls[0];
    // args: (db, config, env, { password, ip })
    expect(args[2]).toMatchObject({
      expectedPassword: "a-real-admin-password",
      cookieSecret: "a-real-secret-value-1234",
    });
    expect(args[3]).toMatchObject({ password: "a-real-admin-password", ip: "198.51.100.9" });
  });
});

describe("logoutAction", () => {
  it("bumps the session version, clears the cookie, and redirects to login", async () => {
    await logoutAction();

    // Server-side revocation of every active session.
    expect(bumpSessionVersionMock).toHaveBeenCalledTimes(1);
    // Clears the configured cookie name with maxAge: 0.
    expect(clearSessionSetCookieMock).toHaveBeenCalledWith(config.admin.cookieName);
    expect(cookieSetMock).toHaveBeenCalledTimes(1);
    const [name, , opts] = cookieSetMock.mock.calls[0];
    expect(name).toBe(config.admin.cookieName);
    expect(opts).toMatchObject({ maxAge: 0 });

    expect(redirectMock).toHaveBeenCalledWith(`${config.admin.path}/login`);
  });

  it("does not require admin auth (anyone may clear their own cookie)", async () => {
    await logoutAction();
    expect(requireAdminOrRedirectMock).not.toHaveBeenCalled();
  });
});

describe("retryFailedEmailsAction", () => {
  it("checks admin auth before doing any work", async () => {
    // No RESEND key -> early return, but guard must still have run first.
    envMock.mockResolvedValue({ ...validEnv(), RESEND_API_KEY: undefined });

    await retryFailedEmailsAction();

    expect(requireAdminOrRedirectMock).toHaveBeenCalledTimes(1);
  });

  it("returns a zeroed result and never queries when RESEND_API_KEY is absent", async () => {
    envMock.mockResolvedValue({ ...validEnv(), RESEND_API_KEY: undefined });

    const res = await retryFailedEmailsAction();

    expect(res).toEqual({ attempted: 0, sent: 0, errors: 0, hitProviderRateLimit: false });
    expect(dbFindPendingOrFailed).not.toHaveBeenCalled();
    expect(sendWelcomeMock).not.toHaveBeenCalled();
  });

  it("returns counts reflecting successful sends and revalidates the admin path", async () => {
    dbFindPendingOrFailed.mockResolvedValue([
      { id: 1, email: "a@example.com", name: "A", referral_code: "AAAAAA" },
      { id: 2, email: "b@example.com", name: "B", referral_code: "BBBBBB" },
    ]);
    sendWelcomeMock.mockResolvedValue({ ok: true });

    const res = await retryFailedEmailsAction();

    expect(res).toEqual({ attempted: 2, sent: 2, errors: 0, hitProviderRateLimit: false });
    expect(sendWelcomeMock).toHaveBeenCalledTimes(2);
    expect(revalidatePathMock).toHaveBeenCalledWith(config.admin.path);
  });

  it("counts a row with no referral_code as an error and skips sending it", async () => {
    dbFindPendingOrFailed.mockResolvedValue([
      { id: 1, email: "a@example.com", name: "A", referral_code: null },
      { id: 2, email: "b@example.com", name: "B", referral_code: "BBBBBB" },
    ]);
    sendWelcomeMock.mockResolvedValue({ ok: true });

    const res = await retryFailedEmailsAction();

    expect(res).toEqual({ attempted: 2, sent: 1, errors: 1, hitProviderRateLimit: false });
    expect(sendWelcomeMock).toHaveBeenCalledTimes(1);
  });

  it("flips hitProviderRateLimit and stops the batch on a 429", async () => {
    dbFindPendingOrFailed.mockResolvedValue([
      { id: 1, email: "a@example.com", name: "A", referral_code: "AAAAAA" },
      { id: 2, email: "b@example.com", name: "B", referral_code: "BBBBBB" },
    ]);
    sendWelcomeMock.mockResolvedValueOnce({ ok: false, rateLimited: true });

    const res = await retryFailedEmailsAction();

    expect(res.hitProviderRateLimit).toBe(true);
    expect(res.sent).toBe(0);
    expect(res.attempted).toBe(2); // attempted reflects rows found, batch broke early
    // Broke after the first 429: second row was never attempted.
    expect(sendWelcomeMock).toHaveBeenCalledTimes(1);
  });

  it("counts a non-rate-limit failure as an error and keeps going", async () => {
    dbFindPendingOrFailed.mockResolvedValue([
      { id: 1, email: "a@example.com", name: "A", referral_code: "AAAAAA" },
      { id: 2, email: "b@example.com", name: "B", referral_code: "BBBBBB" },
    ]);
    sendWelcomeMock
      .mockResolvedValueOnce({ ok: false, error: "boom" })
      .mockResolvedValueOnce({ ok: true });

    const res = await retryFailedEmailsAction();

    expect(res).toEqual({ attempted: 2, sent: 1, errors: 1, hitProviderRateLimit: false });
    expect(sendWelcomeMock).toHaveBeenCalledTimes(2);
  });
});

describe("resendOneEmailAction", () => {
  it("checks admin auth first", async () => {
    await resendOneEmailAction(fd({ id: "abc" }));
    expect(requireAdminOrRedirectMock).toHaveBeenCalledTimes(1);
  });

  it("returns a bad-id error for a non-numeric id", async () => {
    const res = await resendOneEmailAction(fd({ id: "not-a-number" }));
    expect(res).toEqual({ ok: false, error: "bad id" });
    expect(sendWelcomeMock).not.toHaveBeenCalled();
  });

  it("returns a config error when RESEND_API_KEY is missing", async () => {
    envMock.mockResolvedValue({ ...validEnv(), RESEND_API_KEY: undefined });
    const res = await resendOneEmailAction(fd({ id: "5" }));
    expect(res).toEqual({ ok: false, error: "resend not configured" });
  });

  it("returns not-found when the row is missing or has no referral code", async () => {
    dbRawFirst.mockResolvedValue(null);
    const res = await resendOneEmailAction(fd({ id: "5" }));
    expect(res).toEqual({ ok: false, error: "not found" });
    expect(sendWelcomeMock).not.toHaveBeenCalled();
  });

  it("sends and returns { ok: true }, revalidating the admin path, on success", async () => {
    dbRawFirst.mockResolvedValue({
      id: 5,
      name: "Casey",
      email: "casey@example.com",
      referral_code: "CCCCCC",
    });
    sendWelcomeMock.mockResolvedValue({ ok: true });

    const res = await resendOneEmailAction(fd({ id: "5" }));

    expect(res).toEqual({ ok: true });
    expect(sendWelcomeMock).toHaveBeenCalledTimes(1);
    expect(revalidatePathMock).toHaveBeenCalledWith(config.admin.path);
  });

  it("propagates the error and rateLimited flag when the send fails", async () => {
    dbRawFirst.mockResolvedValue({
      id: 5,
      name: "Casey",
      email: "casey@example.com",
      referral_code: "CCCCCC",
    });
    sendWelcomeMock.mockResolvedValue({ ok: false, error: "nope", rateLimited: true });

    const res = await resendOneEmailAction(fd({ id: "5" }));

    expect(res).toEqual({ ok: false, error: "nope", rateLimited: true });
  });
});
