import type { WaitlistConfig } from "@waitlist-stack/config";

// Schema.org JSON-LD blocks. Google reads Organization + WebSite +
// SoftwareApplication for rich results; Perplexity / ChatGPT / Claude
// extract these blocks when answering queries about the brand. Keep the
// content here in sync with the visible page so an agent's answer matches
// what a human visitor sees.
//
// No FAQPage block: since 2023 Google only shows FAQ rich results for
// gov/health domains AND requires the Q&As to be visibly rendered. The
// llms.txt file complements JSON-LD with a single crawlable index.

export interface JsonLdBlock {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

export function buildOrganization(config: WaitlistConfig): JsonLdBlock {
  const sameAs: string[] = [];
  if (config.founder.twitterHandle) {
    sameAs.push(`https://x.com/${config.founder.twitterHandle}`);
  }
  if (config.founder.githubUrl) sameAs.push(config.founder.githubUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.brand.name,
    url: config.brand.siteUrl,
    logo: `${config.brand.siteUrl}/icon`,
    description: config.brand.description,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    founder: {
      "@type": "Person",
      name: config.founder.name,
    },
  };
}

export function buildWebsite(config: WaitlistConfig): JsonLdBlock {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.brand.name,
    url: config.brand.siteUrl,
    description: config.brand.tagline,
    publisher: { "@type": "Organization", name: config.brand.name },
  };
}

export function buildSoftwareApplication(
  config: WaitlistConfig,
  opts: {
    applicationCategory?: string;
    operatingSystem?: string;
  } = {},
): JsonLdBlock {
  const offers = (config.pricing ?? []).map((p) => ({
    "@type": "Offer",
    name: p.name,
    ...(p.description ? { description: p.description } : {}),
    price: String(p.price),
    priceCurrency: p.currency,
    availability: "https://schema.org/PreOrder",
    ...(p.maxQuantity
      ? { eligibleQuantity: { "@type": "QuantitativeValue", maxValue: p.maxQuantity } }
      : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: config.brand.name,
    applicationCategory: opts.applicationCategory ?? "ProductivityApplication",
    operatingSystem: opts.operatingSystem ?? "macOS, Windows",
    description: config.brand.description,
    ...(offers.length > 0 ? { offers } : {}),
    publisher: { "@type": "Organization", name: config.brand.name },
  };
}

export function buildAllJsonLd(config: WaitlistConfig): JsonLdBlock[] {
  return [
    buildOrganization(config),
    buildWebsite(config),
    buildSoftwareApplication(config),
  ];
}
