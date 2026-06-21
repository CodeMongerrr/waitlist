// Capture canonical README screenshots from a running dev server.
// Assumes apps/example dev server is up on http://localhost:3000.
//
//   pnpm --filter @waitlist-stack/example dev   # in another terminal
//   node scripts/screenshots.mjs

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(import.meta.url), "..", "..");
const outDir = resolve(repoRoot, "docs", "screenshots");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2, // retina; sharper README images
});

const page = await ctx.newPage();

console.log("→ landing hero (above fold)");
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(500); // let fonts settle
await page.screenshot({
  path: resolve(outDir, "landing-hero.png"),
  clip: { x: 0, y: 0, width: 1440, height: 900 },
});

console.log("→ landing full");
await page.screenshot({
  path: resolve(outDir, "landing-full.png"),
  fullPage: true,
});

console.log("→ subsystems section");
await scrollToText(page, "What every package does.");
await page.screenshot({
  path: resolve(outDir, "landing-subsystems.png"),
  clip: { x: 0, y: 0, width: 1440, height: 900 },
});

console.log("→ admin section");
await scrollToText(page, "See who joined. Retry what bounced.");
await page.screenshot({
  path: resolve(outDir, "landing-admin.png"),
  clip: { x: 0, y: 0, width: 1440, height: 900 },
});

await browser.close();
console.log(`✓ wrote screenshots to ${outDir}`);

// Scroll the first element whose own text equals `needle` into view.
// Uses the h2 title (rendered by PaperHead) as the anchor since each
// section's title is unique whereas section "kickers" can collide with
// body copy ("subsystems" appears in the hero sub-headline too).
async function scrollToText(page, needle) {
  await page.evaluate((target) => {
    const all = Array.from(document.querySelectorAll("body *"));
    const hit = all.find((el) => {
      const own = Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent ?? "")
        .join("")
        .trim();
      return own === target;
    });
    const section = hit?.closest("section") ?? hit;
    if (section) section.scrollIntoView({ block: "start" });
  }, needle);
  await page.waitForTimeout(400);
}
