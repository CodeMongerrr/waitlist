import { describe, expect, it } from "vitest";
import { defineConfig } from "../src/define.js";
import {
  DEFAULT_ADMIN,
  DEFAULT_OG,
  DEFAULT_RATE_LIMIT,
  DEFAULT_REFERRAL,
} from "../src/defaults.js";
import type { DefineConfigInput } from "../src/define.js";

// The three fields a consumer's waitlist.config.ts must always supply.
// Everything else should fall back to defaults.
const REQUIRED: DefineConfigInput = {
  brand: {
    name: "Acme",
    tagline: "the tagline",
    description: "the description",
    siteUrl: "https://acme.example",
  },
  founder: { name: "Ada" },
  email: {
    provider: "resend",
    fromAddress: "hi@acme.example",
    fromName: "Acme",
  },
};

describe("defineConfig", () => {
  it("passes required brand/founder/email through unchanged", () => {
    const c = defineConfig(REQUIRED);
    expect(c.brand).toEqual(REQUIRED.brand);
    expect(c.founder).toEqual(REQUIRED.founder);
    expect(c.email).toEqual(REQUIRED.email);
  });

  it("applies every default when only required fields are given", () => {
    const c = defineConfig(REQUIRED);
    expect(c.referral).toEqual(DEFAULT_REFERRAL);
    expect(c.rateLimit).toEqual(DEFAULT_RATE_LIMIT);
    expect(c.og).toEqual(DEFAULT_OG);
    expect(c.admin).toEqual(DEFAULT_ADMIN);
    expect(c.seo).toEqual({});
    expect(c.pricing).toBeUndefined();
  });

  it("merges a partial override on top of defaults (other keys survive)", () => {
    const c = defineConfig({ ...REQUIRED, referral: { jumpsPerReferral: 25 } });
    expect(c.referral.jumpsPerReferral).toBe(25);
    // codeLength was not overridden, so the default must remain.
    expect(c.referral.codeLength).toBe(DEFAULT_REFERRAL.codeLength);
  });

  it("merges partial rateLimit, og, and admin overrides independently", () => {
    const c = defineConfig({
      ...REQUIRED,
      rateLimit: { maxAttempts: 99 },
      og: { cache: "memory" },
      admin: { path: "/control" },
    });
    expect(c.rateLimit.maxAttempts).toBe(99);
    expect(c.rateLimit.windowSeconds).toBe(DEFAULT_RATE_LIMIT.windowSeconds);
    expect(c.og.cache).toBe("memory");
    expect(c.admin.path).toBe("/control");
    expect(c.admin.cookieName).toBe(DEFAULT_ADMIN.cookieName);
  });

  it("keeps an explicit seo block instead of the empty default", () => {
    const c = defineConfig({ ...REQUIRED, seo: { keywords: ["a", "b"] } });
    expect(c.seo.keywords).toEqual(["a", "b"]);
  });

  it("carries pricing tiers through when supplied", () => {
    const pricing = [
      { name: "Founding", price: 49, currency: "USD", maxQuantity: 100 },
    ];
    const c = defineConfig({ ...REQUIRED, pricing });
    expect(c.pricing).toEqual(pricing);
  });

  it("does not mutate the shared default objects across calls", () => {
    const a = defineConfig({ ...REQUIRED, referral: { jumpsPerReferral: 1 } });
    const b = defineConfig(REQUIRED);
    // If defineConfig spread-merged incorrectly and aliased the default,
    // changing `a` would leak into `b`.
    expect(a.referral.jumpsPerReferral).toBe(1);
    expect(b.referral.jumpsPerReferral).toBe(DEFAULT_REFERRAL.jumpsPerReferral);
    expect(DEFAULT_REFERRAL.jumpsPerReferral).toBe(10);
  });
});
