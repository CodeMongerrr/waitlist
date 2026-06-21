import type { WaitlistConfig } from "@waitlist-stack/config";

export interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

// Compatible with Next.js MetadataRoute.Sitemap; consumers using other
// frameworks can render to XML via toSitemapXml.

export function buildSitemap(
  config: WaitlistConfig,
  paths: string[] = ["/"],
): SitemapEntry[] {
  const url = config.brand.siteUrl.replace(/\/$/, "");
  return paths.map((p, i) => ({
    url: p === "/" ? url : `${url}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: i === 0 ? 1.0 : 0.7,
  }));
}

export function toSitemapXml(entries: SitemapEntry[]): string {
  const items = entries
    .map((e) => {
      const parts = [`<loc>${escapeXml(e.url)}</loc>`];
      if (e.lastModified) {
        const iso =
          typeof e.lastModified === "string"
            ? e.lastModified
            : e.lastModified.toISOString();
        parts.push(`<lastmod>${iso}</lastmod>`);
      }
      if (e.changeFrequency) parts.push(`<changefreq>${e.changeFrequency}</changefreq>`);
      if (e.priority !== undefined) parts.push(`<priority>${e.priority}</priority>`);
      return `  <url>\n    ${parts.join("\n    ")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
