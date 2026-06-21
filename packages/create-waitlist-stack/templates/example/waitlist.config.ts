import { defineConfig } from "@waitlist-stack/config";

// Single source of truth for product-specific config. The CLI wizard
// (`pnpm create waitlist-stack`) writes this file; you can also edit it
// by hand. Every package reads from here, so changing brand.name updates
// the OG cards, JSON-LD, email subject lines, and the landing copy in
// one shot.

export default defineConfig({
  brand: {
    name: "Waitlist Stack Demo",
    tagline: "A Cloudflare-native waitlist template.",
    description:
      "An open-source waitlist template that ships signup, referrals, email, OG images, and admin in under 30 minutes. Free to deploy on Cloudflare's free tier.",
    siteUrl: "https://example.com",
    contactEmail: "hello@example.com",
  },
  founder: {
    name: "Your Name",
    twitterHandle: "yourhandle",
    githubUrl: "https://github.com/your-handle/waitlist-stack",
  },
  email: {
    provider: "resend",
    fromAddress: "hello@example.com",
    fromName: "Your Name",
  },
  pricing: [
    {
      name: "Founding cohort",
      price: 79,
      currency: "USD",
      description: "First 200 signups lock in for life.",
      maxQuantity: 200,
    },
    { name: "Standard annual", price: 99, currency: "USD" },
    { name: "Standard monthly", price: 14, currency: "USD" },
  ],
  seo: {
    keywords: ["waitlist", "saas", "cloudflare", "open source"],
  },
});
