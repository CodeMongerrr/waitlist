#!/usr/bin/env node

import { intro, outro, text, select, confirm, isCancel, cancel, spinner, log } from "@clack/prompts";
import pc from "picocolors";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, "..", "templates", "example");

intro(pc.bgWhite(pc.black(" create-waitlist-stack ")));
log.message(
  pc.dim(
    "Scaffolds a Cloudflare-native waitlist (signup + referrals + email + OG + admin)\nin a fresh directory. Free to deploy on Cloudflare's free tier.",
  ),
);

const cliDir = process.argv[2];
const projectDir = cliDir ?? (await ask(text({
  message: "Project directory",
  placeholder: "my-waitlist",
  defaultValue: "my-waitlist",
  validate: (v) => (v && /^[a-z0-9._-]+$/i.test(v) ? undefined : "Use letters, numbers, dot, dash, or underscore."),
})));

const targetDir = resolve(process.cwd(), projectDir);
if (existsSync(targetDir)) {
  const overwrite = await ask(confirm({
    message: `${pc.yellow(projectDir)} already exists. Overwrite?`,
    initialValue: false,
  }));
  if (!overwrite) {
    cancel("Bailing without writing.");
    process.exit(0);
  }
  await rm(targetDir, { recursive: true, force: true });
}

log.step(pc.bold("Brand"));
const brandName = await ask(text({
  message: "Brand name",
  placeholder: "Acme Beta",
  validate: (v) => (v && v.length >= 2 ? undefined : "At least 2 characters."),
}));
const tagline = await ask(text({
  message: "One-sentence tagline",
  placeholder: "The fastest way to validate your idea.",
  defaultValue: "A new product in private beta.",
}));
const description = await ask(text({
  message: "Longer description (used in JSON-LD, meta tags, llms.txt)",
  placeholder: "Tell answer engines who you are and what you do.",
  defaultValue: tagline,
}));
const siteUrl = await ask(text({
  message: "Site URL (no trailing slash)",
  placeholder: "https://acme.example",
  defaultValue: "https://example.com",
  validate: (v) => (/^https?:\/\//.test(v) ? undefined : "Must start with http:// or https://"),
}));
const contactEmail = await ask(text({
  message: "Contact email (used in unsubscribe headers)",
  placeholder: "hello@acme.example",
  defaultValue: `hello@${hostFromUrl(siteUrl)}`,
}));

log.step(pc.bold("Founder"));
const founderName = await ask(text({
  message: "Your name",
  placeholder: "Alex Founder",
  validate: (v) => (v && v.trim().length >= 2 ? undefined : "Tell us your name."),
}));
const twitter = await ask(text({
  message: "Twitter / X handle (without the @, blank to skip)",
  placeholder: "alexbuilds",
  defaultValue: "",
}));
const githubUrl = await ask(text({
  message: "GitHub repo URL (blank if not public yet)",
  placeholder: "https://github.com/alex/acme",
  defaultValue: "",
}));

log.step(pc.bold("Email (Resend default; switch in waitlist.config.ts later)"));
const fromAddress = await ask(text({
  message: "From address (must be on a domain you've verified with Resend)",
  placeholder: `hello@${hostFromUrl(siteUrl)}`,
  defaultValue: `hello@${hostFromUrl(siteUrl)}`,
}));
const fromName = await ask(text({
  message: "From display name",
  placeholder: founderName,
  defaultValue: founderName,
}));
const resendApiKey = await ask(text({
  message: "Resend API key (leave blank, paste later in .dev.vars)",
  placeholder: "re_xxxxx",
  defaultValue: "",
}));

log.step(pc.bold("Cloudflare deploy"));
const cfAccount = await ask(text({
  message: "Cloudflare account ID (leave blank, paste later in wrangler.jsonc)",
  placeholder: "abc123def456",
  defaultValue: "REPLACE_WITH_YOUR_CLOUDFLARE_ACCOUNT_ID",
}));
const dbName = await ask(text({
  message: "D1 database name (you'll create with wrangler d1 create)",
  placeholder: "waitlist",
  defaultValue: "waitlist",
}));
const r2Name = await ask(text({
  message: "R2 bucket name for OG cache",
  placeholder: "waitlist-og",
  defaultValue: "waitlist-og",
}));

const adminPassword = generateAdminPassword();
const cookieSecret = crypto.randomBytes(32).toString("base64");

const sp = spinner();
sp.start("Scaffolding project");
await scaffoldProject({
  targetDir,
  projectDir,
  brandName,
  tagline,
  description,
  siteUrl,
  contactEmail,
  founderName,
  twitter,
  githubUrl,
  fromAddress,
  fromName,
  resendApiKey,
  cfAccount,
  dbName,
  r2Name,
  adminPassword,
  cookieSecret,
});
sp.stop("Project scaffolded.");

outro(`${pc.green("Done.")}\n
  ${pc.bold("Next steps:")}
    cd ${projectDir}
    npm install
    npm run dev      ${pc.dim("# preview at http://localhost:3000")}

  ${pc.bold("Deploy (Cloudflare free tier):")}
    npx wrangler login
    npx wrangler d1 create ${dbName}     ${pc.dim("# paste id into wrangler.jsonc")}
    npx wrangler r2 bucket create ${r2Name}
    npx wrangler d1 migrations apply ${dbName} --remote
    npm run deploy

  ${pc.bold("Customize the design:")}
    Open the project in Claude Code and ask it to redesign the
    landing, or paste a Stitch / Figma export. Theme tokens live in
    lib/theme.ts; component composition is in components/PaperLanding.tsx.

  ${pc.bold("Saved local secrets")} ${pc.dim("(.dev.vars, gitignored)")}:
    Admin password: ${pc.cyan(adminPassword)}
    Cookie secret:  ${pc.dim("(generated, check .dev.vars)")}
`);

// ---------- helpers ----------

async function ask(prompt) {
  const v = await prompt;
  if (isCancel(v)) {
    cancel("Bailing.");
    process.exit(0);
  }
  return v;
}

function hostFromUrl(url) {
  try {
    return new URL(url).host || "example.com";
  } catch {
    return "example.com";
  }
}

function generateAdminPassword() {
  // 256 bits, url-safe. Same entropy as the cookie secret so a future
  // reviewer doesn't see asymmetric strength and assume one of the two is
  // weak. The consumer can override; we just don't ship a flimsy default.
  return crypto.randomBytes(32).toString("base64url");
}

async function scaffoldProject(opts) {
  await cp(TEMPLATE_DIR, opts.targetDir, {
    recursive: true,
    filter: (p) => !/(node_modules|\.next|\.turbo|\.open-next|\.wrangler|tsbuildinfo)/.test(p),
  });

  // package.json: replace name placeholder.
  const pkgPath = join(opts.targetDir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.name = opts.projectDir;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // waitlist.config.ts: write a fresh one with answered values.
  await writeFile(join(opts.targetDir, "waitlist.config.ts"), buildConfig(opts));

  // wrangler.jsonc: copy from .example with substitutions.
  const wranglerSrc = await readFile(join(opts.targetDir, "wrangler.jsonc.example"), "utf8");
  const wrangler = wranglerSrc
    .replace("REPLACE_WITH_YOUR_CLOUDFLARE_ACCOUNT_ID", opts.cfAccount)
    .replace(/"database_name": "waitlist"/, `"database_name": "${opts.dbName}"`)
    .replace(/"bucket_name": "waitlist-og"/, `"bucket_name": "${opts.r2Name}"`);
  await writeFile(join(opts.targetDir, "wrangler.jsonc"), wrangler);

  // .dev.vars: secrets.
  const resendKey = opts.resendApiKey || "re_paste_when_ready";
  const webhookSecret = "whsec_paste_when_ready";
  const placeholders =
    resendKey === "re_paste_when_ready" || webhookSecret.endsWith("paste_when_ready");
  await writeFile(
    join(opts.targetDir, ".dev.vars"),
    `# Local secrets. Gitignored. Mirror these to production with:
#   npx wrangler secret put RESEND_API_KEY
#   npx wrangler secret put RESEND_WEBHOOK_SECRET
#   npx wrangler secret put ADMIN_PASSWORD
#   npx wrangler secret put ADMIN_COOKIE_SECRET
${placeholders ? "#\n# REPLACE the *_paste_when_ready placeholders before deploy.\n" : ""}
RESEND_API_KEY=${resendKey}
RESEND_WEBHOOK_SECRET=${webhookSecret}
ADMIN_PASSWORD=${opts.adminPassword}
ADMIN_COOKIE_SECRET=${opts.cookieSecret}
`,
  );

  // .gitignore: don't ship the secrets.
  const gitignorePath = join(opts.targetDir, ".gitignore");
  let gitignore = "";
  try {
    gitignore = await readFile(gitignorePath, "utf8");
  } catch {
    // file may not exist in template
  }
  if (!gitignore.includes(".dev.vars")) {
    gitignore += "\n.dev.vars\nwrangler.jsonc\n.wrangler\n.open-next\n";
    await writeFile(gitignorePath, gitignore);
  }

  // CLAUDE.md briefing for the consumer's Claude Code session.
  await writeFile(join(opts.targetDir, "CLAUDE.md"), buildClaudeMd(opts));

  // Drop the .example shadows since the real ones are populated.
  await rm(join(opts.targetDir, "wrangler.jsonc.example"), { force: true });
  await rm(join(opts.targetDir, ".dev.vars.example"), { force: true });
}

function buildConfig(o) {
  return `import { defineConfig } from "@waitlist-stack/config";

export default defineConfig({
  brand: {
    name: ${j(o.brandName)},
    tagline: ${j(o.tagline)},
    description: ${j(o.description)},
    siteUrl: ${j(o.siteUrl)},
    contactEmail: ${j(o.contactEmail)},
  },
  founder: {
    name: ${j(o.founderName)},${o.twitter ? `\n    twitterHandle: ${j(o.twitter)},` : ""}${o.githubUrl ? `\n    githubUrl: ${j(o.githubUrl)},` : ""}
  },
  email: {
    provider: "resend",
    fromAddress: ${j(o.fromAddress)},
    fromName: ${j(o.fromName)},
  },
});
`;
}

function j(v) {
  return JSON.stringify(v ?? "");
}

function buildClaudeMd(o) {
  return `# ${o.brandName}

This project was scaffolded by ${pcSafe("create-waitlist-stack")}. It's a Cloudflare-native waitlist (signup + referrals + email + OG images + admin) deployable on Cloudflare's free tier.

## Wizard answers (frozen at scaffold time)

- Brand name: ${o.brandName}
- Tagline: ${o.tagline}
- Site URL: ${o.siteUrl}
- Founder: ${o.founderName}${o.twitter ? ` (@${o.twitter})` : ""}
- Email provider: resend (from ${o.fromAddress})
- D1 db: ${o.dbName} | R2 bucket: ${o.r2Name}

If any of these change, edit \`waitlist.config.ts\` and \`wrangler.jsonc\`.

## Architecture (so you know where to edit)

- \`waitlist.config.ts\` — single source of truth. Brand, founder, pricing, referral mechanics, rate limits. Every package reads from here.
- \`app/\` — Next.js 15 App Router. The signup form lives in \`components/SignupForm.tsx\` and POSTs to \`/api/waitlist\`. Admin dashboard at \`/admin\`.
- \`lib/theme.ts\` — visual theme tokens. **Edit here for colors, fonts, spacing.**
- \`components/PaperLanding.tsx\` — the landing composition. Eight sections (header, hero, stack diagram, code switcher, subsystems, worked example, admin preview, CTA, footer). **Edit here for layout changes.**
- All backend logic comes from \`@waitlist-stack/{db,core,email,og,seo,admin}\` packages on npm. Do NOT vendor them; update via npm.

## How to customize the design

**Option A (recommended):** Open this project in Claude Code and describe what you want. Claude reads \`lib/theme.ts\` and \`components/PaperLanding.tsx\` and edits in place. Examples:
  - "Change the accent color from red to blue."
  - "Swap the hero copy to focus on developers, not founders."
  - "Add a testimonials section between the worked example and CTA."

**Option B:** Use Claude Design (Stitch) to generate a fresh design, export it as React, then ask Claude Code to wire it into this project keeping the API contracts.

**Option C:** Hand-edit \`components/PaperLanding.tsx\` directly. The components are inline-styled (no Tailwind).

## How to deploy (Cloudflare free tier)

\`\`\`sh
npx wrangler login                                # one-time
npx wrangler d1 create ${o.dbName}                # creates the D1 db, prints id
# paste the id into wrangler.jsonc d1_databases[0].database_id
npx wrangler r2 bucket create ${o.r2Name}         # creates the OG cache bucket
npx wrangler d1 migrations apply ${o.dbName} --remote
npm run deploy                                    # opennextjs build + wrangler deploy
\`\`\`

After first deploy, set production secrets:

\`\`\`sh
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_WEBHOOK_SECRET
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_COOKIE_SECRET
\`\`\`

## Resend setup checklist

Email won't work until Resend is configured. Two paths — start with the 2-minute sandbox to confirm the wire is alive, then do the DNS work to send from your own domain.

### A. Quick verify (2 min, no DNS)

1. Sign up at https://resend.com (free tier: 100/day, 3K/month, no card)
2. **API Keys → Create** with Sending access. Copy the \`re_...\` key.
3. Paste into \`.dev.vars\`:
   \`\`\`
   RESEND_API_KEY=re_your_key_here
   \`\`\`
4. \`npm run test-email\` (no args → sandbox: from \`onboarding@resend.dev\` to \`delivered@resend.dev\`, both Resend-owned, no DNS needed).

If you see \`✓ Sandbox roundtrip succeeded\`, your API key works and the integration is correctly wired. Move on to B.

### B. Send from your own domain (15 min, DNS work)

5. **Domains → Add Domain** in Resend with your real sending domain (the host of \`brand.siteUrl\`)
6. Resend shows 3 DNS records (SPF, DKIM, DMARC). Paste them into Cloudflare DNS → Records. Set proxy to **DNS only** (gray cloud).
7. Click **Verify DNS Records** in Resend (usually passes within 5 min on Cloudflare DNS)
8. \`npm run test-email -- you@example.com\` — sends a real message using \`fromAddress\` from \`waitlist.config.ts\`. If the email arrives, you're done.

Read \`RESEND_SETUP.md\` for the full DNS playbook + troubleshooting table.

**After first deploy:** in Resend → Webhooks → Add Endpoint, point at \`https://your-site.com/api/resend-webhook\`, subscribe to delivered/bounced/complained/failed, copy the \`whsec_...\` signing secret, set with \`wrangler secret put RESEND_WEBHOOK_SECRET\`.

> **Optional improvement (not yet implemented):** the CLI wizard could hit Resend's \`/domains\` API at scaffold time to verify the API key is valid and at least one domain is verified — turning the "I deployed but nothing sends" failure into a scaffold-time error. PR welcome; the scaffolder lives in \`packages/create-waitlist-stack/bin/cli.js\` in the upstream repo.

## Local dev

\`\`\`sh
npm run dev    # http://localhost:3000
\`\`\`

The dev server uses an in-memory D1 stand-in via the OpenNext dev mode. To test against a real D1 locally: \`npm run preview\`.
`;
}

function pcSafe(s) {
  return s; // placeholder; if pc was bound here it'd be applied
}
