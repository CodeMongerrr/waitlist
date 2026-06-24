import { defineConfig, devices } from "@playwright/test";

// e2e runs the real app via `next dev`. With no Cloudflare binding, lib/cf.ts
// falls back to the in-memory dev DB (better-sqlite3, migrations auto-applied),
// so the full signup -> referral flow works in CI with zero database setup or
// secrets. (Plain `next start` is not used: getCloudflareContext() never
// resolves outside the Workers/OpenNext runtime, so the API routes hang.)
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["html", { outputFolder: "coverage/e2e", open: "never" }], ["list"]]
    : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    // Stills the 3D float-card bob (via the app's prefers-reduced-motion guard)
    // so submit buttons are "stable" for clicks instead of perpetually animating.
    reducedMotion: "reduce",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm exec next dev -p ${PORT}`,
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: { NEXT_TELEMETRY_DISABLED: "1", WAITLIST_FORCE_DEV_DB: "1" },
  },
});
