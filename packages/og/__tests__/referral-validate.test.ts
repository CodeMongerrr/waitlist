import { describe, expect, it } from "vitest";
import { isValidReferralCode } from "../src/referral-validate.js";
import { OG_TOKENS } from "../src/tokens.js";

// This validator is a deliberate copy of the one in @waitlist-stack/core
// (kept local to avoid a circular dep). These tests pin the two copies to the
// same behaviour so they can't silently drift.
describe("isValidReferralCode (og copy)", () => {
  it("accepts a well-formed code of the expected length", () => {
    expect(isValidReferralCode("ABCDEF", 6)).toBe(true);
    expect(isValidReferralCode("23456789", 8)).toBe(true);
  });

  it("rejects wrong length", () => {
    expect(isValidReferralCode("ABCDE", 6)).toBe(false);
    expect(isValidReferralCode("ABCDEFG", 6)).toBe(false);
  });

  it("rejects non-string types", () => {
    expect(isValidReferralCode(null, 6)).toBe(false);
    expect(isValidReferralCode(undefined, 6)).toBe(false);
    expect(isValidReferralCode(123456, 6)).toBe(false);
    expect(isValidReferralCode({}, 6)).toBe(false);
  });

  it("rejects ambiguous/banned characters (0 O 1 I L U) and lowercase", () => {
    expect(isValidReferralCode("0BCDEF", 6)).toBe(false); // zero
    expect(isValidReferralCode("OBCDEF", 6)).toBe(false); // letter O
    expect(isValidReferralCode("1BCDEF", 6)).toBe(false); // one
    expect(isValidReferralCode("IBCDEF", 6)).toBe(false); // letter I
    expect(isValidReferralCode("UBCDEF", 6)).toBe(false); // letter U
    expect(isValidReferralCode("abcdef", 6)).toBe(false); // lowercase
  });

  it("narrows the type so a validated code is usable as a string", () => {
    const raw: unknown = "ABCDEF";
    if (isValidReferralCode(raw, 6)) {
      // Compiles only because the type guard narrowed `raw` to string.
      expect(raw.toLowerCase()).toBe("abcdef");
    } else {
      throw new Error("expected valid code");
    }
  });
});

describe("OG_TOKENS", () => {
  it("uses the standard 1200x630 OG card dimensions", () => {
    expect(OG_TOKENS.width).toBe(1200);
    expect(OG_TOKENS.height).toBe(630);
  });

  it("exposes parseable color tokens", () => {
    for (const key of ["cream", "ink", "red", "muted"] as const) {
      expect(OG_TOKENS[key]).toMatch(/^#|^rgba?\(/);
    }
  });
});
