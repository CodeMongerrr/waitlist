import { generateLlmsTxt } from "@waitlist-stack/seo";
import config from "../../waitlist.config";

export const dynamic = "force-static";

export function GET() {
  const body = generateLlmsTxt({
    config,
    pages: [
      {
        title: "Landing page",
        url: config.brand.siteUrl,
        description: "Public marketing surface with the signup form.",
      },
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/waitlist",
        description:
          "Public signup endpoint. JSON: name, email, source, ref. Returns position + referralCode.",
      },
      {
        method: "GET",
        path: "/api/og",
        description:
          "1200x630 OG card. Personalized when called with ?ref=CODE.",
      },
    ],
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=86400",
    },
  });
}
