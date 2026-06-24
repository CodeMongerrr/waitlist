import { beforeEach, describe, expect, it } from "vitest";
import { signup } from "../src/signup.js";
import type { WaitlistDb } from "@waitlist-stack/db";
import { createTestDb, makeConfig } from "./test-helpers.js";

describe("signup", () => {
  let db: WaitlistDb;
  beforeEach(() => {
    db = createTestDb();
  });

  it("rejects too-short name", async () => {
    const r = await signup(db, makeConfig(), {
      name: "a",
      email: "a@example.com",
      ip: "1.1.1.1",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("validation");
  });

  it("rejects malformed email", async () => {
    const r = await signup(db, makeConfig(), {
      name: "alice",
      email: "not-an-email",
      ip: "1.1.1.1",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("validation");
  });

  it("silently ignores honeypot submissions", async () => {
    // Honeypot returns ok+duplicate (so the bot doesn't learn what tripped it)
    // but no row is inserted.
    const r = await signup(db, makeConfig(), {
      name: "bot",
      email: "bot@example.com",
      ip: "1.1.1.1",
      website_url: "https://bot.example",
    });
    expect(r.ok).toBe(true);
    expect(await db.totalSignups()).toBe(0);
  });

  it("inserts a new row with a referral code and returns position 1", async () => {
    const r = await signup(db, makeConfig(), {
      name: "alice",
      email: "alice@example.com",
      ip: "1.1.1.1",
    });
    expect(r.ok).toBe(true);
    if (r.ok && !r.duplicate) {
      expect(r.referralCode).toMatch(/^[2-9A-Z]{6}$/);
      expect(r.position).toBe(1);
      expect(r.referralCount).toBe(0);
    }
  });

  it("returns duplicate=true with existing position when email already signed up", async () => {
    const config = makeConfig();
    await signup(db, config, { name: "alice", email: "a@x.com", ip: "1.1.1.1" });
    const r2 = await signup(db, config, { name: "alice2", email: "a@x.com", ip: "2.2.2.2" });
    expect(r2.ok).toBe(true);
    if (r2.ok) {
      expect(r2.duplicate).toBe(true);
      expect(r2.position).toBe(1);
    }
  });

  it("credits the referrer when a valid ?ref code is used", async () => {
    const config = makeConfig();
    const a = await signup(db, config, { name: "alice", email: "a@x.com", ip: "1.1.1.1" });
    expect(a.ok && !a.duplicate).toBe(true);
    if (!a.ok || a.duplicate) return;

    await signup(db, config, {
      name: "bob",
      email: "b@x.com",
      ip: "2.2.2.2",
      ref: a.referralCode,
    });

    const aliceRow = await db.findByEmail("a@x.com");
    expect(aliceRow?.referral_count).toBe(1);
  });

  it("does not credit a self-referral (same email)", async () => {
    const config = makeConfig();
    const a = await signup(db, config, { name: "alice", email: "a@x.com", ip: "1.1.1.1" });
    if (!a.ok || a.duplicate) throw new Error("seed failed");

    await signup(db, config, {
      name: "alice",
      email: "a@x.com",
      ip: "2.2.2.2",
      ref: a.referralCode,
    });

    const aliceRow = await db.findByEmail("a@x.com");
    expect(aliceRow?.referral_count).toBe(0);
  });

  it("returns rate_limited after exceeding the configured maxAttempts", async () => {
    const config = makeConfig({
      brand: { name: "T", tagline: "t", description: "d", siteUrl: "https://t.example" },
      founder: { name: "T" },
      email: { provider: "resend", fromAddress: "t@example.com", fromName: "T" },
      rateLimit: { maxAttempts: 2, windowSeconds: 3600 },
    });
    await signup(db, config, { name: "u1", email: "u1@x.com", ip: "1.1.1.1" });
    await signup(db, config, { name: "u2", email: "u2@x.com", ip: "1.1.1.1" });
    const r = await signup(db, config, { name: "u3", email: "u3@x.com", ip: "1.1.1.1" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("rate_limited");
  });

  it("strips control characters from stored name, source, and x_handle", async () => {
    // Defense in depth for the CSV export: a bare CR smuggled into a free-text
    // field would otherwise split a spreadsheet cell and re-open formula
    // injection. Core is the authoritative input boundary, so nothing dirty is
    // persisted regardless of which app calls signup().
    const CR = String.fromCharCode(0x0d);
    const LF = String.fromCharCode(0x0a);
    const r = await signup(db, makeConfig(), {
      name: `Ada${CR}=cmd`,
      email: "ada@x.com",
      ip: "1.1.1.1",
      source: `ref${CR}erral`,
      x_handle: `ada${LF}lovelace`,
    });
    expect(r.ok && !r.duplicate).toBe(true);

    const stored = await db.findByEmail("ada@x.com");
    expect(stored?.name).toBe("Ada=cmd");
    expect(stored?.source).toBe("referral");
    expect(stored?.x_handle).toBe("adalovelace");
  });
});
