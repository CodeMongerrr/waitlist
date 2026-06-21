import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit } from "../src/rate-limit.js";
import type { WaitlistDb } from "@waitlist-stack/db";
import { createTestDb } from "./test-helpers.js";

const CONFIG = { maxAttempts: 3, windowSeconds: 3600 };

describe("checkRateLimit", () => {
  let db: WaitlistDb;
  beforeEach(() => {
    db = createTestDb();
  });

  it("allows the first request and decrements remaining", async () => {
    const r = await checkRateLimit(db, "1.1.1.1", CONFIG);
    expect(r.allowed).toBe(true);
    if (r.allowed) expect(r.remaining).toBe(2);
  });

  it("rejects after maxAttempts within the window", async () => {
    const now = new Date("2025-01-01T00:00:00Z");
    await checkRateLimit(db, "1.1.1.1", CONFIG, now);
    await checkRateLimit(db, "1.1.1.1", CONFIG, now);
    await checkRateLimit(db, "1.1.1.1", CONFIG, now);
    const r = await checkRateLimit(db, "1.1.1.1", CONFIG, now);
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets when the window expires", async () => {
    const t0 = new Date("2025-01-01T00:00:00Z");
    const t1 = new Date("2025-01-01T01:00:01Z"); // 1h + 1s later
    await checkRateLimit(db, "1.1.1.1", CONFIG, t0);
    await checkRateLimit(db, "1.1.1.1", CONFIG, t0);
    await checkRateLimit(db, "1.1.1.1", CONFIG, t0);
    const r = await checkRateLimit(db, "1.1.1.1", CONFIG, t1);
    expect(r.allowed).toBe(true);
  });

  it("treats 'unknown' IP as always allowed", async () => {
    for (let i = 0; i < 10; i++) {
      const r = await checkRateLimit(db, "unknown", CONFIG);
      expect(r.allowed).toBe(true);
    }
  });

  it("isolates IPs from each other", async () => {
    const now = new Date("2025-01-01T00:00:00Z");
    await checkRateLimit(db, "1.1.1.1", CONFIG, now);
    await checkRateLimit(db, "1.1.1.1", CONFIG, now);
    await checkRateLimit(db, "1.1.1.1", CONFIG, now);
    const blocked = await checkRateLimit(db, "1.1.1.1", CONFIG, now);
    const fresh = await checkRateLimit(db, "2.2.2.2", CONFIG, now);
    expect(blocked.allowed).toBe(false);
    expect(fresh.allowed).toBe(true);
  });
});
