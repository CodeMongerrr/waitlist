import { describe, expect, it } from "vitest";
import {
  isDisposableEmail,
  isValidEmail,
  suggestEmailFix,
} from "../src/email-check.js";

describe("suggestEmailFix", () => {
  it("returns null for an already-valid popular domain", () => {
    expect(suggestEmailFix("user@gmail.com")).toBeNull();
    expect(suggestEmailFix("user@outlook.com")).toBeNull();
  });

  it("suggests gmail.com for distance-1 typos", () => {
    expect(suggestEmailFix("user@gnail.com")).toBe("user@gmail.com");
    expect(suggestEmailFix("user@gmial.com")).toBe("user@gmail.com");
  });

  it("suggests outlook.com for outloook.com (distance 2, length >= 6)", () => {
    expect(suggestEmailFix("user@outloook.com")).toBe("user@outlook.com");
  });

  it("does NOT suggest for short domains with distance 2", () => {
    // "qq.cn" is dist 2 from "qq.com" but domain.length < 6, so no suggestion.
    // Guards against random short strings getting force-mapped to a popular.
    expect(suggestEmailFix("user@qq.cn")).toBeNull();
  });

  it("returns null for malformed input", () => {
    expect(suggestEmailFix("notanemail")).toBeNull();
    expect(suggestEmailFix("@gmail.com")).toBeNull();
    expect(suggestEmailFix("user@")).toBeNull();
  });

  it("preserves the local part casing", () => {
    expect(suggestEmailFix("MixedCase@gnail.com")).toBe("MixedCase@gmail.com");
  });
});

describe("isDisposableEmail", () => {
  it("flags known throwaways", () => {
    expect(isDisposableEmail("a@mailinator.com")).toBe(true);
    expect(isDisposableEmail("a@10minutemail.com")).toBe(true);
    expect(isDisposableEmail("a@yopmail.com")).toBe(true);
  });

  it("does not flag real providers", () => {
    expect(isDisposableEmail("a@gmail.com")).toBe(false);
    expect(isDisposableEmail("a@my-startup.io")).toBe(false);
  });

  it("is case-insensitive on the domain", () => {
    expect(isDisposableEmail("a@MAILINATOR.COM")).toBe(true);
  });
});

describe("isValidEmail", () => {
  it("accepts well-formed emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("a.b+tag@sub.example.co.uk")).toBe(true);
  });

  it("rejects malformed", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
  });

  it("rejects > 254 chars", () => {
    const long = "a".repeat(250) + "@b.co";
    expect(isValidEmail(long)).toBe(false);
  });
});
