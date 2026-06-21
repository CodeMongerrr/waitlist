import { beforeEach, describe, expect, it } from "vitest";
import { mintSessionCookieValue } from "../src/auth.js";
import { checkAdminMiddleware } from "../src/middleware.js";
import { makeConfig } from "./test-helpers.js";

const SECRET = "middleware-test-secret-long-enough-for-hmac";

describe("checkAdminMiddleware", () => {
  let config: ReturnType<typeof makeConfig>;
  beforeEach(() => {
    config = makeConfig();
  });

  it("allows non-admin paths", async () => {
    const d = await checkAdminMiddleware({
      pathname: "/",
      cookieHeader: null,
      cookieSecret: SECRET,
      config,
    });
    expect(d.allow).toBe(true);
  });

  it("allows the login page itself", async () => {
    const d = await checkAdminMiddleware({
      pathname: "/admin/login",
      cookieHeader: null,
      cookieSecret: SECRET,
      config,
    });
    expect(d.allow).toBe(true);
  });

  it("returns not_configured when no secret env", async () => {
    const d = await checkAdminMiddleware({
      pathname: "/admin",
      cookieHeader: null,
      cookieSecret: undefined,
      config,
    });
    expect(d.allow).toBe(false);
    if (!d.allow) expect(d.reason).toBe("not_configured");
  });

  it("redirects to login when no cookie present", async () => {
    const d = await checkAdminMiddleware({
      pathname: "/admin/users",
      cookieHeader: null,
      cookieSecret: SECRET,
      config,
    });
    expect(d.allow).toBe(false);
    if (!d.allow) {
      expect(d.reason).toBe("redirect");
      expect(d.redirectTo).toBe("/admin/login?next=%2Fadmin%2Fusers");
    }
  });

  it("redirects when the cookie is invalid", async () => {
    const d = await checkAdminMiddleware({
      pathname: "/admin",
      cookieHeader: "admin_session=garbage.value.here",
      cookieSecret: SECRET,
      config,
    });
    expect(d.allow).toBe(false);
  });

  it("allows when cookie is valid", async () => {
    const cookie = await mintSessionCookieValue(SECRET, 1);
    const d = await checkAdminMiddleware({
      pathname: "/admin",
      cookieHeader: `admin_session=${cookie}`,
      cookieSecret: SECRET,
      config,
    });
    expect(d.allow).toBe(true);
  });
});
