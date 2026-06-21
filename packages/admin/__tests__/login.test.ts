import { beforeEach, describe, expect, it } from "vitest";
import { login } from "../src/login.js";
import { createTestDb, makeConfig } from "./test-helpers.js";
import type { WaitlistDb } from "@waitlist-stack/db";

const ENV = {
  expectedPassword: "correct-horse-battery-staple",
  cookieSecret: "test-cookie-secret-long-enough-for-hmac",
};

describe("login", () => {
  let db: WaitlistDb;
  beforeEach(() => {
    db = createTestDb();
  });

  it("returns ok + Set-Cookie header on correct password", async () => {
    const r = await login(db, makeConfig(), ENV, {
      password: ENV.expectedPassword,
      ip: "1.1.1.1",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.setCookie).toMatch(/^admin_session=/);
      expect(r.setCookie).toContain("HttpOnly");
      expect(r.setCookie).toContain("Secure");
      expect(r.setCookie).toContain("SameSite=Strict");
    }
  });

  it("returns wrong_password on bad password", async () => {
    const r = await login(db, makeConfig(), ENV, { password: "wrong", ip: "1.1.1.1" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("wrong_password");
  });

  it("rate-limits after configured attempts", async () => {
    const config = makeConfig(); // loginRateLimit = 3
    const ip = "1.1.1.1";
    await login(db, config, ENV, { password: "wrong", ip });
    await login(db, config, ENV, { password: "wrong", ip });
    await login(db, config, ENV, { password: "wrong", ip });
    const r = await login(db, config, ENV, { password: "wrong", ip });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toBe("rate_limited");
      expect(r.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("successful login resets the rate-limit row", async () => {
    const config = makeConfig();
    const ip = "1.1.1.1";
    await login(db, config, ENV, { password: "wrong", ip });
    await login(db, config, ENV, { password: "wrong", ip });
    const ok = await login(db, config, ENV, { password: ENV.expectedPassword, ip });
    expect(ok.ok).toBe(true);
    // After reset, can fail again without immediately tripping the limit.
    const second = await login(db, config, ENV, { password: "wrong", ip });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe("wrong_password");
  });

  it("returns not_configured when secret is missing", async () => {
    const r = await login(
      db,
      makeConfig(),
      { ...ENV, cookieSecret: "" },
      { password: ENV.expectedPassword, ip: "1.1.1.1" },
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("not_configured");
  });
});
