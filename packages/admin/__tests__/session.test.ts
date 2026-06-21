import { beforeEach, describe, expect, it } from "vitest";
import {
  bumpSessionVersion,
  getSessionVersion,
  readCookie,
} from "../src/session.js";
import { createTestDb } from "./test-helpers.js";

describe("readCookie", () => {
  it("returns undefined for null/empty", () => {
    expect(readCookie(null, "x")).toBeUndefined();
    expect(readCookie("", "x")).toBeUndefined();
  });

  it("extracts a single cookie", () => {
    expect(readCookie("admin_session=abc.1.def", "admin_session")).toBe("abc.1.def");
  });

  it("extracts a cookie among several", () => {
    expect(
      readCookie(
        "_ga=tracking; admin_session=value; theme=dark",
        "admin_session",
      ),
    ).toBe("value");
  });

  it("does not match by prefix collision", () => {
    expect(
      readCookie("admin_session_old=stale; admin=other", "admin_session"),
    ).toBeUndefined();
  });
});

describe("session version", () => {
  it("returns 1 by default (seeded by migration 0003)", async () => {
    const db = createTestDb();
    expect(await getSessionVersion(db)).toBe(1);
  });

  it("bumpSessionVersion increments and is observable via getSessionVersion", async () => {
    const db = createTestDb();
    const v1 = await bumpSessionVersion(db);
    const v2 = await bumpSessionVersion(db);
    expect(v2).toBe(v1 + 1);
    expect(await getSessionVersion(db)).toBe(v2);
  });
});
