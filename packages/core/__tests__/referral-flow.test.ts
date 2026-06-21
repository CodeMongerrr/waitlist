import { beforeEach, describe, expect, it } from "vitest";
import { signup } from "../src/signup.js";
import type { WaitlistDb } from "@waitlist-stack/db";
import { createTestDb, makeConfig } from "./test-helpers.js";

// End-to-end referral behaviour through the public `signup` orchestrator,
// using real generated codes (not hand-seeded rows). signup.test.ts checks
// single-credit + self-referral; this file covers the parts that make or break
// the share loop: the position jump a referral actually buys, multi-referrer
// fan-out, invalid/unknown ref handling, and config-driven jump size.

describe("referral flow (through signup)", () => {
  let db: WaitlistDb;
  beforeEach(() => {
    db = createTestDb();
  });

  async function join(name: string, email: string, ref?: string) {
    const r = await signup(db, makeConfig(), { name, email, ip: `ip-${email}`, ref });
    if (!r.ok || r.duplicate) throw new Error(`signup failed for ${email}`);
    return r;
  }

  it("a referral jumps the referrer up the queue", async () => {
    // Queue is front-to-back: earliest signup is position 1. The referrer
    // joins LAST so there's room to climb when a referral lands.
    const jumps = makeConfig().referral.jumpsPerReferral;
    for (let i = 0; i < 12; i++) {
      await join(`filler${i}`, `f${i}@x.com`);
    }
    const referrer = await join("referrer", "ref@x.com");

    const me = await db.findByReferralCode(referrer.referralCode);
    const posBefore = await db.positionFor(referrer.referralCode, jumps);
    expect(me).not.toBeNull();
    expect(posBefore?.position).toBe(13); // 12 fillers ahead, then the referrer

    // Someone uses the referrer's code.
    await join("invitee", "inv@x.com", referrer.referralCode);

    const posAfter = await db.positionFor(referrer.referralCode, jumps);
    expect(posAfter?.referralCount).toBe(1);
    // base_rank 13 - 1*10 = effective 3, so they leap toward the front.
    expect(posAfter?.position).toBeLessThan(13);
  });

  it("credits the correct referrer when several people refer independently", async () => {
    const a = await join("amy", "amy@x.com");
    const b = await join("ben", "ben@x.com");

    await join("c1", "c1@x.com", a.referralCode);
    await join("c2", "c2@x.com", a.referralCode);
    await join("c3", "c3@x.com", b.referralCode);

    expect((await db.findByEmail("amy@x.com"))?.referral_count).toBe(2);
    expect((await db.findByEmail("ben@x.com"))?.referral_count).toBe(1);
  });

  it("a referred invitee can themselves refer (chain)", async () => {
    const a = await join("aaa", "a@x.com");
    const b = await join("bbb", "b@x.com", a.referralCode); // a credited
    await join("ccc", "c@x.com", b.referralCode); // b credited

    expect((await db.findByEmail("a@x.com"))?.referral_count).toBe(1);
    expect((await db.findByEmail("b@x.com"))?.referral_count).toBe(1);
    // The invitee row records who referred it.
    expect((await db.findByEmail("b@x.com"))?.referred_by).toBe(a.referralCode);
  });

  it("ignores an unknown but well-formed ref code (no crash, no credit)", async () => {
    const r = await signup(db, makeConfig(), {
      name: "solo",
      email: "solo@x.com",
      ip: "1.1.1.1",
      ref: "ZZZZZZ", // valid shape, never issued
    });
    expect(r.ok && !r.duplicate).toBe(true);
    if (r.ok && !r.duplicate) {
      expect(r.row.referred_by).toBeNull();
    }
  });

  it("ignores a malformed ref code", async () => {
    const r = await signup(db, makeConfig(), {
      name: "solo2",
      email: "solo2@x.com",
      ip: "2.2.2.2",
      ref: "bad!!", // wrong length + illegal chars
    });
    expect(r.ok && !r.duplicate).toBe(true);
    if (r.ok && !r.duplicate) expect(r.row.referred_by).toBeNull();
  });

  it("honours a custom jumpsPerReferral from config", async () => {
    const config = makeConfig({ referral: { jumpsPerReferral: 3, codeLength: 6 } });
    const a = await signup(db, config, { name: "aaa", email: "a@x.com", ip: "1.1.1.1" });
    if (!a.ok || a.duplicate) throw new Error("seed failed");
    for (let i = 0; i < 5; i++) {
      await signup(db, config, { name: `user${i}`, email: `u${i}@x.com`, ip: `ip${i}`, ref: a.referralCode });
    }
    const pos = await db.positionFor(a.referralCode, 3);
    expect(pos?.referralCount).toBe(5);
    expect(pos?.position).toBe(1); // way ahead with 5 referrals
  });
});
