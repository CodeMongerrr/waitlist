// Local copy of the referral-code validator. Duplicated (rather than imported
// from @waitlist-stack/core) to avoid a circular dep when admin or other
// packages need both. Tiny + identical alphabet.

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

export function isValidReferralCode(code: unknown, length: number): code is string {
  if (typeof code !== "string") return false;
  if (code.length !== length) return false;
  for (let i = 0; i < code.length; i++) {
    if (!ALPHABET.includes(code[i])) return false;
  }
  return true;
}
