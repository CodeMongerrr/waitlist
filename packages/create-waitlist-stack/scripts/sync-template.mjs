// Copies apps/example into templates/example so the published wizard can
// scaffold from a frozen snapshot. Run pre-publish (or whenever the example
// app changes) so the wizard ships the latest scaffolding.
//
//   node scripts/sync-template.mjs

import { cp, rm, mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const monorepoRoot = resolve(root, "..", "..");
const src = resolve(monorepoRoot, "apps", "example");
const dst = resolve(root, "templates", "example");

const SKIP = new Set([
  "node_modules",
  ".next",
  ".turbo",
  ".open-next",
  ".wrangler",
  "tsconfig.tsbuildinfo",
]);

await rm(dst, { recursive: true, force: true });
await mkdir(dst, { recursive: true });
await cp(src, dst, {
  recursive: true,
  filter: (path) => {
    const segments = path.split("/");
    return !segments.some((s) => SKIP.has(s));
  },
});

// Rewrite package.json: name → placeholder, drop workspace: protocol so the
// scaffold installs published versions of @waitlist-stack/* from npm.
const pkgPath = resolve(dst, "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
pkg.name = "{{PROJECT_NAME}}";
for (const dep of Object.keys(pkg.dependencies ?? {})) {
  if (dep.startsWith("@waitlist-stack/")) {
    pkg.dependencies[dep] = "^0.1.0";
  }
}
await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");

console.log(`synced template:\n  src: ${src}\n  dst: ${dst}`);
