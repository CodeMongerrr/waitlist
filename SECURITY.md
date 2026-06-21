# Security policy

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security reports. Instead, email:

**aayushgiri1234@gmail.com**

Include:

- A description of the issue and its impact.
- Reproduction steps (a minimal proof-of-concept is great).
- The package and version (or commit SHA) where you found it.
- Optional: a suggested fix.

You should get an initial reply within **72 hours**. Coordinated disclosure is appreciated — give us a reasonable window to ship a fix before going public, and we will credit you in the release notes if you'd like.

## Scope

In scope:

- Auth bypass in `@waitlist-stack/admin` (signed-cookie session, login rate limit, middleware).
- Signature-bypass in `@waitlist-stack/email` (Svix webhook).
- SQL injection, open redirect, XSS, CSRF in `apps/example` and the scaffolded template.
- Anything that lets an unauth'd request read or modify the waitlist DB.
- Wizard (`create-waitlist-stack`) bugs that produce an insecure scaffold (e.g., empty secrets, world-readable `.dev.vars`).

Out of scope:

- Issues in third-party services (Resend, Cloudflare) — report to them directly.
- Vulnerabilities that require an already-compromised admin password.
- Self-XSS that needs a victim to paste attacker-supplied JS into devtools.
- DoS via traffic flood (use Cloudflare's built-in protections).

## Supported versions

The latest tagged release on `main` is supported. Older releases are not patched.
