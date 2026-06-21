import { beforeEach, describe, expect, it } from "vitest";
import { WaitlistDb } from "../src/client.js";
import { createTestD1 } from "./d1-mock.js";

// Covers the WaitlistDb access patterns that position.test.ts and
// rate-limit.test.ts don't: lookups, insert defaults, the email-status state
// machine used by the webhook + admin retry, the leaderboard, and admin_meta.

let db: WaitlistDb;

beforeEach(() => {
  db = new WaitlistDb(createTestD1());
});

async function insert(
  overrides: Partial<{
    name: string;
    email: string;
    source: string | null;
    ip: string | null;
    user_agent: string | null;
    referral_code: string;
    referred_by: string | null;
    x_handle: string | null;
    tier: string | null;
  }> = {},
) {
  return db.insertSignup({
    name: "alice",
    email: "a@x.com",
    source: null,
    ip: null,
    user_agent: null,
    referral_code: "AAAAAA",
    referred_by: null,
    ...overrides,
  });
}

describe("insertSignup", () => {
  it("returns the inserted row with schema defaults applied", async () => {
    const row = await insert({ x_handle: "alice", tier: "growing" });
    expect(row.id).toBeGreaterThan(0);
    expect(row.email).toBe("a@x.com");
    expect(row.referral_code).toBe("AAAAAA");
    expect(row.email_status).toBe("pending");
    expect(row.email_attempts).toBe(0);
    expect(row.referral_count).toBe(0);
    expect(row.x_handle).toBe("alice");
    expect(row.tier).toBe("growing");
    expect(row.created_at).toBeTruthy();
  });

  it("rejects a duplicate email via the UNIQUE constraint", async () => {
    await insert({ email: "dup@x.com", referral_code: "CODE01" });
    await expect(
      insert({ email: "dup@x.com", referral_code: "CODE02" }),
    ).rejects.toThrow(/UNIQUE/i);
  });

  it("rejects a duplicate referral_code via the UNIQUE constraint", async () => {
    await insert({ email: "one@x.com", referral_code: "SAME01" });
    await expect(
      insert({ email: "two@x.com", referral_code: "SAME01" }),
    ).rejects.toThrow(/UNIQUE/i);
  });
});

describe("lookups", () => {
  it("findByEmail / findByReferralCode return the row, or null when absent", async () => {
    await insert({ email: "found@x.com", referral_code: "FOUND1" });
    expect((await db.findByEmail("found@x.com"))?.referral_code).toBe("FOUND1");
    expect((await db.findByReferralCode("FOUND1"))?.email).toBe("found@x.com");
    expect(await db.findByEmail("missing@x.com")).toBeNull();
    expect(await db.findByReferralCode("NOPE12")).toBeNull();
  });

  it("totalSignups counts rows", async () => {
    expect(await db.totalSignups()).toBe(0);
    await insert({ email: "u1@x.com", referral_code: "U00001" });
    await insert({ email: "u2@x.com", referral_code: "U00002" });
    expect(await db.totalSignups()).toBe(2);
  });
});

describe("incrementReferralCount", () => {
  it("increments only the targeted code", async () => {
    await insert({ email: "a@x.com", referral_code: "AAAAAA" });
    await insert({ email: "b@x.com", referral_code: "BBBBBB" });
    await db.incrementReferralCount("AAAAAA");
    await db.incrementReferralCount("AAAAAA");
    expect((await db.findByReferralCode("AAAAAA"))?.referral_count).toBe(2);
    expect((await db.findByReferralCode("BBBBBB"))?.referral_count).toBe(0);
  });
});

describe("email status state machine", () => {
  it("markEmailSent records resend id, sent timestamp, and bumps attempts", async () => {
    const row = await insert({ email: "s@x.com", referral_code: "SENT01" });
    await db.markEmailSent(row.id, "resend_abc");
    const after = await db.findByEmail("s@x.com");
    expect(after?.email_status).toBe("sent");
    expect(after?.resend_id).toBe("resend_abc");
    expect(after?.email_attempts).toBe(1);
    expect(after?.email_sent_at).toBeTruthy();
  });

  it("markEmailFailed records the error and bumps attempts", async () => {
    const row = await insert({ email: "f@x.com", referral_code: "FAIL01" });
    await db.markEmailFailed(row.id, "provider 500");
    const after = await db.findByEmail("f@x.com");
    expect(after?.email_status).toBe("failed");
    expect(after?.email_last_error).toBe("provider 500");
    expect(after?.email_attempts).toBe(1);
  });

  it("markEmailDelivered / markEmailBounced match on resend_id", async () => {
    const row = await insert({ email: "d@x.com", referral_code: "DELI01" });
    await db.markEmailSent(row.id, "resend_xyz");

    await db.markEmailDelivered("resend_xyz");
    let after = await db.findByEmail("d@x.com");
    expect(after?.email_status).toBe("delivered");
    expect(after?.email_delivered_at).toBeTruthy();

    await db.markEmailBounced("resend_xyz");
    after = await db.findByEmail("d@x.com");
    expect(after?.email_status).toBe("bounced");
    expect(after?.email_bounced_at).toBeTruthy();
  });

  it("findPendingOrFailed returns pending + failed but not sent", async () => {
    const a = await insert({ email: "p1@x.com", referral_code: "PEND01" }); // stays pending
    const b = await insert({ email: "p2@x.com", referral_code: "PEND02" });
    const c = await insert({ email: "p3@x.com", referral_code: "PEND03" });
    await db.markEmailFailed(b.id, "boom");
    await db.markEmailSent(c.id, "resend_ok");

    const rows = await db.findPendingOrFailed(50);
    const emails = rows.map((r) => r.email).sort();
    expect(emails).toEqual(["p1@x.com", "p2@x.com"]);
    expect(rows.map((r) => r.id)).not.toContain(c.id); // the sent one is excluded
    expect(rows.map((r) => r.id)).toContain(a.id); // the pending one stays
  });
});

describe("leaderboard", () => {
  it("lists only referrers, ordered by referral_count desc", async () => {
    await insert({ name: "zero", email: "z@x.com", referral_code: "ZERO01" });
    await insert({ name: "one", email: "o@x.com", referral_code: "ONE001" });
    await insert({ name: "five", email: "f@x.com", referral_code: "FIVE01" });
    for (let i = 0; i < 1; i++) await db.incrementReferralCount("ONE001");
    for (let i = 0; i < 5; i++) await db.incrementReferralCount("FIVE01");

    const board = await db.leaderboard(10);
    expect(board.map((r) => r.name)).toEqual(["five", "one"]); // "zero" excluded
    expect(board[0].referral_count).toBe(5);
  });

  it("respects the limit", async () => {
    for (let i = 0; i < 3; i++) {
      const code = `LB000${i}`;
      await insert({ email: `lb${i}@x.com`, referral_code: code });
      await db.incrementReferralCount(code);
    }
    expect(await db.leaderboard(2)).toHaveLength(2);
  });
});

describe("admin_meta", () => {
  it("getAdminMeta returns null before any bump", async () => {
    expect(await db.getAdminMeta("logins")).toBeNull();
  });

  it("bumpAdminMeta inserts at 1 then increments, returning the new value", async () => {
    expect(await db.bumpAdminMeta("logins")).toBe(1);
    expect(await db.bumpAdminMeta("logins")).toBe(2);
    expect((await db.getAdminMeta("logins"))?.value).toBe(2);
  });
});
