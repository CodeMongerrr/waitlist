import type { WaitlistConfig } from "@waitlist-stack/config";
import type { WaitlistDb } from "@waitlist-stack/db";
import { ogCacheKey, type OgCache } from "./cache";
import { isValidReferralCode } from "./referral-validate";

// Render contract. Consumers pass in their renderer (workers-og, next/og,
// satori + resvg-wasm — anything that takes a JSX tree and returns PNG
// bytes at 1200x630). The package stays renderer-agnostic.
export type OgRenderer = (
  element: unknown,
  width: number,
  height: number,
) => Promise<ArrayBuffer>;

// Template factory. Consumers can swap in their own card components by
// passing a different builder. Default uses the PaperCard from template.tsx.
export interface OgTemplate {
  personalized(input: {
    brand: WaitlistConfig["brand"];
    firstName: string;
    position: number;
  }): unknown;
  generic(input: { brand: WaitlistConfig["brand"] }): unknown;
}

export interface HandleOgInput {
  /** Query param value, e.g. URL searchParams.get("ref") */
  referralCode?: string | null;
  db: WaitlistDb;
  config: WaitlistConfig;
  cache: OgCache;
  template: OgTemplate;
  render: OgRenderer;
}

export interface HandleOgOutput {
  bytes: ArrayBuffer;
  /** "personalized" or "generic" — useful for setting Cache-Control. */
  variant: "personalized" | "generic";
  cacheHit: boolean;
}

// Resolve the ?ref code, look up the row, choose template, hit cache or
// render + cache. Caller wraps the bytes in a Response with whatever
// Cache-Control they want.
export async function handleOg(input: HandleOgInput): Promise<HandleOgOutput> {
  const code = input.referralCode?.trim() || "";
  const codeLength = input.config.referral.codeLength;

  // Fast path: missing/invalid ref → generic. Skips DB lookup entirely.
  if (!code || !isValidReferralCode(code, codeLength)) {
    return await renderGeneric(input);
  }

  const row = await input.db.findByReferralCode(code);
  if (!row?.name || !row.referral_code) {
    return await renderGeneric(input);
  }

  const pos = await input.db.positionFor(
    row.referral_code,
    input.config.referral.jumpsPerReferral,
  );
  if (!pos) return await renderGeneric(input);

  const firstName = row.name.trim().split(/\s+/)[0] || "there";
  const key = ogCacheKey({
    referralCode: row.referral_code,
    position: pos.position,
    referralCount: row.referral_count,
  });

  const cached = await input.cache.get(key);
  if (cached) return { bytes: cached, variant: "personalized", cacheHit: true };

  const element = input.template.personalized({
    brand: input.config.brand,
    firstName,
    position: pos.position,
  });
  const bytes = await input.render(element, 1200, 630);
  await input.cache.put(key, bytes);
  return { bytes, variant: "personalized", cacheHit: false };
}

async function renderGeneric(input: HandleOgInput): Promise<HandleOgOutput> {
  const key = ogCacheKey({});
  const cached = await input.cache.get(key);
  if (cached) return { bytes: cached, variant: "generic", cacheHit: true };

  const element = input.template.generic({ brand: input.config.brand });
  const bytes = await input.render(element, 1200, 630);
  await input.cache.put(key, bytes);
  return { bytes, variant: "generic", cacheHit: false };
}
