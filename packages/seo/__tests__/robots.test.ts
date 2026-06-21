import { describe, expect, it } from "vitest";
import { defineConfig } from "@waitlist-stack/config";
import { buildRobots, toRobotsTxt } from "../src/robots.js";

const config = () =>
  defineConfig({
    brand: { name: "Q", tagline: "t", description: "d", siteUrl: "https://q.example/" },
    founder: { name: "S" },
    email: { provider: "resend", fromAddress: "f@q.example", fromName: "Q" },
    admin: { path: "/admin" },
  });

describe("buildRobots", () => {
  it("disallows /admin and /api by default", () => {
    const r = buildRobots(config());
    expect(r.rules[0].disallow).toContain("/admin");
    expect(r.rules[0].disallow).toContain("/admin/");
    expect(r.rules[0].disallow).toContain("/api/");
  });

  it("allows admin when allowAdmin opt is true", () => {
    const r = buildRobots(config(), { allowAdmin: true });
    expect(r.rules[0].disallow).not.toContain("/admin");
    expect(r.rules[0].disallow).toContain("/api/");
  });

  it("appends extraDisallow paths", () => {
    const r = buildRobots(config(), { extraDisallow: ["/internal", "/wip"] });
    expect(r.rules[0].disallow).toContain("/internal");
    expect(r.rules[0].disallow).toContain("/wip");
  });

  it("strips trailing slash from siteUrl in sitemap and host", () => {
    const r = buildRobots(config());
    expect(r.sitemap).toBe("https://q.example/sitemap.xml");
    expect(r.host).toBe("https://q.example");
  });
});

describe("toRobotsTxt", () => {
  it("renders user-agent, allow, disallow, sitemap, host", () => {
    const txt = toRobotsTxt(buildRobots(config()));
    expect(txt).toContain("User-agent: *");
    expect(txt).toContain("Allow: /");
    expect(txt).toContain("Disallow: /admin");
    expect(txt).toContain("Sitemap: https://q.example/sitemap.xml");
  });
});
