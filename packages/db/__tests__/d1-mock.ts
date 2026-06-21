import Database from "better-sqlite3";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// In-process D1 stand-in. D1 is just SQLite, so a better-sqlite3 instance
// with the real migration files applied gives us actual schema coverage —
// not a mock object that lies about query results.

type D1RunResult = { success: true; meta: Record<string, unknown> };
type D1Result<T> = { results: T[]; success: true; meta: Record<string, unknown> };

class MockStatement {
  private boundParams: unknown[] = [];
  constructor(
    private readonly db: Database.Database,
    private readonly sql: string,
  ) {}

  bind(...params: unknown[]): MockStatement {
    const next = new MockStatement(this.db, this.sql);
    next.boundParams = params;
    return next;
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const stmt = this.db.prepare(this.sql);
    const row = stmt.get(...this.boundParams) as T | undefined;
    return row ?? null;
  }

  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    const stmt = this.db.prepare(this.sql);
    const rows = stmt.all(...this.boundParams) as T[];
    return { results: rows, success: true, meta: {} };
  }

  async run(): Promise<D1RunResult> {
    const stmt = this.db.prepare(this.sql);
    stmt.run(...this.boundParams);
    return { success: true, meta: {} };
  }
}

class MockD1 {
  constructor(private readonly db: Database.Database) {}
  prepare(sql: string): MockStatement {
    return new MockStatement(this.db, sql);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async batch(_statements: unknown[]): Promise<unknown[]> {
    throw new Error("batch() not implemented in mock");
  }
  async exec(sql: string): Promise<unknown> {
    this.db.exec(sql);
    return { count: 0, duration: 0 };
  }
  async dump(): Promise<ArrayBuffer> {
    throw new Error("dump() not implemented in mock");
  }
}

export function createTestD1() {
  const sqlite = new Database(":memory:");
  applyMigrations(sqlite);
  // Cast to D1Database via unknown — the mock implements the surface our
  // client.ts uses (prepare → bind → first/all/run). Anything we add to the
  // client that needs a different D1 method should be added here too.
  return new MockD1(sqlite) as unknown as import("@cloudflare/workers-types").D1Database;
}

function applyMigrations(sqlite: Database.Database) {
  const migrationsDir = join(
    fileURLToPath(new URL(".", import.meta.url)),
    "..",
    "migrations",
  );
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    sqlite.exec(sql);
  }
}
