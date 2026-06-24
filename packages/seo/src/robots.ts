import type { WaitlistConfig } from "@waitlist-stack/config";

// Robots.txt builder. Disallows /admin and /api by default; consumer can
// pass extra disallows. Includes the sitemap URL.
//
// Returns a plain object compatible with Next.js MetadataRoute.Robots.
// Consumers using a different framework can render to text via toRobotsTxt.

export interface RobotsRule {
  userAgent: string;
  allow?: string | string[];
  disallow?: string | string[];
}

export interface RobotsConfig {
  rules: RobotsRule[];
  sitemap?: string;
  host?: string;
}

export function buildRobots(
  config: WaitlistConfig,
  opts: { extraDisallow?: string[]; allowAdmin?: boolean } = {},
): RobotsConfig {
  const url = config.brand.siteUrl.replace(/\/$/, "");
  const adminPath = config.admin.path.replace(/\/$/, "");
  const disallow: string[] = ["/api/"];
  if (!opts.allowAdmin) {
    disallow.push(adminPath, `${adminPath}/`);
  }
  if (opts.extraDisallow) disallow.push(...opts.extraDisallow);

  // /api is disallowed, but the OG share image lives at /api/og and MUST be
  // crawlable: Twitterbot, facebookexternalhit, and LinkedIn honor robots.txt
  // and will render no preview image if og:image is blocked. The longer Allow
  // path wins over the shorter Disallow for spec-compliant crawlers.
  return {
    rules: [{ userAgent: "*", allow: ["/", "/api/og"], disallow }],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}

export function toRobotsTxt(config: RobotsConfig): string {
  const lines: string[] = [];
  for (const rule of config.rules) {
    lines.push(`User-agent: ${rule.userAgent}`);
    if (rule.allow) {
      const items = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
      for (const a of items) lines.push(`Allow: ${a}`);
    }
    if (rule.disallow) {
      const items = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
      for (const d of items) lines.push(`Disallow: ${d}`);
    }
    lines.push("");
  }
  if (config.sitemap) lines.push(`Sitemap: ${config.sitemap}`);
  if (config.host) lines.push(`Host: ${config.host}`);
  return lines.join("\n");
}
