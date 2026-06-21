#!/usr/bin/env node

// One-shot Resend verification.
//
//   npm run test-email                     -> sandbox: from onboarding@resend.dev
//                                            to delivered@resend.dev. Works
//                                            with just an API key, no DNS, no
//                                            verified domain. Confirms the
//                                            wire is alive.
//   npm run test-email -- you@example.com  -> real send: from waitlist.config
//                                            fromAddress to your inbox.
//                                            Requires verified domain.
//
// Sandbox mode is the right first call after pasting your API key. Once
// that passes, do the DNS work in RESEND_SETUP.md and re-run with a real
// recipient.

import { readFileSync } from "node:fs";

const recipient = process.argv[2];
const sandboxMode = !recipient;

if (recipient && !recipient.includes("@")) {
  console.error("Usage: npm run test-email                     # sandbox roundtrip, no DNS");
  console.error("       npm run test-email -- <to-address>     # real send, needs verified domain");
  process.exit(1);
}

let devVars;
try {
  devVars = readFileSync(".dev.vars", "utf8");
} catch {
  console.error("Could not read .dev.vars in the current directory.");
  console.error("Run this from your project root (where .dev.vars lives).");
  process.exit(1);
}

const apiKey = (devVars.match(/^RESEND_API_KEY=(.*)$/m) || [])[1]?.trim();
const PLACEHOLDER_PATTERNS = [/^re_paste/, /^re_your/, /^re_xxxxx?$/, /placeholder/i];
if (!apiKey || PLACEHOLDER_PATTERNS.some((p) => p.test(apiKey))) {
  console.error("RESEND_API_KEY in .dev.vars is empty or still the placeholder.");
  console.error("Get a key at https://resend.com/api-keys (free, no card) and paste it in .dev.vars.");
  process.exit(1);
}

let fromAddress, fromName, brandName;

if (sandboxMode) {
  // Resend's onboarding sender + a recipient that simulates a delivered event.
  // Both are owned by Resend, so neither requires domain verification.
  fromAddress = "onboarding@resend.dev";
  fromName = "Waitlist Stack Sandbox";
  brandName = "sandbox";
} else {
  let config;
  try {
    config = readFileSync("waitlist.config.ts", "utf8");
  } catch {
    console.error("Could not read waitlist.config.ts. Run from your project root.");
    process.exit(1);
  }
  fromAddress = (config.match(/fromAddress:\s*"([^"]+)"/) || [])[1];
  fromName = (config.match(/fromName:\s*"([^"]+)"/) || [])[1];
  brandName = (config.match(/name:\s*"([^"]+)"/) || [])[1] || "your waitlist";
  if (!fromAddress) {
    console.error("Could not parse email.fromAddress from waitlist.config.ts.");
    process.exit(1);
  }
}

const to = sandboxMode ? "delivered@resend.dev" : recipient;
const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

console.log(sandboxMode ? "→ Sandbox roundtrip (no DNS required)" : "→ Sending test email");
console.log(`  from:   ${from}`);
console.log(`  to:     ${to}`);
if (!sandboxMode) console.log(`  brand:  ${brandName}`);
console.log("");

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to,
    subject: sandboxMode
      ? "waitlist-stack sandbox roundtrip"
      : `[test] ${brandName} email setup is working`,
    text: sandboxMode
      ? "Sandbox roundtrip from waitlist-stack. If Resend accepted this, your API key is valid and the email pipe is alive. Next: set up your real domain in RESEND_SETUP.md and re-run with a recipient address."
      : `This is a test email from your waitlist-stack setup.\n\nIf you can read this, your Resend API key is valid and your sending domain is verified.\n\nNext step: set up the webhook so email_status flips to "delivered" automatically. See RESEND_SETUP.md step 8.`,
    html: sandboxMode
      ? "<p>Sandbox roundtrip from <strong>waitlist-stack</strong>.</p><p>If Resend accepted this, your API key is valid and the email pipe is alive.</p><p>Next: set up your real domain in <code>RESEND_SETUP.md</code> and re-run with <code>npm run test-email -- you@example.com</code>.</p>"
      : `<p>This is a test email from your <strong>waitlist-stack</strong> setup.</p><p>If you can read this, your Resend API key is valid and your sending domain is verified.</p><p>Next step: set up the webhook so <code>email_status</code> flips to <code>delivered</code> automatically. See <code>RESEND_SETUP.md</code> step 8.</p>`,
  }),
});

const body = await res.json().catch(() => ({}));

if (res.ok && body.id) {
  if (sandboxMode) {
    console.log(`✓ Sandbox roundtrip succeeded. Resend message id: ${body.id}`);
    console.log("");
    console.log("  Your API key works and the email pipe is alive.");
    console.log("  delivered@resend.dev is a Resend test inbox; no real email sent.");
    console.log("");
    console.log("  Next step:");
    console.log("    1. Verify your real domain at https://resend.com/domains");
    console.log("    2. See RESEND_SETUP.md for the DNS records (Cloudflare DNS path)");
    console.log("    3. Re-run: npm run test-email -- you@yourdomain.com");
  } else {
    console.log(`✓ Sent. Resend message id: ${body.id}`);
    console.log("");
    console.log(`  Check ${recipient} in a minute (and the spam folder).`);
    console.log(`  Inspect this message in the Resend dashboard → Logs.`);
  }
  process.exit(0);
}

console.error(`✗ Failed (HTTP ${res.status}): ${body.message || JSON.stringify(body)}`);
console.error("");
console.error("  Common fixes:");
if (res.status === 401) {
  console.error(`    - API key is wrong or revoked. Generate a new one at`);
  console.error(`      https://resend.com/api-keys`);
} else if (res.status === 403 || res.status === 422) {
  if (sandboxMode) {
    console.error(`    - This shouldn't happen in sandbox mode. Check your`);
    console.error(`      account at https://resend.com — it may be restricted.`);
  } else {
    console.error(`    - The from address (${fromAddress}) isn't on a verified domain.`);
    console.error(`      Verify your domain at https://resend.com/domains`);
    console.error(`      Then set fromAddress in waitlist.config.ts to use that domain.`);
    console.error(`      To smoke-test without DNS, run: npm run test-email`);
  }
} else if (res.status === 429) {
  console.error(`    - Free tier rate limit hit (100/day or 3K/month).`);
  console.error(`      Wait or upgrade your Resend plan.`);
} else {
  console.error(`    - See https://resend.com/docs for status code ${res.status}.`);
}
console.error("");
console.error("  Full setup walkthrough: ./RESEND_SETUP.md");
process.exit(1);
