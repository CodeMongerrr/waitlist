import { defineConfig } from "@waitlist-stack/config";

// Single source of truth for product-specific config. Every package reads
// from here, so changing brand.name updates the OG cards, JSON-LD, email
// subject lines, and page metadata in one shot.
//
// siteUrl is a placeholder until the Cloudflare deploy returns a real
// *.workers.dev URL (or a custom domain is attached). Update it then so OG
// share links, JSON-LD, and welcome-email links point at the live site.

export default defineConfig({
  brand: {
    name: "Catalyst",
    tagline: "Grow on X in your own voice, without it becoming your job.",
    description:
      "Catalyst is an autonomous multi-agent system that researches, drafts, and schedules posts in your own voice. Nothing posts without your approval. Spend about ten minutes a day approving drafts; everything else runs itself.",
    siteUrl: "https://catalyst-waitlist.aayushgiri1234.workers.dev",
    contactEmail: "hello@catalyst.app",
  },
  founder: {
    name: "Catalyst",
  },
  // Brief: a friend joining via ?ref=<code> moves the referrer up 5 spots.
  referral: {
    jumpsPerReferral: 5,
  },
  email: {
    provider: "resend",
    // Matches RESEND_FROM ("Catalyst <onboarding@resend.dev>"). The
    // onboarding@resend.dev test sender only delivers to your own Resend
    // account email until you verify a sending domain; swap this to
    // hello@yourdomain once a domain is verified.
    fromAddress: "onboarding@resend.dev",
    fromName: "Catalyst",
  },
  og: {
    // In-memory cache: R2 is not enabled on this account. OG cards still
    // render fully (workers-og), they just aren't persisted between requests.
    cache: "memory",
    title: "Catalyst",
    subtitle: "Autonomous X growth, in your voice. Human-approved.",
  },
  seo: {
    keywords: [
      "x growth",
      "twitter growth",
      "ai ghostwriter",
      "your voice",
      "devrel",
      "founder",
      "indie hacker",
    ],
  },
  // No pricing: the page takes emails, nothing more. An empty pricing list
  // means no priced offers appear in the JSON-LD.
});
