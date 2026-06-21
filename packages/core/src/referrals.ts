// Crockford-style base32 alphabet without ambiguous characters: no 0/O,
// no 1/l/I, no U. Safe for URLs, easy to type if a user reads one out loud.
// Length is configurable via WaitlistConfig.referral.codeLength (default 6).

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateReferralCode(length: number): string {
  if (length < 4 || length > 32) {
    throw new Error(`referral code length out of range: ${length}`);
  }
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function isValidReferralCode(
  code: unknown,
  length: number,
): code is string {
  if (typeof code !== "string") return false;
  if (code.length !== length) return false;
  for (let i = 0; i < code.length; i++) {
    if (!ALPHABET.includes(code[i])) return false;
  }
  return true;
}
