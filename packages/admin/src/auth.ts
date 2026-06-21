// Signed-cookie session for the admin dashboard. Web Crypto only — works
// in Workers, Node 18+, and browsers.
//
// Cookie format: <issuedAtMs>.<version>.<base64urlHmacSig>
// HMAC message:  ${issuedAtMs}.${version}
//
// The "version" comes from admin_meta.session_version. Bumping that row
// (bumpSessionVersion) revokes every active cookie because the message
// each was signed against has changed.
//
// Two verifiers:
//   verifyCookieSignature  cheap HMAC + expiry check, no DB. Use in edge
//                          middleware so the gate stays fast.
//   verifySessionFull      adds a DB read of the current version. Use
//                          inside every admin handler (page, server
//                          action, route) so a cookie that slipped past
//                          middleware is still rejected at the handler.

function b64urlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(msg),
  );
  return b64urlEncode(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export interface ParsedCookie {
  issuedMs: number;
  version: number;
  sig: string;
}

function parseCookieValue(v: string): ParsedCookie | null {
  const parts = v.split(".");
  if (parts.length !== 3) return null;
  const [issued, version, sig] = parts;
  const issuedMs = parseInt(issued, 10);
  const versionNum = parseInt(version, 10);
  if (!Number.isFinite(issuedMs) || !Number.isFinite(versionNum) || !sig) {
    return null;
  }
  return { issuedMs, version: versionNum, sig };
}

export async function mintSessionCookieValue(
  secret: string,
  version: number,
  now: number = Date.now(),
): Promise<string> {
  const issued = now.toString();
  const sig = await hmac(secret, `${issued}.${version}`);
  return `${issued}.${version}.${sig}`;
}

export interface MintCookieOpts {
  cookieName: string;
  maxAgeSeconds: number;
}

// Build the full Set-Cookie header value. Caller writes this to the
// response. Strict + Secure + HttpOnly. Path / so the cookie is sent on
// every admin route.
export async function mintSessionSetCookie(
  secret: string,
  version: number,
  opts: MintCookieOpts,
): Promise<string> {
  const value = await mintSessionCookieValue(secret, version);
  return `${opts.cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${opts.maxAgeSeconds}`;
}

export function clearSessionSetCookie(cookieName: string): string {
  return `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

// Edge-friendly: HMAC + expiry only.
export async function verifyCookieSignature(
  cookieValue: string | undefined,
  secret: string,
  maxAgeSeconds: number,
  now: number = Date.now(),
): Promise<ParsedCookie | null> {
  if (!cookieValue) return null;
  const parsed = parseCookieValue(cookieValue);
  if (!parsed) return null;
  if (now - parsed.issuedMs > maxAgeSeconds * 1000) return null;
  if (parsed.issuedMs > now + 5000) return null; // future-issued = clock skew or forgery
  const expected = await hmac(secret, `${parsed.issuedMs}.${parsed.version}`);
  if (!timingSafeEqual(parsed.sig, expected)) return null;
  return parsed;
}

// Full check: signature + expiry + version >= currentVersion.
export async function verifySessionFull(
  cookieValue: string | undefined,
  secret: string,
  currentVersion: number,
  maxAgeSeconds: number,
): Promise<boolean> {
  const parsed = await verifyCookieSignature(cookieValue, secret, maxAgeSeconds);
  if (!parsed) return false;
  return parsed.version >= currentVersion;
}

// Constant-time password compare.
export function checkPassword(input: string, expected: string): boolean {
  if (input.length !== expected.length) return false;
  let r = 0;
  for (let i = 0; i < input.length; i++)
    r |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return r === 0;
}
