import { describe, expect, it } from "vitest";

// The llms.txt GET handler is a pure, dependency-light route: it composes the
// real waitlist.config with the real `generateLlmsTxt` builder from
// @waitlist-stack/seo. No Cloudflare context, DB, cookies, or network are
// touched, so we call straight through to the production code path and assert
// the HTTP envelope (status, content-type, cache) plus the brand markers and
// llms.txt structure the route is wired to emit.

describe("GET /llms.txt", () => {
  it("returns 200 with a text/plain body", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const res = GET();

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);
  });

  it("sets a cacheable edge header", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const res = GET();

    const cacheControl = res.headers.get("Cache-Control") ?? "";
    expect(cacheControl).toMatch(/public/);
    expect(cacheControl).toMatch(/max-age=300/);
    expect(cacheControl).toMatch(/s-maxage=86400/);
  });

  it("emits the brand name as the h1 heading and the tagline blockquote", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const body = await GET().text();

    // From waitlist.config: brand.name = "Catalyst".
    expect(body).toContain("# Catalyst");
    // Tagline rendered as a blockquote per the llms.txt spec.
    expect(body).toContain("> Post daily on X");
    // Prose description follows the blockquote.
    expect(body).toContain("Catalyst reads Reddit, Hacker News");
  });

  it("documents the public Pages and API surface the route passes in", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const body = await GET().text();

    expect(body).toContain("## Pages");
    expect(body).toContain("Landing page");

    expect(body).toContain("## API");
    // siteUrl-prefixed endpoint lines (trailing slash stripped by the builder).
    expect(body).toContain(
      "POST https://catalyst-waitlist.aayushgiri1234.workers.dev/api/waitlist",
    );
    expect(body).toContain(
      "GET https://catalyst-waitlist.aayushgiri1234.workers.dev/api/og",
    );
  });

  it("includes the Optional robots/sitemap discovery links", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const body = await GET().text();

    expect(body).toContain("## Optional");
    expect(body).toMatch(/\/robots\.txt\)/);
    expect(body).toMatch(/\/sitemap\.xml\)/);
  });

  it("returns a stable body across calls (force-static, no per-request state)", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const [first, second] = await Promise.all([GET().text(), GET().text()]);
    expect(first).toBe(second);
  });
});
