# @waitlist-stack/og

Brand-tokenized OpenGraph cards rendered with `workers-og` and cached in R2.

## What it does

- Renderer-agnostic handler: pass a request, get back a PNG. Variants for personalized (referral code → position) and fallback static cards.
- R2 cache: keyed by template + brand version + variant inputs. First render is slow (Satori + Yoga + Resvg as WASM); subsequent hits are edge-cached.
- Brand tokens (colors, font, copy) come from `@waitlist-stack/config` so swapping brand identity is one config change.

## Use it standalone

```ts
import { handleOgRequest } from "@waitlist-stack/og/handler";

export async function GET(req: Request) {
  return handleOgRequest(req, { config, cache: env.OG_CACHE });
}
```

Pass `cache: undefined` to skip R2 — useful in local dev. The cache binding is `OG_CACHE` in `wrangler.jsonc.example`.
