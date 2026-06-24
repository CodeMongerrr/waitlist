import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// `@/*` maps to the app root (mirrors tsconfig paths). Set manually rather than
// via vite-tsconfig-paths, which is ESM-only and can't be required by the
// vitest config loader.
const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": root.replace(/\/$/, "") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "{app,components,lib}/**/*.test.{ts,tsx}",
      "__tests__/**/*.test.{ts,tsx}",
    ],
    exclude: ["node_modules/**", ".next/**", ".open-next/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage/unit",
      reporter: ["text", "text-summary", "html", "lcov"],
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "components/ui/**", // generated shadcn primitives
        "app/layout.tsx", // next/font + metadata
        "app/icon.tsx", // generated icon
        "app/page.tsx", // 1-line composition (exercised by e2e)
        "app/api/og/route.tsx", // workers-og WASM (covered by packages/og + e2e)
        "lib/cf.ts", // Cloudflare context accessor (covered by packages + e2e)
        "lib/dev-db.ts", // dev/test-only in-memory DB; never ships to the Worker
        // Admin UI server/client components: their logic lives in
        // app/admin/actions.ts (~98% covered) + packages/admin (29 tests); the
        // rendered surfaces are exercised by the Playwright admin e2e.
        "app/admin/page.tsx",
        "app/admin/login/page.tsx",
        "app/admin/retry-controls.tsx",
      ],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 85,
        lines: 90,
      },
    },
  },
});
