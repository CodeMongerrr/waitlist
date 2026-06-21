# create-waitlist-stack

The CLI scaffolder for [waitlist-stack](https://github.com/Giri-Aayush/waitlist-stack). Scaffolds a Cloudflare-native waitlist (signup + referrals + email + OG + admin) in a fresh directory.

## Usage

```sh
npm create waitlist-stack@latest my-waitlist
# or
pnpm create waitlist-stack my-waitlist
# or
yarn create waitlist-stack my-waitlist
```

The wizard prompts for:

- Brand name, tagline, description, site URL, contact email
- Your name + Twitter/X handle + GitHub repo URL
- Email provider (Resend default), from address, optional API key
- Cloudflare account ID, D1 database name, R2 bucket name

Then writes:

- `waitlist.config.ts` populated with your answers
- `wrangler.jsonc` with bindings for D1 + R2 + Workers
- `.dev.vars` with a generated admin password and cookie secret
- `CLAUDE.md` briefing your Claude Code session on where things live and how to customize the design

After scaffolding:

```sh
cd my-waitlist
npm install
npm run dev    # preview at http://localhost:3000
```

To deploy:

```sh
npx wrangler login
npx wrangler d1 create <your-db-name>
npx wrangler r2 bucket create <your-bucket-name>
npx wrangler d1 migrations apply <your-db-name> --remote
npm run deploy
```

Free tier covers ~3K signups/month. No card required to launch.

## License

MIT.
