import { describe, expect, it } from "vitest";
import { welcomeEmail } from "../src/templates/welcome.js";
import { launchEmail } from "../src/templates/launch.js";

const BRAND = {
  name: "Quill",
  tagline: "t",
  description: "d",
  siteUrl: "https://quill.example",
};
const FOUNDER = { name: "Sam", twitterHandle: "samquill" };

describe("welcomeEmail", () => {
  it("includes position in subject when provided", () => {
    const e = welcomeEmail({
      brand: BRAND,
      founder: FOUNDER,
      recipientName: "Alex",
      position: 42,
    });
    expect(e.subject).toContain("#42");
    expect(e.subject).toContain("Quill");
  });

  it("falls back to 'you're in' subject when no position", () => {
    const e = welcomeEmail({ brand: BRAND, founder: FOUNDER, recipientName: "Alex" });
    expect(e.subject).toBe("you're in");
  });

  it("includes a share URL when referralCode present", () => {
    const e = welcomeEmail({
      brand: BRAND,
      founder: FOUNDER,
      recipientName: "Alex",
      referralCode: "ABCDEF",
    });
    expect(e.text).toContain("https://quill.example/?ref=ABCDEF");
    expect(e.html).toContain("https://quill.example/?ref=ABCDEF");
  });

  it("omits share URL when referralCode missing", () => {
    const e = welcomeEmail({ brand: BRAND, founder: FOUNDER, recipientName: "Alex" });
    expect(e.text).not.toContain("?ref=");
    expect(e.html).not.toContain("?ref=");
  });

  it("escapes HTML in brand and recipient names", () => {
    const e = welcomeEmail({
      brand: { ...BRAND, name: "<script>" },
      founder: { name: "Sam<script>", twitterHandle: 'evil"handle' },
      recipientName: "<img>",
    });
    expect(e.html).not.toContain("<script>");
    expect(e.html).not.toContain('evil"handle');
  });
});

describe("launchEmail", () => {
  it("includes the CTA url and label", () => {
    const e = launchEmail({
      brand: BRAND,
      founder: FOUNDER,
      recipientName: "Alex",
      ctaUrl: "https://quill.example/app",
      ctaLabel: "Open app",
    });
    expect(e.text).toContain("https://quill.example/app");
    expect(e.html).toContain("https://quill.example/app");
    expect(e.html).toContain("Open app");
  });

  it("escapes the CTA url in href attribute", () => {
    const e = launchEmail({
      brand: BRAND,
      founder: FOUNDER,
      recipientName: "Alex",
      ctaUrl: 'https://x.com/?a="bad',
    });
    expect(e.html).not.toContain('"bad');
  });
});
