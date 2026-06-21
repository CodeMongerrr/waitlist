import { describe, expect, it } from "vitest";
import { defineConfig } from "@waitlist-stack/config";
import { generateLlmsTxt } from "../src/llms-txt.js";

const config = () =>
  defineConfig({
    brand: {
      name: "Quill",
      tagline: "Strip AI tells.",
      description: "A writing tool that does X.",
      siteUrl: "https://quill.example",
    },
    founder: { name: "Sam", twitterHandle: "samq" },
    email: { provider: "resend", fromAddress: "f@q.example", fromName: "Q" },
    pricing: [{ name: "Founding", price: 79, currency: "USD", maxQuantity: 200 }],
  });

describe("generateLlmsTxt", () => {
  it("starts with brand h1 and tagline blockquote", () => {
    const txt = generateLlmsTxt({ config: config() });
    const lines = txt.split("\n");
    expect(lines[0]).toBe("# Quill");
    expect(lines[2]).toBe("> Strip AI tells.");
  });

  it("emits Pages section only when pages provided", () => {
    const without = generateLlmsTxt({ config: config() });
    expect(without).not.toContain("## Pages");

    const withPages = generateLlmsTxt({
      config: config(),
      pages: [{ title: "Landing", url: "https://quill.example/", description: "marketing" }],
    });
    expect(withPages).toContain("## Pages");
    expect(withPages).toContain("[Landing](https://quill.example/)");
  });

  it("emits Pricing section with founding-cohort cap when configured", () => {
    const txt = generateLlmsTxt({ config: config() });
    expect(txt).toContain("## Pricing");
    expect(txt).toContain("(first 200)");
    expect(txt).toContain("USD 79");
  });

  it("formats founder line with X link when twitterHandle present", () => {
    const txt = generateLlmsTxt({ config: config() });
    expect(txt).toContain("[Sam on X](https://x.com/samq)");
  });
});
