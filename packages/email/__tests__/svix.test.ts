import { describe, expect, it } from "vitest";
import { signSvix, verifySvix } from "../src/webhook/svix.js";
import { makeSvixSecret } from "./test-helpers.js";

// Svix verification is security-critical: a wrong implementation lets
// attackers POST fake delivery/bounce events, corrupting email status.

describe("verifySvix", () => {
  // Pin "now" to the same instant the test headers claim so the replay-window
  // guard accepts them. Real call sites pass Date.now() (the default).
  const TS = "1700000000";
  const NOW_MS = Number.parseInt(TS, 10) * 1000;

  it("accepts a signature produced by signSvix with the same secret", async () => {
    const secret = makeSvixSecret();
    const headers = { id: "msg_123", timestamp: TS };
    const body = JSON.stringify({ type: "email.delivered", data: { email_id: "x" } });
    const sig = await signSvix(secret, headers, body);
    const ok = await verifySvix(secret, { ...headers, signature: sig }, body, NOW_MS);
    expect(ok).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const secret = makeSvixSecret();
    const headers = { id: "msg_123", timestamp: TS };
    const body = JSON.stringify({ type: "email.delivered" });
    const sig = await signSvix(secret, headers, body);
    const tamperedBody = JSON.stringify({ type: "email.bounced" });
    const ok = await verifySvix(
      secret,
      { ...headers, signature: sig },
      tamperedBody,
      NOW_MS,
    );
    expect(ok).toBe(false);
  });

  it("rejects a signature signed with a different secret", async () => {
    const secretA = makeSvixSecret();
    const secretB = makeSvixSecret();
    const headers = { id: "msg_123", timestamp: TS };
    const body = "{}";
    const sig = await signSvix(secretA, headers, body);
    const ok = await verifySvix(secretB, { ...headers, signature: sig }, body, NOW_MS);
    expect(ok).toBe(false);
  });

  it("rejects an outright bogus signature", async () => {
    const secret = makeSvixSecret();
    const ok = await verifySvix(
      secret,
      { id: "x", timestamp: TS, signature: "v1,bogus" },
      "{}",
      NOW_MS,
    );
    expect(ok).toBe(false);
  });

  it("accepts when one of multiple signatures matches", async () => {
    // Svix may rotate keys, so the signature header can carry several entries.
    // The verifier must accept if ANY entry is valid.
    const secret = makeSvixSecret();
    const headers = { id: "msg", timestamp: TS };
    const body = "ok";
    const real = await signSvix(secret, headers, body);
    const combined = `v1,deadbeef ${real} v1,othergarbage`;
    const ok = await verifySvix(
      secret,
      { ...headers, signature: combined },
      body,
      NOW_MS,
    );
    expect(ok).toBe(true);
  });

  it("rejects a valid signature outside the replay window", async () => {
    // Captured-and-replayed webhook: signature is fine, but the timestamp is
    // older than the 5-minute replay window, so verification must fail.
    const secret = makeSvixSecret();
    const headers = { id: "msg_old", timestamp: TS };
    const body = "{}";
    const sig = await signSvix(secret, headers, body);
    const tooLateMs = NOW_MS + 6 * 60 * 1000;
    const ok = await verifySvix(
      secret,
      { ...headers, signature: sig },
      body,
      tooLateMs,
    );
    expect(ok).toBe(false);
  });

  it("rejects a non-numeric timestamp", async () => {
    const secret = makeSvixSecret();
    const headers = { id: "msg", timestamp: "not-a-number" };
    const body = "{}";
    const sig = await signSvix(
      secret,
      { id: "msg", timestamp: "not-a-number" },
      body,
    );
    const ok = await verifySvix(secret, { ...headers, signature: sig }, body);
    expect(ok).toBe(false);
  });
});
