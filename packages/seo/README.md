# @waitlist-stack/seo

JSON-LD, llms.txt, robots, sitemap, and dynamic favicon helpers.

## What it does

- **JSON-LD builders**: `Organization`, `Person` (founder), `WebSite`. Drop the output into `<script type="application/ld+json">`.
- **llms.txt**: assembles the file from your config (purpose, key URLs, FAQ). Serves at `/llms.txt` so AI crawlers find structured pointers.
- **robots / sitemap**: generated from the same config — change site URL once, both update.
- **Dynamic favicon**: brand-tinted PNG generated on the fly (no asset to ship).

## Use it standalone

```ts
import { robotsFor, sitemapFor, llmsTxtFor, jsonLdBlocks } from "@waitlist-stack/seo";

// app/robots.ts
export default function robots() { return robotsFor(config); }

// app/sitemap.ts
export default function sitemap() { return sitemapFor(config); }

// app/llms.txt/route.ts
export function GET() { return new Response(llmsTxtFor(config)); }
```

Everything is config-driven — no per-deploy strings hardcoded in source.
