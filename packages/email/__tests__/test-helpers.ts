import Database from "better-sqlite3";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { WaitlistDb } from "@waitlist-stack/db";

class Stmt {
  private params: unknown[] = [];
  constructor(private readonly db: Database.Database, private readonly sql: string) {}
  bind(...p: unknown[]) {
    const n = new Stmt(this.db, this.sql);
    n.params = p;
    return n;
  }
  async first<T = Record<string, unknown>>(): Promise<T | null> {
    return (this.db.prepare(this.sql).get(...this.params) as T | undefined) ?? null;
  }
  async all<T = Record<string, unknown>>() {
    return {
      results: this.db.prepare(this.sql).all(...this.params) as T[],
      success: true,
      meta: {},
    };
  }
  async run() {
    this.db.prepare(this.sql).run(...this.params);
    return { success: true, meta: {} };
  }
}

class MockD1 {
  constructor(private readonly db: Database.Database) {}
  prepare(sql: string) {
    return new Stmt(this.db, sql);
  }
  async exec(sql: string) {
    this.db.exec(sql);
    return { count: 0, duration: 0 };
  }
  async batch() {
    throw new Error("batch() not implemented");
  }
  async dump(): Promise<ArrayBuffer> {
    throw new Error("dump() not implemented");
  }
}

export function createTestDb(): WaitlistDb {
  const sqlite = new Database(":memory:");
  const migrationsDir = join(
    fileURLToPath(new URL(".", import.meta.url)),
    "..",
    "..",
    "db",
    "migrations",
  );
  for (const f of readdirSync(migrationsDir).sort()) {
    if (f.endsWith(".sql")) {
      sqlite.exec(readFileSync(join(migrationsDir, f), "utf8"));
    }
  }
  return new WaitlistDb(new MockD1(sqlite) as unknown as import("@cloudflare/workers-types").D1Database);
}

// Generate a usable Svix-shaped secret. Format: whsec_<base64>.
export function makeSvixSecret(): string {
  const raw = new Uint8Array(32);
  crypto.getRandomValues(raw);
  return "whsec_" + btoa(String.fromCharCode(...raw));
}
