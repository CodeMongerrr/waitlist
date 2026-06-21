import { describe, expect, it } from "vitest";
import {
  checkPassword,
  mintSessionCookieValue,
  verifyCookieSignature,
  verifySessionFull,
} from "../src/auth.js";

const SECRET = "test-secret-must-be-long-enough-for-hmac";
const TTL = 3600;

describe("verifyCookieSignature", () => {
  it("accepts a freshly minted cookie", async () => {
    const cookie = await mintSessionCookieValue(SECRET, 1);
    const parsed = await verifyCookieSignature(cookie, SECRET, TTL);
    expect(parsed).not.toBeNull();
    expect(parsed?.version).toBe(1);
  });

  it("rejects an undefined or empty cookie", async () => {
    expect(await verifyCookieSignature(undefined, SECRET, TTL)).toBeNull();
    expect(await verifyCookieSignature("", SECRET, TTL)).toBeNull();
  });

  it("rejects a cookie with a tampered version", async () => {
    const cookie = await mintSessionCookieValue(SECRET, 1);
    const [issued, , sig] = cookie.split(".");
    const tampered = `${issued}.999.${sig}`;
    expect(await verifyCookieSignature(tampered, SECRET, TTL)).toBeNull();
  });

  it("rejects a cookie with a tampered timestamp", async () => {
    const cookie = await mintSessionCookieValue(SECRET, 1);
    const [, version, sig] = cookie.split(".");
    const tampered = `${Date.now() - 1000}.${version}.${sig}`;
    expect(await verifyCookieSignature(tampered, SECRET, TTL)).toBeNull();
  });

  it("rejects a cookie signed with a different secret", async () => {
    const cookie = await mintSessionCookieValue(SECRET, 1);
    const parsed = await verifyCookieSignature(cookie, "wrong-secret", TTL);
    expect(parsed).toBeNull();
  });

  it("rejects an expired cookie", async () => {
    const past = Date.now() - (TTL + 60) * 1000;
    const cookie = await mintSessionCookieValue(SECRET, 1, past);
    const parsed = await verifyCookieSignature(cookie, SECRET, TTL);
    expect(parsed).toBeNull();
  });

  it("rejects a future-dated cookie (clock-skew tolerance only)", async () => {
    const future = Date.now() + 10_000;
    const cookie = await mintSessionCookieValue(SECRET, 1, future);
    const parsed = await verifyCookieSignature(cookie, SECRET, TTL);
    expect(parsed).toBeNull();
  });
});

describe("verifySessionFull", () => {
  it("accepts when version >= currentVersion", async () => {
    const cookie = await mintSessionCookieValue(SECRET, 5);
    expect(await verifySessionFull(cookie, SECRET, 5, TTL)).toBe(true);
    expect(await verifySessionFull(cookie, SECRET, 4, TTL)).toBe(true);
  });

  it("rejects when current version was bumped past the cookie's version (revoke)", async () => {
    // Simulates the bumpSessionVersion() flow: every existing cookie minted
    // before the bump becomes invalid. This is the load-bearing security
    // property of the version system; lose this and a stolen cookie is
    // valid forever (within the TTL).
    const cookie = await mintSessionCookieValue(SECRET, 1);
    expect(await verifySessionFull(cookie, SECRET, 2, TTL)).toBe(false);
  });
});

describe("checkPassword", () => {
  it("accepts the correct password", () => {
    expect(checkPassword("hunter2", "hunter2")).toBe(true);
  });

  it("rejects the wrong password", () => {
    expect(checkPassword("hunter3", "hunter2")).toBe(false);
  });

  it("rejects a different-length string before any compare", () => {
    expect(checkPassword("hunter", "hunter2")).toBe(false);
    expect(checkPassword("hunter22", "hunter2")).toBe(false);
  });
});
