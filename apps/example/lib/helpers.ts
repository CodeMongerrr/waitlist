export type Signup = {
  name: string;
  email: string;
  code: string;
  position: number;
  // Referral progress, surfaced in the post-signup card. Optional because the
  // initial signup response may not carry them; useReferralPosition fills them
  // in on the first live poll.
  referralCount?: number;
  jumpsPerReferral?: number;
};

export type SeedSignup = {
  id: number;
  name: string;
  email: string;
  code: string;
  position: number;
  refs: number;
  status: "pending" | "sent" | "delivered" | "bounced" | "failed";
  joined: string;
};

export type ValidationResult =
  | { ok: false; reason: string }
  | { ok: true; suggestion?: string };

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "throwaway.email",
  "sharklasers.com",
  "yopmail.com",
  "trashmail.com",
]);

const COMMON_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gnail.com": "gmail.com",
  "yhaoo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
};

export function validateEmail(email: string): ValidationResult {
  if (!email) return { ok: false, reason: "Email is required." };
  const trimmed = email.trim().toLowerCase();
  const m = trimmed.match(/^([^\s@]+)@([^\s@]+\.[^\s@]+)$/);
  if (!m) return { ok: false, reason: "That doesn't look like an email." };
  const domain = m[2];
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, reason: "Disposable emails are blocked." };
  }
  if (COMMON_TYPOS[domain]) {
    return { ok: true, suggestion: `${m[1]}@${COMMON_TYPOS[domain]}` };
  }
  return { ok: true };
}

export function genShareCode(seed = ""): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  let h = seed
    .split("")
    .reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 7);
  for (let i = 0; i < 10; i++) {
    h = (h * 9301 + 49297) % 233280;
    s += alphabet[Math.abs(h) % alphabet.length];
  }
  return s;
}

const SEED_NAMES = [
  "Mira Okafor",
  "Theo Lindqvist",
  "Anika Rao",
  "Jules Beckmann",
  "Ren Tanaka",
  "Saoirse Walsh",
  "Marcus Holm",
  "Yuki Aoki",
  "Camille Aubert",
  "Ezra Klein",
  "Priya Shenoy",
  "Henrik Sjöberg",
  "Noor Hassan",
  "Felipe Ortega",
  "Ines Marchetti",
  "Cyrus Daneshvar",
  "Liu Wei",
  "Aurora Bianchi",
  "Tomas Kalinski",
  "Mei Saito",
  "Beatriz Costa",
  "Idris Adeyemi",
  "Hilde Volker",
  "Rashid Najjar",
  "Eira Nyström",
];

const SEED_DOMAINS = [
  "gmail.com",
  "protonmail.com",
  "hey.com",
  "fastmail.com",
  "outlook.com",
  "icloud.com",
];

const SEED_STATUSES: SeedSignup["status"][] = [
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "sent",
  "pending",
  "bounced",
  "failed",
];

const SEED_REFS_HEAD = [3, 2, 2, 1, 1];
const SEED_JOINED = [
  "2m ago",
  "12m ago",
  "38m ago",
  "1h ago",
  "2h ago",
  "4h ago",
  "yesterday",
  "yesterday",
  "2d ago",
  "3d ago",
];

export function buildSeedSignups(): SeedSignup[] {
  return SEED_NAMES.map((name, i) => {
    const handle = name.toLowerCase().replace(/[^a-z]+/g, ".");
    const domain = SEED_DOMAINS[i % SEED_DOMAINS.length];
    const refs = i < 5 ? SEED_REFS_HEAD[i] : i % 7 === 0 ? 1 : 0;
    return {
      id: i + 1,
      name,
      email: `${handle}@${domain}`,
      code: genShareCode(name + i),
      position: i + 1,
      refs,
      status: SEED_STATUSES[i % SEED_STATUSES.length],
      joined: SEED_JOINED[i % SEED_JOINED.length],
    };
  });
}
