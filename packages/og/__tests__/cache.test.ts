import { describe, expect, it } from "vitest";
import { MemoryOgCache, ogCacheKey } from "../src/cache.js";

describe("ogCacheKey", () => {
  it("returns a stable key for the generic card", () => {
    expect(ogCacheKey({})).toBe("og:generic");
    expect(ogCacheKey({ referralCode: "" })).toBe("og:generic");
  });

  it("includes referralCount so a referral bump invalidates the key", () => {
    // Without referral_count in the key, an OG image would stay stale at the
    // old position after the user gets a referral. Worst case: they share an
    // image showing the wrong (worse) position.
    const a = ogCacheKey({ referralCode: "ABCDEF", position: 50, referralCount: 0 });
    const b = ogCacheKey({ referralCode: "ABCDEF", position: 40, referralCount: 1 });
    expect(a).not.toBe(b);
  });

  it("includes position so referrals from other people invalidate", () => {
    const a = ogCacheKey({ referralCode: "ABCDEF", position: 50, referralCount: 0 });
    const b = ogCacheKey({ referralCode: "ABCDEF", position: 60, referralCount: 0 });
    expect(a).not.toBe(b);
  });
});

describe("MemoryOgCache", () => {
  it("returns null for missing keys", async () => {
    const c = new MemoryOgCache();
    expect(await c.get("nope")).toBeNull();
  });

  it("round-trips bytes", async () => {
    const c = new MemoryOgCache();
    const buf = new Uint8Array([1, 2, 3, 4]).buffer;
    await c.put("k", buf);
    const got = await c.get("k");
    expect(got).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(got!)).toEqual(new Uint8Array(buf));
  });

  it("evicts oldest entry when over capacity", async () => {
    const c = new MemoryOgCache(2);
    await c.put("a", new Uint8Array([1]).buffer);
    await c.put("b", new Uint8Array([2]).buffer);
    await c.put("c", new Uint8Array([3]).buffer);
    expect(await c.get("a")).toBeNull();
    expect(await c.get("b")).not.toBeNull();
    expect(await c.get("c")).not.toBeNull();
  });
});
