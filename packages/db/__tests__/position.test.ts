import { beforeEach, describe, expect, it } from "vitest";
import { WaitlistDb } from "../src/client.js";
import { createTestD1 } from "./d1-mock.js";

// Position math is the load-bearing piece of the referral mechanic. Bugs here
// silently mis-rank people, kill the share loop, and erode trust. Coverage
// here is non-negotiable.

const JUMPS = 10;

async function seed(db: WaitlistDb, rows: Array<{ name: string; email: string; code: string; refCount?: number }>) {
  for (const r of rows) {
    await db.insertSignup({
      name: r.name,
      email: r.email,
      source: null,
      ip: null,
      user_agent: null,
      referral_code: r.code,
      referred_by: null,
    });
  }
  for (const r of rows) {
    for (let i = 0; i < (r.refCount ?? 0); i++) {
      await db.incrementReferralCount(r.code);
    }
  }
}

describe("positionFor", () => {
  let db: WaitlistDb;

  beforeEach(() => {
    db = new WaitlistDb(createTestD1());
  });

  it("returns null for unknown referral code", async () => {
    const result = await db.positionFor("ZZZZZZ", JUMPS);
    expect(result).toBeNull();
  });

  it("ranks by signup order with no referrals", async () => {
    await seed(db, [
      { name: "alice", email: "a@x.com", code: "AAAAAA" },
      { name: "bob", email: "b@x.com", code: "BBBBBB" },
      { name: "carol", email: "c@x.com", code: "CCCCCC" },
    ]);
    expect((await db.positionFor("AAAAAA", JUMPS))?.position).toBe(1);
    expect((await db.positionFor("BBBBBB", JUMPS))?.position).toBe(2);
    expect((await db.positionFor("CCCCCC", JUMPS))?.position).toBe(3);
  });

  it("a referral jumps the referrer ahead by JUMPS spots", async () => {
    // 15 signups, signup #15 refers 1 person → effective score 15 - 10 = 5,
    // so they should leap from #15 to roughly #5.
    const rows: Array<{ name: string; email: string; code: string; refCount?: number }> =
      Array.from({ length: 15 }, (_, i) => ({
        name: `u${i}`,
        email: `u${i}@x.com`,
        code: `CODE${String(i).padStart(2, "0")}`,
      }));
    rows[14].refCount = 1;
    await seed(db, rows);
    const last = await db.positionFor("CODE14", JUMPS);
    expect(last?.position).toBeLessThan(15);
    expect(last?.referralCount).toBe(1);
  });

  it("other people's referrals shift you DOWN", async () => {
    // Bug we're guarding against: a naive position calc only subtracts your own
    // referrals, so when a later signup gets referrals you stay at your old
    // position. The CTE-based query correctly counts everyone with a better
    // effective score.
    await seed(db, [
      { name: "alice", email: "a@x.com", code: "AAAAAA" }, // base rank 1
      { name: "bob", email: "b@x.com", code: "BBBBBB" }, // base rank 2
      { name: "carol", email: "c@x.com", code: "CCCCCC", refCount: 1 }, // base 3, effective -7
    ]);
    // Carol's effective score (-7) is below Alice's (1), so Alice moves to #2.
    const alice = await db.positionFor("AAAAAA", JUMPS);
    const carol = await db.positionFor("CCCCCC", JUMPS);
    expect(carol?.position).toBe(1);
    expect(alice?.position).toBe(2);
  });

  it("clamps position to a minimum of 1", async () => {
    // Signup #1 with referrals would have effective_score = 1 - 10 = -9.
    // Position is still 1, not 0 or negative.
    await seed(db, [{ name: "first", email: "f@x.com", code: "FIRST1", refCount: 5 }]);
    const result = await db.positionFor("FIRST1", JUMPS);
    expect(result?.position).toBe(1);
  });
});
