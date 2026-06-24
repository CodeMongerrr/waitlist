import { describe, expect, it } from "vitest";
import config from "@/waitlist.config";

// Unit tests for the SEO metadata routes. sitemap.ts and robots.ts are both
// thin default-exported wrappers over @waitlist-stack/seo's buildSitemap /
// buildRobots, fed the real waitlist.config. We call them through with no
// mocking and assert the shapes Next's MetadataRoute contract relies on, plus
// that the configured siteUrl actually drives the output.

const SITE = config.brand.siteUrl.replace(/\/$/, "");

describe("app/sitemap", () => {
  it("returns a non-empty list of entries including the site root", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = sitemap();

    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);

    const urls = entries.map((e) => e.url);
    expect(urls).toContain(SITE);
  });

  it("gives the root entry a well-formed url and top priority", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = sitemap();

    const root = entries.find((e) => e.url === SITE);
    expect(root).toBeDefined();
    expect(root?.priority).toBe(1);
    expect(root?.changeFrequency).toBe("weekly");

    // Every emitted url is absolute and trailing-slash-free.
    for (const e of entries) {
      expect(e.url.startsWith("https://")).toBe(true);
      expect(e.url.endsWith("/")).toBe(false);
    }
  });
});

describe("app/robots", () => {
  it("returns rules + a sitemap url wired to the configured site", async () => {
    const { default: robots } = await import("@/app/robots");
    const result = robots();

    expect(result.sitemap).toBe(`${SITE}/sitemap.xml`);
    expect(Array.isArray(result.rules)).toBe(true);
    expect(result.rules.length).toBeGreaterThan(0);
  });

  it("allows / and /api/og while disallowing /api/ and the admin path", async () => {
    const { default: robots } = await import("@/app/robots");
    const result = robots();

    // Next allows rules to be a single rule object or an array; normalize.
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcard = rules.find((r) => r?.userAgent === "*");
    expect(wildcard).toBeDefined();

    const allow = ([] as string[]).concat(wildcard?.allow ?? []);
    const disallow = ([] as string[]).concat(wildcard?.disallow ?? []);

    expect(allow).toContain("/");
    expect(allow).toContain("/api/og");
    expect(disallow).toContain("/api/");

    const adminPath = config.admin.path.replace(/\/$/, "");
    expect(disallow).toContain(adminPath);
  });
});
