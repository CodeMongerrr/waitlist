import { describe, it, expect } from "vitest";
import {
  validateEmail,
  genShareCode,
  buildSeedSignups,
} from "@/lib/helpers";

describe("validateEmail", () => {
  it("rejects empty input", () => {
    expect(validateEmail("")).toEqual({ ok: false, reason: "Email is required." });
  });

  it("rejects malformed addresses", () => {
    for (const bad of ["notanemail", "no@domain", "@nodomain.com", "a b@c.com"]) {
      expect(validateEmail(bad).ok).toBe(false);
    }
  });

  it("accepts a well-formed address", () => {
    expect(validateEmail("alice@example.com")).toEqual({ ok: true });
  });

  it("trims and lowercases before validating", () => {
    expect(validateEmail("  Alice@Example.COM  ")).toEqual({ ok: true });
  });

  it("blocks known disposable domains", () => {
    const r = validateEmail("spammer@mailinator.com");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/disposable/i);
  });

  it("suggests a correction for common typos", () => {
    const r = validateEmail("bob@gmial.com");
    expect(r).toEqual({ ok: true, suggestion: "bob@gmail.com" });
  });
});

describe("genShareCode", () => {
  it("returns a 10-char code from the unambiguous alphabet", () => {
    const code = genShareCode("seed");
    expect(code).toHaveLength(10);
    expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{10}$/);
  });

  it("is deterministic for the same seed and differs across seeds", () => {
    expect(genShareCode("alice")).toBe(genShareCode("alice"));
    expect(genShareCode("alice")).not.toBe(genShareCode("bob"));
  });
});

describe("buildSeedSignups", () => {
  it("produces 25 sequential, fully-formed seed rows", () => {
    const rows = buildSeedSignups();
    expect(rows).toHaveLength(25);
    rows.forEach((r, i) => {
      expect(r.position).toBe(i + 1);
      expect(r.id).toBe(i + 1);
      expect(r.email).toContain("@");
      expect(r.code).toMatch(/^[A-Z0-9]{10}$/);
      expect(r.refs).toBeGreaterThanOrEqual(0);
    });
  });
});
