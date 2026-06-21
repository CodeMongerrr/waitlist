// Resend uses Svix for webhook signing.
// Headers:   svix-id, svix-timestamp, svix-signature
// Signed payload: `${id}.${timestamp}.${rawBody}`
// Signature header is space-separated `v1,<base64>` entries; ANY matching means valid.
//
// Pulled out as its own function so it's testable without spinning up a
// request handler. The secret format is `whsec_<base64>`; the prefix is
// stripped before HMAC.

// Per Svix spec: reject webhooks whose timestamp is more than this far from
// "now" in either direction. Stops captured-and-replayed events from being
// re-applied later. 5 minutes matches the Svix reference implementations.
const REPLAY_WINDOW_SECONDS = 300;

export interface SvixHeaders {
  id: string;
  timestamp: string;
  signature: string;
}

export async function verifySvix(
  secret: string,
  headers: SvixHeaders,
  rawBody: string,
  nowMs: number = Date.now(),
): Promise<boolean> {
  // Replay-window check first; cheap and rejects stale-but-validly-signed
  // captures before doing the HMAC work.
  const tsSeconds = Number.parseInt(headers.timestamp, 10);
  if (!Number.isFinite(tsSeconds)) return false;
  const ageSeconds = Math.abs(nowMs / 1000 - tsSeconds);
  if (ageSeconds > REPLAY_WINDOW_SECONDS) return false;

  const b64 = secret.replace(/^whsec_/, "");
  const keyBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const toSign = `${headers.id}.${headers.timestamp}.${rawBody}`;
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(toSign),
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));

  for (const part of headers.signature.split(" ")) {
    const [, value] = part.split(",");
    if (value && timingSafeEqual(value, expected)) return true;
  }
  return false;
}

// Constant-time string compare to avoid leaking signature bytes via timing.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Helper for tests + the CLI wizard. Generates a valid Svix-shaped
// signature for the given body. Real webhooks come from Svix; never use
// this in production code.
export async function signSvix(
  secret: string,
  headers: { id: string; timestamp: string },
  rawBody: string,
): Promise<string> {
  const b64 = secret.replace(/^whsec_/, "");
  const keyBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const toSign = `${headers.id}.${headers.timestamp}.${rawBody}`;
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(toSign),
  );
  return `v1,${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
}
