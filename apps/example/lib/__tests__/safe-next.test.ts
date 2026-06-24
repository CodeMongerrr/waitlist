import { describe, it, expect } from "vitest";
import { isSafePath, safeNextOr } from "@/lib/safe-next";

describe("isSafePath", () => {
  it("accepts a strictly-relative path", () => {
    expect(isSafePath("/admin")).toBe(true);
  });

  it("accepts a relative path with nested segments and a query string", () => {
    expect(isSafePath("/admin/users?x=1")).toBe(true);
  });

  it("accepts the bare root path", () => {
    expect(isSafePath("/")).toBe(true);
  });

  it("rejects a protocol-relative URL", () => {
    expect(isSafePath("//evil.com")).toBe(false);
  });

  it("rejects a backslash-host quirk path", () => {
    expect(isSafePath("/\\evil.com")).toBe(false);
  });

  it("rejects an absolute https URL", () => {
    expect(isSafePath("https://evil.com")).toBe(false);
  });

  it("rejects an absolute http URL", () => {
    expect(isSafePath("http://evil.com/admin")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isSafePath("")).toBe(false);
  });

  it("rejects whitespace-only and leading-whitespace strings (no leading slash)", () => {
    for (const ws of [" ", "  ", "\t", "\n", "   /admin"]) {
      expect(isSafePath(ws)).toBe(false);
    }
  });

  it("rejects a path that does not start with a slash", () => {
    expect(isSafePath("admin")).toBe(false);
  });

  it("rejects non-string inputs", () => {
    for (const bad of [undefined, null, 0, 42, {}, [], true, NaN]) {
      expect(isSafePath(bad)).toBe(false);
    }
  });

  it("narrows the type to string when true (type guard)", () => {
    const value: unknown = "/admin";
    if (isSafePath(value)) {
      // value is now typed as string; calling a string method must compile and run
      expect(value.startsWith("/")).toBe(true);
    } else {
      throw new Error("expected /admin to be a safe path");
    }
  });
});

describe("safeNextOr", () => {
  const fallback = "/admin";

  it("returns the path unchanged when it is safe", () => {
    expect(safeNextOr("/admin/users?x=1", fallback)).toBe("/admin/users?x=1");
  });

  it("returns the fallback for a protocol-relative URL", () => {
    expect(safeNextOr("//evil.com", fallback)).toBe(fallback);
  });

  it("returns the fallback for a backslash-host quirk path", () => {
    expect(safeNextOr("/\\evil.com", fallback)).toBe(fallback);
  });

  it("returns the fallback for an absolute URL", () => {
    expect(safeNextOr("https://evil.com", fallback)).toBe(fallback);
  });

  it("returns the fallback for an empty string", () => {
    expect(safeNextOr("", fallback)).toBe(fallback);
  });

  it("returns the fallback for whitespace-only input", () => {
    expect(safeNextOr("   ", fallback)).toBe(fallback);
  });

  it("returns the fallback for non-string inputs", () => {
    expect(safeNextOr(undefined, fallback)).toBe(fallback);
    expect(safeNextOr(null, fallback)).toBe(fallback);
    expect(safeNextOr(123, fallback)).toBe(fallback);
  });

  it("passes the given fallback through verbatim (does not assume a default)", () => {
    expect(safeNextOr("//evil.com", "/login?next=blocked")).toBe(
      "/login?next=blocked"
    );
  });
});
