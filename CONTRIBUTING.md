# Contributing

Thanks for considering a PR. The goal of this repo is to ship a complete, battletested waitlist template that any solo founder can deploy in 30 minutes. Contributions that move toward that goal are welcome.

## Quick setup

```sh
git clone https://github.com/Giri-Aayush/waitlist-stack
cd waitlist-stack
pnpm install
pnpm typecheck     # all packages
pnpm test          # 122 tests across 6 packages
pnpm build         # builds apps/example end-to-end
```

To work on the example app:

```sh
cd apps/example
cp .dev.vars.example .dev.vars   # fill in
pnpm dev                          # http://localhost:3000
```

To work on a specific package:

```sh
pnpm --filter @waitlist-stack/core test --watch
```

## What's a good PR

**Easy wins:**

- Implement the Postmark or SendGrid email adapters (currently stubs with the exact API shape in a `// PRs welcome` comment). See `packages/email/src/providers/`.
- Add tests around edge cases of the existing logic (especially position math at table sizes >100K).
- Fix typos, broken links, README clarifications.
- Improve the CLI wizard's prompts (better defaults, clearer error messages).

**Bigger lifts (open an issue first):**

- Adding a new package (e.g. webhooks for Slack notifications on signup).
- Changing the database schema. Migrations are append-only; we don't edit shipped ones.
- Swapping framework primitives (Next → Hono, etc.). Likely no, but discuss.

## What's NOT a good PR

- New features that move outside "waitlist for the validation phase". Multi-tenant, billing, full auth providers, etc. — those belong in a different project.
- Bumping deps to bleeding-edge versions just because. Each major version bump should fix a real problem.
- Style changes that don't improve clarity (em-dashes added, marketing language inserted, "delve into" appearing anywhere).

## Style rules

- **No em-dashes.** Use periods, commas, colons, parens.
- **Banned words**: "genuinely," "straightforward," "crucially," "moreover," "furthermore," "delve," "unlock," "ecosystem" as a buzzword, "seamlessly," "holistic," "transformative."
- **Plain headings**, no emoji.
- **Default to no comments**. Only explain WHY, not WHAT, and only when non-obvious.
- **Three-part docs structure**: problem → mechanism → honest assessment.
- **Honest about limits**. Every README has a "What this is NOT" section.

## Commit messages

Conventional Commits, one logical change per commit. Don't batch a session's worth of changes into one big commit. The repo's history should read like a series of reviewable steps a contributor can pick up cold.

Examples:

```
feat(core): add Crockford base32 referral code generation
test(admin): cover session-version revoke path
fix(og): include referral_count in cache key so bumps invalidate
docs(readme): clarify Cloudflare free tier limits
```

## Tests

Critical-path coverage only. Don't add UI snapshot tests or trivial getter/setter tests. Do add tests for:

- Anything involving math (referral position, rate limit windows)
- Anything involving security (HMAC, Svix verification, password compare)
- Anything involving SQL (use the in-memory SQLite harness; D1 is just SQLite)
- Anything that's been wrong in the past (regression guards with a comment naming the bug)

## Releasing

Maintainers only. Each package version bumps independently in its `package.json`. The CLI wizard's `templates/example` is regenerated from `apps/example` via `pnpm --filter create-waitlist-stack sync-template`. After bumping, `npm publish` from each package dir.

## Code of conduct

Be kind. Don't be a jerk. Disagreement is fine, condescension is not.
