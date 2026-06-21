import { type NextRequest } from "next/server";
import { WaitlistDb } from "@waitlist-stack/db";
import {
  GenericCard,
  MemoryOgCache,
  PersonalizedCard,
  R2OgCache,
  handleOg,
  type OgCache,
  type OgRenderer,
  type OgTemplate,
} from "@waitlist-stack/og";
import config from "../../../waitlist.config";
import { env } from "../../../lib/cf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Single in-memory fallback. Re-allocated per Worker instance, not per
// request, so it accumulates cache hits during a hot period before R2 is
// wired. Fine as a local-dev fallback.
const memoryFallback = new MemoryOgCache(50);

const template: OgTemplate = {
  personalized: (input) => <PersonalizedCard {...input} />,
  generic: (input) => <GenericCard {...input} />,
};

// workers-og pulls in WASM (yoga + resvg) that Node can't resolve at
// build time. Defer the import until first request; the open-next adapter
// inlines it for the Cloudflare Worker bundle at deploy time.
const render: OgRenderer = async (element, width, height) => {
  const { ImageResponse } = await import("workers-og");
  const res = new ImageResponse(element as React.ReactElement, { width, height });
  return res.arrayBuffer();
};

export async function GET(req: NextRequest) {
  const e = await env();
  const db = new WaitlistDb(e.DB);
  const cache: OgCache = e.OG_CACHE ? new R2OgCache(e.OG_CACHE) : memoryFallback;

  const url = new URL(req.url);
  const ref = url.searchParams.get("ref");

  const result = await handleOg({
    referralCode: ref,
    db,
    config,
    cache,
    template,
    render,
  });

  // Generic cards are immutable per deploy → long edge cache.
  // Personalized cards change as referrals come in → short cache.
  const cacheControl =
    result.variant === "generic"
      ? "public, max-age=300, s-maxage=86400, stale-while-revalidate=86400"
      : "public, max-age=60, s-maxage=300, stale-while-revalidate=300";

  return new Response(result.bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": cacheControl,
      "X-OG-Variant": result.variant,
      "X-OG-Cache": result.cacheHit ? "HIT" : "MISS",
    },
  });
}
