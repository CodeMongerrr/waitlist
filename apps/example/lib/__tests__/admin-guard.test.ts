import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// admin-guard pulls in the Cloudflare env accessor, the D1 client, the admin
// crypto package, next/headers, and next/navigation. We mock every boundary
// so the unit under test is just the trim guard + the verify wiring, with no
// real cookies, no real DB, and no real Cloudflare runtime.

const envMock = vi.fn();
const cookiesGetMock = vi.fn();
const cookiesMock = vi.fn(async () => ({ get: cookiesGetMock }));
const redirectMock = vi.fn();
const getSessionVersionMock = vi.fn(async () => 0);
const verifySessionFullMock = vi.fn(async () => false);
const waitlistDbCtor = vi.fn();

vi.mock("../cf", () => ({
  env: () => envMock(),
}));

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirectMock(...args),
}));

vi.mock("@waitlist-stack/db", () => ({
  WaitlistDb: class {
    constructor(...args: unknown[]) {
      waitlistDbCtor(...args);
    }
  },
}));

vi.mock("@waitlist-stack/admin", () => ({
  getSessionVersion: (...args: unknown[]) => getSessionVersionMock(...args),
  verifySessionFull: (...args: unknown[]) => verifySessionFullMock(...args),
}));

// config.admin.cookieName / path / sessionTtlSeconds come from the real config
// chain; import it after the mocks so we can assert against the true values.
import config from "@/waitlist.config";
import { verifyAdmin, requireAdminOrRedirect } from "@/lib/admin-guard";

const validEnv = () => ({
  DB: { __d1: true },
  ADMIN_COOKIE_SECRET: "a-real-secret-value-1234",
});

describe("verifyAdmin", () => {
  beforeEach(() => {
    cookiesGetMock.mockReset().mockReturnValue({ value: "cookie.payload" });
    getSessionVersionMock.mockReset().mockResolvedValue(7);
    verifySessionFullMock.mockReset().mockResolvedValue(false);
    waitlistDbCtor.mockReset();
    envMock.mockReset().mockResolvedValue(validEnv());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns false when ADMIN_COOKIE_SECRET is missing", async () => {
    envMock.mockResolvedValue({ DB: {}, ADMIN_COOKIE_SECRET: undefined });

    expect(await verifyAdmin()).toBe(false);
    // Bails before ever touching cookies / DB / the crypto verifier.
    expect(verifySessionFullMock).not.toHaveBeenCalled();
    expect(cookiesGetMock).not.toHaveBeenCalled();
  });

  it("returns false when ADMIN_COOKIE_SECRET is whitespace-only", async () => {
    envMock.mockResolvedValue({ DB: {}, ADMIN_COOKIE_SECRET: "   \t \n " });

    expect(await verifyAdmin()).toBe(false);
    expect(verifySessionFullMock).not.toHaveBeenCalled();
    expect(getSessionVersionMock).not.toHaveBeenCalled();
  });

  it("returns false when there is no cookie even with a valid secret", async () => {
    cookiesGetMock.mockReturnValue(undefined);
    // Mirror the real verifier: an undefined cookie value cannot verify.
    verifySessionFullMock.mockResolvedValue(false);

    expect(await verifyAdmin()).toBe(false);
    // The undefined cookie value is what gets handed to the verifier.
    expect(verifySessionFullMock).toHaveBeenCalledWith(
      undefined,
      "a-real-secret-value-1234",
      7,
      config.admin.sessionTtlSeconds,
    );
  });

  it("returns false when the cookie fails signature/version/ttl verification", async () => {
    verifySessionFullMock.mockResolvedValue(false);
    expect(await verifyAdmin()).toBe(false);
  });

  it("returns true and forwards the right args when the cookie verifies", async () => {
    verifySessionFullMock.mockResolvedValue(true);

    expect(await verifyAdmin()).toBe(true);

    // Reads the configured cookie name from the store.
    expect(cookiesGetMock).toHaveBeenCalledWith(config.admin.cookieName);
    // Constructs the DB client with the env binding.
    expect(waitlistDbCtor).toHaveBeenCalledTimes(1);
    expect(waitlistDbCtor).toHaveBeenCalledWith(validEnv().DB);
    // Passes the live session version through to the verifier.
    expect(getSessionVersionMock).toHaveBeenCalledTimes(1);
    expect(verifySessionFullMock).toHaveBeenCalledWith(
      "cookie.payload",
      "a-real-secret-value-1234",
      7,
      config.admin.sessionTtlSeconds,
    );
  });

  it("propagates the current session version into the verifier", async () => {
    getSessionVersionMock.mockResolvedValue(42);
    verifySessionFullMock.mockResolvedValue(true);

    await verifyAdmin();

    const callArgs = verifySessionFullMock.mock.calls[0];
    expect(callArgs[2]).toBe(42);
  });
});

describe("requireAdminOrRedirect", () => {
  beforeEach(() => {
    cookiesGetMock.mockReset().mockReturnValue({ value: "cookie.payload" });
    getSessionVersionMock.mockReset().mockResolvedValue(1);
    verifySessionFullMock.mockReset().mockResolvedValue(false);
    redirectMock.mockReset();
    waitlistDbCtor.mockReset();
    envMock.mockReset().mockResolvedValue(validEnv());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("redirects to the admin login path when verification fails", async () => {
    verifySessionFullMock.mockResolvedValue(false);

    await requireAdminOrRedirect();

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith(`${config.admin.path}/login`);
  });

  it("redirects when the secret is whitespace-only (defense in depth)", async () => {
    envMock.mockResolvedValue({ DB: {}, ADMIN_COOKIE_SECRET: "   " });

    await requireAdminOrRedirect();

    expect(redirectMock).toHaveBeenCalledWith(`${config.admin.path}/login`);
  });

  it("does not redirect when the admin is authenticated", async () => {
    verifySessionFullMock.mockResolvedValue(true);

    await requireAdminOrRedirect();

    expect(redirectMock).not.toHaveBeenCalled();
  });
});
