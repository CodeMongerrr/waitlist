import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The POST handler is thin HTTP wiring around @waitlist-stack/email's
// handleResendWebhook: it reads the raw body + svix headers, fetches the
// webhook secret and DB from lib/cf's env(), delegates verification +
// status-update to handleResendWebhook, and maps the result to a JSON
// response. The signature crypto and DB mutations are exercised by
// packages/email's own suite, so here we mock those boundaries and assert
// the route's contract: that it forwards exactly the right inputs, returns
// 200 { ok: true } on success, and surfaces the handler's status + error on
// failure without ever pretending a bad signature succeeded.

const handleResendWebhookMock = vi.fn();
const waitlistDbCtor = vi.fn();
const envMock = vi.fn();

let currentDb: unknown;

vi.mock("@/lib/cf", () => ({
  env: () => envMock(),
}));

vi.mock("@waitlist-stack/db", () => ({
  WaitlistDb: class {
    constructor(...args: unknown[]) {
      waitlistDbCtor(...args);
    }
  },
}));

vi.mock("@waitlist-stack/email", () => ({
  handleResendWebhook: (...args: unknown[]) => handleResendWebhookMock(...args),
}));

import { POST } from "@/app/api/resend-webhook/route";

const SECRET = "whsec_test_secret_value";

const validEnv = () => ({ DB: currentDb, RESEND_WEBHOOK_SECRET: SECRET });

const webhookRequest = (
  body: string,
  headers: Record<string, string> = {},
) =>
  new Request("http://localhost/api/resend-webhook", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });

const signedHeaders = {
  "svix-id": "msg_123",
  "svix-timestamp": "1700000000",
  "svix-signature": "v1,deadbeef",
};

describe("POST /api/resend-webhook", () => {
  beforeEach(() => {
    currentDb = { __d1: true };
    handleResendWebhookMock.mockReset();
    waitlistDbCtor.mockReset();
    envMock.mockReset().mockResolvedValue(validEnv());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("returns 200 { ok: true } for a valid signed payload", async () => {
    handleResendWebhookMock.mockResolvedValue({ ok: true, status: 200 });

    const body = JSON.stringify({
      type: "email.delivered",
      data: { email_id: "re_abc123" },
    });
    const res = await POST(webhookRequest(body, signedHeaders) as never);

    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data).toEqual({ ok: true });
    expect(handleResendWebhookMock).toHaveBeenCalledTimes(1);
  });

  it("constructs WaitlistDb from the env binding and forwards the secret + raw body + svix headers", async () => {
    handleResendWebhookMock.mockResolvedValue({ ok: true, status: 200 });

    const body = JSON.stringify({
      type: "email.bounced",
      data: { email_id: "re_xyz" },
    });
    await POST(webhookRequest(body, signedHeaders) as never);

    // DB client built from the env's D1 binding.
    expect(waitlistDbCtor).toHaveBeenCalledTimes(1);
    expect(waitlistDbCtor).toHaveBeenCalledWith(currentDb);

    // The handler is the only place verification happens; the route must hand
    // it the exact secret, the unparsed body, and the three svix headers.
    const [, input] = handleResendWebhookMock.mock.calls[0] as [
      unknown,
      {
        secret: string;
        rawBody: string;
        headers: { id?: string; timestamp?: string; signature?: string };
      },
    ];
    expect(input.secret).toBe(SECRET);
    expect(input.rawBody).toBe(body);
    expect(input.headers).toEqual({
      id: "msg_123",
      timestamp: "1700000000",
      signature: "v1,deadbeef",
    });
  });

  it("passes the DB instance through as the handler's first argument", async () => {
    handleResendWebhookMock.mockResolvedValue({ ok: true, status: 200 });

    await POST(webhookRequest("{}", signedHeaders) as never);

    const [dbArg] = handleResendWebhookMock.mock.calls[0] as [unknown];
    expect(dbArg).toBeInstanceOf(Object);
    // The route always builds exactly one WaitlistDb and passes it along.
    expect(waitlistDbCtor).toHaveBeenCalledTimes(1);
  });

  it("coerces a missing/empty RESEND_WEBHOOK_SECRET to an empty string for the handler", async () => {
    envMock.mockResolvedValue({ DB: currentDb, RESEND_WEBHOOK_SECRET: undefined });
    // Mirror the handler's real behavior: empty secret => not configured.
    handleResendWebhookMock.mockResolvedValue({
      ok: false,
      status: 503,
      error: "webhook not configured",
    });

    const res = await POST(webhookRequest("{}", signedHeaders) as never);

    const [, input] = handleResendWebhookMock.mock.calls[0] as [
      unknown,
      { secret: string },
    ];
    expect(input.secret).toBe("");
    expect(res.status).toBe(503);
  });

  it("passes undefined for absent svix headers rather than null", async () => {
    handleResendWebhookMock.mockResolvedValue({
      ok: false,
      status: 400,
      error: "missing svix headers",
    });

    // No svix-* headers at all.
    const res = await POST(webhookRequest("{}") as never);

    const [, input] = handleResendWebhookMock.mock.calls[0] as [
      unknown,
      { headers: { id?: string; timestamp?: string; signature?: string } },
    ];
    expect(input.headers).toEqual({
      id: undefined,
      timestamp: undefined,
      signature: undefined,
    });
    expect(res.status).toBe(400);
  });

  it("surfaces the handler's 401 + error for a bad signature and never claims success", async () => {
    handleResendWebhookMock.mockResolvedValue({
      ok: false,
      status: 401,
      error: "bad signature",
    });

    const res = await POST(
      webhookRequest(
        JSON.stringify({ type: "email.delivered", data: { email_id: "re_1" } }),
        { ...signedHeaders, "svix-signature": "v1,forged" },
      ) as never,
    );

    expect(res.status).toBe(401);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.error).toBe("bad signature");
    expect(data.ok).toBeUndefined();
  });

  it("surfaces the handler's 400 + error for missing svix headers", async () => {
    handleResendWebhookMock.mockResolvedValue({
      ok: false,
      status: 400,
      error: "missing svix headers",
    });

    const res = await POST(webhookRequest("{}") as never);

    expect(res.status).toBe(400);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.error).toBe("missing svix headers");
  });

  it("surfaces the handler's 503 when the webhook secret is not configured", async () => {
    handleResendWebhookMock.mockResolvedValue({
      ok: false,
      status: 503,
      error: "webhook not configured",
    });

    const res = await POST(webhookRequest("{}", signedHeaders) as never);

    expect(res.status).toBe(503);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.error).toBe("webhook not configured");
  });
});
