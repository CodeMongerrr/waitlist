import { describe, expect, it } from "vitest";
import { defineConfig } from "@waitlist-stack/config";
import {
  buildAllJsonLd,
  buildOrganization,
  buildSoftwareApplication,
} from "../src/json-ld.js";

const baseConfig = () =>
  defineConfig({
    brand: {
      name: "Quill",
      tagline: "Strip AI tells.",
      description: "A writing tool.",
      siteUrl: "https://quill.example",
    },
    founder: { name: "Sam Quill" },
    email: { provider: "resend", fromAddress: "f@quill.example", fromName: "Q" },
  });

describe("buildOrganization", () => {
  it("emits required schema.org fields", () => {
    const o = buildOrganization(baseConfig());
    expect(o["@context"]).toBe("https://schema.org");
    expect(o["@type"]).toBe("Organization");
    expect(o.name).toBe("Quill");
    expect(o.url).toBe("https://quill.example");
    expect(o.logo).toBe("https://quill.example/icon");
  });

  it("propagates founder.name from config (regression guard)", () => {
    // The contract: founder.name in the JSON-LD comes from config.founder.name,
    // not a hardcoded literal. Easy bug to introduce by leaving placeholder
    // text behind during a refactor; this guard catches it.
    const o = buildOrganization(baseConfig());
    expect(o.founder).toEqual({ "@type": "Person", name: "Sam Quill" });
  });

  it("emits sameAs only when handles are configured", () => {
    const noHandles = buildOrganization(baseConfig());
    expect(noHandles).not.toHaveProperty("sameAs");

    const withHandles = buildOrganization(
      defineConfig({
        brand: { name: "Q", tagline: "t", description: "d", siteUrl: "https://q.example" },
        founder: { name: "Sam", twitterHandle: "samq", githubUrl: "https://github.com/sam/q" },
        email: { provider: "resend", fromAddress: "f@q.example", fromName: "Q" },
      }),
    );
    expect(withHandles.sameAs).toEqual([
      "https://x.com/samq",
      "https://github.com/sam/q",
    ]);
  });
});

describe("buildSoftwareApplication", () => {
  it("includes pricing offers when configured", () => {
    const o = buildSoftwareApplication({
      ...baseConfig(),
      pricing: [
        { name: "Founding", price: 79, currency: "USD", maxQuantity: 200 },
        { name: "Annual", price: 99, currency: "USD" },
      ],
    });
    const offers = o.offers as Array<Record<string, unknown>>;
    expect(offers).toHaveLength(2);
    expect(offers[0].price).toBe("79");
    expect(offers[0].eligibleQuantity).toEqual({
      "@type": "QuantitativeValue",
      maxValue: 200,
    });
    expect(offers[1]).not.toHaveProperty("eligibleQuantity");
  });

  it("omits offers when no pricing", () => {
    const o = buildSoftwareApplication(baseConfig());
    expect(o).not.toHaveProperty("offers");
  });
});

describe("buildAllJsonLd", () => {
  it("returns Organization, WebSite, SoftwareApplication in that order", () => {
    const blocks = buildAllJsonLd(baseConfig());
    expect(blocks.map((b) => b["@type"])).toEqual([
      "Organization",
      "WebSite",
      "SoftwareApplication",
    ]);
  });
});
