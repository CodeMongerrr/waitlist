import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleOg, type OgRenderer, type OgTemplate } from "../src/handler.js";
import { MemoryOgCache } from "../src/cache.js";
import type { WaitlistDb } from "@waitlist-stack/db";
import { createTestDb, makeConfig } from "./test-helpers.js";

const makeRenderer = (label: string): OgRenderer => async () => {
  return new TextEncoder().encode(label).buffer as ArrayBuffer;
};

const fakeTemplate: OgTemplate = {
  personalized: () => ({ tag: "personalized" }),
  generic: () => ({ tag: "generic" }),
};

async function seed(db: WaitlistDb, code: string, name = "Alex") {
  const row = await db.insertSignup({
    name,
    email: `${code}@example.com`,
    source: null,
    ip: null,
    user_agent: null,
    referral_code: code,
    referred_by: null,
  });
  return row;
}

describe("handleOg", () => {
  let db: WaitlistDb;
  let cache: MemoryOgCache;
  let config: ReturnType<typeof makeConfig>;

  beforeEach(() => {
    db = createTestDb();
    cache = new MemoryOgCache();
    config = makeConfig();
  });

  it("renders the generic card when no ref param is given", async () => {
    const render = vi.fn(makeRenderer("generic-bytes"));
    const r = await handleOg({
      referralCode: null,
      db,
      config,
      cache,
      template: fakeTemplate,
      render,
    });
    expect(r.variant).toBe("generic");
    expect(r.cacheHit).toBe(false);
    expect(render).toHaveBeenCalledOnce();
  });

  it("renders generic when ref is malformed (skips DB lookup)", async () => {
    const dbSpy = vi.spyOn(db, "findByReferralCode");
    const r = await handleOg({
      referralCode: "not-a-code",
      db,
      config,
      cache,
      template: fakeTemplate,
      render: makeRenderer("g"),
    });
    expect(r.variant).toBe("generic");
    expect(dbSpy).not.toHaveBeenCalled();
  });

  it("renders generic when ref is well-formed but does not resolve", async () => {
    const r = await handleOg({
      referralCode: "ZZZZZZ",
      db,
      config,
      cache,
      template: fakeTemplate,
      render: makeRenderer("g"),
    });
    expect(r.variant).toBe("generic");
  });

  it("renders the personalized card for a resolved ref", async () => {
    await seed(db, "ABCDEF");
    const personalizedSpy = vi.spyOn(fakeTemplate, "personalized");
    const r = await handleOg({
      referralCode: "ABCDEF",
      db,
      config,
      cache,
      template: fakeTemplate,
      render: makeRenderer("p"),
    });
    expect(r.variant).toBe("personalized");
    expect(personalizedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Alex",
        position: expect.any(Number),
      }),
    );
  });

  it("returns cached bytes on the second hit (no re-render)", async () => {
    await seed(db, "ABCDEF");
    const render = vi.fn(makeRenderer("p"));
    await handleOg({
      referralCode: "ABCDEF",
      db,
      config,
      cache,
      template: fakeTemplate,
      render,
    });
    const second = await handleOg({
      referralCode: "ABCDEF",
      db,
      config,
      cache,
      template: fakeTemplate,
      render,
    });
    expect(second.cacheHit).toBe(true);
    expect(render).toHaveBeenCalledTimes(1);
  });

  it("derives first name from the row name", async () => {
    await seed(db, "GGGGGG", "Alex Quill Spencer");
    const personalizedSpy = vi.spyOn(fakeTemplate, "personalized");
    await handleOg({
      referralCode: "GGGGGG",
      db,
      config,
      cache,
      template: fakeTemplate,
      render: makeRenderer("p"),
    });
    expect(personalizedSpy).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Alex" }),
    );
  });
});
