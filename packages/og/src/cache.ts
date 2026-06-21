import type { R2Bucket } from "@cloudflare/workers-types";

// Cache adapter interface. Consumers can plug R2, KV, in-memory, or
// nothing. The handler invokes get() before render and put() after.

export interface OgCache {
  get(key: string): Promise<ArrayBuffer | null>;
  put(key: string, bytes: ArrayBuffer): Promise<void>;
}

// Cache key includes referral_count so a referral bumping the position
// invalidates the cached image without an explicit purge. Generic (no ref)
// uses a fixed key so it caches forever per deploy.
export function ogCacheKey(input: {
  referralCode?: string;
  position?: number;
  referralCount?: number;
}): string {
  if (!input.referralCode) return "og:generic";
  return `og:${input.referralCode}:${input.position ?? 0}:${input.referralCount ?? 0}`;
}

// R2-backed cache. Uses immutable Cache-Control via the response side, not
// here — this layer just stores the raw bytes.
export class R2OgCache implements OgCache {
  constructor(private readonly bucket: R2Bucket) {}

  async get(key: string): Promise<ArrayBuffer | null> {
    const obj = await this.bucket.get(key);
    if (!obj) return null;
    return obj.arrayBuffer();
  }

  async put(key: string, bytes: ArrayBuffer): Promise<void> {
    await this.bucket.put(key, bytes, {
      httpMetadata: { contentType: "image/png" },
    });
  }
}

// In-memory cache. Useful for tests and for low-traffic deployments where
// you don't want to provision R2. Bound on number of entries.
export class MemoryOgCache implements OgCache {
  private readonly map = new Map<string, ArrayBuffer>();
  constructor(private readonly maxEntries = 100) {}

  async get(key: string): Promise<ArrayBuffer | null> {
    return this.map.get(key) ?? null;
  }

  async put(key: string, bytes: ArrayBuffer): Promise<void> {
    if (this.map.size >= this.maxEntries) {
      const first = this.map.keys().next().value;
      if (first !== undefined) this.map.delete(first);
    }
    this.map.set(key, bytes);
  }
}
