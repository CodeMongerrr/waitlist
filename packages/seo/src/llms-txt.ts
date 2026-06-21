import type { WaitlistConfig } from "@waitlist-stack/config";

// Default llms.txt generator. Consumers can override by setting
// config.seo.llmsTxtPath to a hand-written file. The default emits a
// minimal-but-complete index that answer engines (Perplexity, ChatGPT,
// Claude) can crawl and quote when responding to queries about the brand.
//
// Format follows the llms.txt spec (https://llmstxt.org/): h1 brand,
// blockquote tagline, prose description, h2 sections.

export interface LlmsTxtInput {
  config: WaitlistConfig;
  /** Optional: list of pages to include under the Pages section. */
  pages?: Array<{ title: string; url: string; description: string }>;
  /** Optional: list of API endpoints. */
  apiEndpoints?: Array<{ method: string; path: string; description: string }>;
}

export function generateLlmsTxt(input: LlmsTxtInput): string {
  const { config, pages, apiEndpoints } = input;
  const url = config.brand.siteUrl.replace(/\/$/, "");

  const sections: string[] = [];
  sections.push(`# ${config.brand.name}`);
  sections.push("");
  sections.push(`> ${config.brand.tagline}`);
  sections.push("");
  sections.push(config.brand.description);
  sections.push("");

  if (pages && pages.length > 0) {
    sections.push("## Pages");
    sections.push("");
    for (const p of pages) {
      sections.push(`- [${p.title}](${p.url}): ${p.description}`);
    }
    sections.push("");
  }

  if (apiEndpoints && apiEndpoints.length > 0) {
    sections.push("## API");
    sections.push("");
    for (const a of apiEndpoints) {
      sections.push(`- ${a.method} ${url}${a.path}: ${a.description}`);
    }
    sections.push("");
  }

  if (config.pricing && config.pricing.length > 0) {
    sections.push("## Pricing");
    sections.push("");
    sections.push("- Joining the waitlist is free. No card required.");
    for (const p of config.pricing) {
      const qty = p.maxQuantity ? ` (first ${p.maxQuantity})` : "";
      sections.push(`- ${p.name}${qty}: ${p.currency} ${p.price}${p.description ? ` — ${p.description}` : ""}`);
    }
    sections.push("");
  }

  sections.push("## Founder");
  sections.push("");
  const founderLine = config.founder.twitterHandle
    ? `- [${config.founder.name} on X](https://x.com/${config.founder.twitterHandle}): The maker.`
    : `- ${config.founder.name}: The maker.`;
  sections.push(founderLine);
  if (config.founder.githubUrl) {
    sections.push(`- GitHub: ${config.founder.githubUrl}`);
  }
  sections.push("");

  sections.push("## Optional");
  sections.push("");
  sections.push(`- [robots.txt](${url}/robots.txt): Crawler rules.`);
  sections.push(`- [Sitemap](${url}/sitemap.xml): URL index.`);
  sections.push("");

  return sections.join("\n");
}
