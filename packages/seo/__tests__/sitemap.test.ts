import { describe, expect, it } from "vitest";
import { defineConfig } from "@waitlist-stack/config";
import { buildSitemap, toSitemapXml } from "../src/sitemap.js";

const config = () =>
  defineConfig({
    brand: { name: "Q", tagline: "t", description: "d", siteUrl: "https://q.example/" },
    founder: { name: "S" },
    email: { provider: "resend", fromAddress: "f@q.example", fromName: "Q" },
  });

describe("buildSitemap", () => {
  it("returns one entry for / by default", () => {
    const s = buildSitemap(config());
    expect(s).toHaveLength(1);
    expect(s[0].url).toBe("https://q.example");
    expect(s[0].priority).toBe(1.0);
  });

  it("supports multiple paths with home priority 1.0 and others 0.7", () => {
    const s = buildSitemap(config(), ["/", "/about", "/pricing"]);
    expect(s.map((e) => e.url)).toEqual([
      "https://q.example",
      "https://q.example/about",
      "https://q.example/pricing",
    ]);
    expect(s[0].priority).toBe(1.0);
    expect(s[1].priority).toBe(0.7);
  });
});

describe("toSitemapXml", () => {
  it("emits a valid urlset XML structure", () => {
    const xml = toSitemapXml(buildSitemap(config(), ["/"]));
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<loc>https://q.example</loc>");
    expect(xml).toContain("<priority>1</priority>");
    expect(xml).toContain("</urlset>");
  });

  it("escapes XML special chars in URLs", () => {
    const xml = toSitemapXml([{ url: "https://q.example/path?a=1&b=2" }]);
    expect(xml).toContain("a=1&amp;b=2");
    expect(xml).not.toContain("a=1&b=2");
  });
});
