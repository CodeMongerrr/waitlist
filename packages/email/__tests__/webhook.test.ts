import { beforeEach, describe, expect, it } from "vitest";
import { handleResendWebhook } from "../src/webhook/handler.js";
import { signSvix } from "../src/webhook/svix.js";
import { createTestDb, makeSvixSecret } from "./test-helpers.js";
import type { WaitlistDb } from "@waitlist-stack/db";

async function seedRow(db: WaitlistDb, resendId: string) {
  const row = await db.insertSignup({
    name: "test",
    email: `${resendId}@example.com`,
    source: null,
    ip: null,
    user_agent: null,
    referral_code: resendId.slice(0, 6).padEnd(6, "X"),
    referred_by: null,
  });
  await db.markEmailSent(row.id, resendId);
  return row;
}

async function signedRequest(
  secret: string,
  body: object,
): Promise<{ id: string; timestamp: string; signature: string; rawBody: string }> {
  const id = "msg_" + Math.random().toString(36).slice(2);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const rawBody = JSON.stringify(body);
  const signature = await signSvix(secret, { id, timestamp }, rawBody);
  return { id, timestamp, signature, rawBody };
}

describe("handleResendWebhook", () => {
  let db: WaitlistDb;
  let secret: string;

  beforeEach(() => {
    db = createTestDb();
    secret = makeSvixSecret();
  });

  it("returns 503 when secret is missing", async () => {
    const r = await handleResendWebhook(db, {
      secret: "",
      headers: {},
      rawBody: "{}",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(503);
  });

  it("returns 400 when svix headers are missing", async () => {
    const r = await handleResendWebhook(db, {
      secret,
      headers: {},
      rawBody: "{}",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it("returns 401 on invalid signature", async () => {
    const r = await handleResendWebhook(db, {
      secret,
      headers: { id: "x", timestamp: "0", signature: "v1,nope" },
      rawBody: "{}",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(401);
  });

  it("returns 400 on bad json", async () => {
    const id = "msg";
    // Use a current timestamp so the replay-window guard passes; we want to
    // reach the JSON-parse failure, not the signature path.
    const timestamp = String(Math.floor(Date.now() / 1000));
    const rawBody = "not-json";
    const signature = await signSvix(secret, { id, timestamp }, rawBody);
    const r = await handleResendWebhook(db, {
      secret,
      headers: { id, timestamp, signature },
      rawBody,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it("flips a row to delivered on email.delivered", async () => {
    const row = await seedRow(db, "rs_111");
    const req = await signedRequest(secret, {
      type: "email.delivered",
      data: { email_id: "rs_111" },
    });
    await handleResendWebhook(db, { secret, headers: req, rawBody: req.rawBody });
    const fresh = await db.findByEmail(row.email);
    expect(fresh?.email_status).toBe("delivered");
    expect(fresh?.email_delivered_at).toBeTruthy();
  });

  it("flips a row to bounced on email.bounced", async () => {
    const row = await seedRow(db, "rs_222");
    const req = await signedRequest(secret, {
      type: "email.bounced",
      data: { email_id: "rs_222" },
    });
    await handleResendWebhook(db, { secret, headers: req, rawBody: req.rawBody });
    const fresh = await db.findByEmail(row.email);
    expect(fresh?.email_status).toBe("bounced");
  });

  it("flips a row to bounced on email.complained", async () => {
    const row = await seedRow(db, "rs_333");
    const req = await signedRequest(secret, {
      type: "email.complained",
      data: { email_id: "rs_333" },
    });
    await handleResendWebhook(db, { secret, headers: req, rawBody: req.rawBody });
    const fresh = await db.findByEmail(row.email);
    expect(fresh?.email_status).toBe("bounced");
  });

  it("ignores unknown event types without erroring", async () => {
    await seedRow(db, "rs_444");
    const req = await signedRequest(secret, {
      type: "email.unknown_event",
      data: { email_id: "rs_444" },
    });
    const r = await handleResendWebhook(db, {
      secret,
      headers: req,
      rawBody: req.rawBody,
    });
    expect(r.ok).toBe(true);
  });
});
