import { beforeEach, describe, expect, it } from "vitest";
import { WaitlistDb } from "../src/client.js";
import { createTestD1 } from "./d1-mock.js";

describe("rate limit upsert", () => {
  let db: WaitlistDb;

  beforeEach(() => {
    db = new WaitlistDb(createTestD1());
  });

  it("starts a fresh window with attempts=1", async () => {
    await db.upsertRateLimit("1.1.1.1", "2025-01-01 00:00:00");
    const row = await db.getRateLimit("1.1.1.1");
    expect(row?.attempts).toBe(1);
  });

  it("increments attempts within the same window", async () => {
    await db.upsertRateLimit("1.1.1.1", "2025-01-01 00:00:00");
    await db.upsertRateLimit("1.1.1.1", "2025-01-01 00:00:00");
    await db.upsertRateLimit("1.1.1.1", "2025-01-01 00:00:00");
    const row = await db.getRateLimit("1.1.1.1");
    expect(row?.attempts).toBe(3);
  });

  it("keeps ips isolated", async () => {
    await db.upsertRateLimit("1.1.1.1", "2025-01-01 00:00:00");
    await db.upsertRateLimit("2.2.2.2", "2025-01-01 00:00:00");
    expect((await db.getRateLimit("1.1.1.1"))?.attempts).toBe(1);
    expect((await db.getRateLimit("2.2.2.2"))?.attempts).toBe(1);
  });

  it("resetRateLimit starts a fresh window", async () => {
    await db.upsertRateLimit("1.1.1.1", "2025-01-01 00:00:00");
    await db.upsertRateLimit("1.1.1.1", "2025-01-01 00:00:00");
    await db.resetRateLimit("1.1.1.1", "2025-01-01 02:00:00");
    const row = await db.getRateLimit("1.1.1.1");
    expect(row?.attempts).toBe(1);
    expect(row?.window_start).toBe("2025-01-01 02:00:00");
  });
});
