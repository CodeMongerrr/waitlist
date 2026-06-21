// Pre-submit email heuristics. Pure, zero network calls.
//
// Two checks:
// 1. suggestEmailFix(email) — Levenshtein-distance match against popular
//    providers. Catches typos like "gnail.com", "yaho.com", "outloook.com".
// 2. isDisposableEmail(email) — match against curated throwaway services
//    (mailinator, 10minutemail, etc.).
//
// Both are heuristics; real verification still requires a confirmation
// email. These catch the obvious cases pre-submit so real users with typos
// don't end up in the failed-delivery bucket and casual abusers using
// throwaways get told before they hit submit.

const POPULAR_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.in",
  "yahoo.in",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "fastmail.com",
  "fastmail.fm",
  "duck.com",
  "yandex.com",
  "yandex.ru",
  "mail.com",
  "gmx.com",
  "gmx.de",
  "zoho.com",
  "tutanota.com",
  "qq.com",
  "163.com",
  "126.com",
];

const DISPOSABLE_DOMAINS = new Set<string>([
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "1secmail.com",
  "1secmail.net",
  "1secmail.org",
  "33mail.com",
  "burnermail.io",
  "byom.de",
  "discard.email",
  "discardmail.com",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "fakemail.net",
  "fakemailgenerator.com",
  "getairmail.com",
  "getnada.com",
  "gettempmail.com",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "harakirimail.com",
  "hidemail.de",
  "inboxalias.com",
  "inboxbear.com",
  "incognitomail.com",
  "jetable.org",
  "mailcatch.com",
  "maildrop.cc",
  "mailforspam.com",
  "mailinator.com",
  "mailinator.net",
  "mailinator2.com",
  "mailmoat.com",
  "mailnesia.com",
  "mailnull.com",
  "mailtemp.info",
  "mintemail.com",
  "mohmal.com",
  "moakt.com",
  "mt2014.com",
  "mvrht.net",
  "no-spam.ws",
  "nowmymail.com",
  "owlpic.com",
  "pokemail.net",
  "rcpt.at",
  "sharklasers.com",
  "sneakemail.com",
  "sogetthis.com",
  "spam4.me",
  "spamavert.com",
  "spambog.com",
  "spambog.de",
  "spambox.us",
  "spamfree24.com",
  "spamfree24.de",
  "spamfree24.eu",
  "spamfree24.info",
  "spamfree24.net",
  "spamfree24.org",
  "spamgoes.in",
  "spam.la",
  "spammotel.com",
  "tempinbox.co.uk",
  "tempinbox.com",
  "tempmail.io",
  "tempmail.com",
  "tempmail.us",
  "tempmail.de",
  "tempmail.net",
  "tempmail.org",
  "tempmailaddress.com",
  "tempr.email",
  "throwam.com",
  "throwawaymail.com",
  "throwaway.email",
  "trashmail.at",
  "trashmail.com",
  "trashmail.de",
  "trashmail.io",
  "trashmail.me",
  "trashmail.net",
  "trashmail.ws",
  "trash-mail.at",
  "trash-mail.com",
  "trash-mail.de",
  "trbvm.com",
  "tutuapp.bid",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wegwerfmail.org",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "yopmail.org",
]);

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const prev = new Array<number>(bl + 1);
  const curr = new Array<number>(bl + 1);
  for (let j = 0; j <= bl; j++) prev[j] = j;
  for (let i = 1; i <= al; i++) {
    curr[0] = i;
    for (let j = 1; j <= bl; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= bl; j++) prev[j] = curr[j];
  }
  return prev[bl];
}

function splitEmail(email: string): { local: string; domain: string } | null {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return null;
  return {
    local: email.slice(0, at),
    domain: email.slice(at + 1).toLowerCase(),
  };
}

// Returns the suggested fix (full email with corrected domain) if the
// domain looks like a typo of a popular provider. Distance threshold is
// adaptive: 1 always suggests; 2 only for domains long enough that a
// 2-edit suggestion is meaningful (>= 6 chars).
export function suggestEmailFix(email: string): string | null {
  const parts = splitEmail(email.trim());
  if (!parts) return null;
  const { local, domain } = parts;
  if (POPULAR_DOMAINS.includes(domain)) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const candidate of POPULAR_DOMAINS) {
    const d = levenshtein(domain, candidate);
    if (d < bestDist) {
      bestDist = d;
      best = candidate;
    }
  }
  if (!best) return null;
  if (bestDist === 1) return `${local}@${best}`;
  if (bestDist === 2 && domain.length >= 6) return `${local}@${best}`;
  return null;
}

export function isDisposableEmail(email: string): boolean {
  const parts = splitEmail(email.trim());
  if (!parts) return false;
  return DISPOSABLE_DOMAINS.has(parts.domain);
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254;
}
