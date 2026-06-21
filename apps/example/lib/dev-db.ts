import type { D1Database } from "@cloudflare/workers-types";

// In-memory D1 stand-in for `npm run dev`. Loads better-sqlite3 lazily so
// the dependency never ships in a Cloudflare Worker bundle (the production
// path goes through @opennextjs/cloudflare and uses the real D1 binding).
//
// State persists across requests within a single Next dev process; restart
// `npm run dev` to wipe. Migrations are pulled directly from the
// @waitlist-stack/db package so the dev schema matches production exactly.
//
// To exercise a real D1 locally instead of this in-memory copy, run
// `npm run preview` (which uses wrangler dev with bindings).

// Hoist the cached DB onto globalThis. Next dev re-evaluates module scope
// between requests under HMR, so a plain module-level `let` resets every
// hit. globalThis survives the dev process lifetime.
const GLOBAL_KEY = "__waitlist_stack_dev_d1__";
type GlobalCache = { [K in typeof GLOBAL_KEY]?: D1Database };

export async function getDevD1(): Promise<D1Database> {
  const g = globalThis as unknown as GlobalCache;
  if (g[GLOBAL_KEY]) return g[GLOBAL_KEY];

  const [{ default: Database }, { readFileSync, readdirSync }, { join }] =
    await Promise.all([
      import("better-sqlite3"),
      import("node:fs"),
      import("node:path"),
    ]);

  const sqlite = new Database(":memory:");
  // Resolve migrations relative to the workspace root. Works under
  // pnpm workspaces because @waitlist-stack/db is symlinked into
  // node_modules/@waitlist-stack/db pointing at packages/db.
  const migrationsDir = join(
    process.cwd(),
    "..",
    "..",
    "packages",
    "db",
    "migrations",
  );
  for (const file of readdirSync(migrationsDir).sort()) {
    if (file.endsWith(".sql")) {
      sqlite.exec(readFileSync(join(migrationsDir, file), "utf8"));
    }
  }

  console.warn(
    "\n[dev-db] No D1 binding present. Using in-memory SQLite for local dev.\n" +
      "         State resets when the dev server restarts.\n" +
      "         For real D1: run `npm run preview` (wrangler dev) instead.\n",
  );

  g[GLOBAL_KEY] = wrap(sqlite) as unknown as D1Database;
  return g[GLOBAL_KEY];
}

// Mock D1 contract. Mirrors the surface used by @waitlist-stack/db's typed
// client (prepare → bind → first/all/run/exec). Anything new added there
// also has to land here.

interface BetterSqliteStatement {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): unknown;
}
interface BetterSqliteDb {
  prepare(sql: string): BetterSqliteStatement;
  exec(sql: string): unknown;
}

function wrap(db: BetterSqliteDb) {
  class Stmt {
    private params: unknown[] = [];
    constructor(private readonly sql: string) {}
    bind(...p: unknown[]) {
      const next = new Stmt(this.sql);
      next.params = p;
      return next;
    }
    async first<T = Record<string, unknown>>(): Promise<T | null> {
      return (db.prepare(this.sql).get(...this.params) as T | undefined) ?? null;
    }
    async all<T = Record<string, unknown>>() {
      return {
        results: db.prepare(this.sql).all(...this.params) as T[],
        success: true,
        meta: {},
      };
    }
    async run() {
      db.prepare(this.sql).run(...this.params);
      return { success: true, meta: {} };
    }
  }
  return {
    prepare(sql: string) {
      return new Stmt(sql);
    },
    async exec(sql: string) {
      db.exec(sql);
      return { count: 0, duration: 0 };
    },
    async batch() {
      throw new Error("batch() not implemented in dev DB");
    },
    async dump(): Promise<ArrayBuffer> {
      throw new Error("dump() not implemented in dev DB");
    },
  };
}
