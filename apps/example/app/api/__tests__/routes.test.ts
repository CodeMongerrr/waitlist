import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Database from "better-sqlite3";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// API route unit tests. The routes obtain their DB through lib/cf's `env()`,
// which normally drives @opennextjs/cloudflare's getCloudflareContext (and a
// dev-db fallback). Both of those are awkward in unit scope, so we mock
// `@/lib/cf` to hand the handlers a real in-memory SQLite D1 stand-in with the
// production migrations applied (same approach as packages/db's d1-mock). This
// gives genuine schema + query coverage without any Cloudflare runtime.
//
// packages/core + packages/db already cover signup orchestration and the query
// layer in depth; these tests assert the HTTP wiring: status codes, JSON
// shapes, honeypot routing, and the count/position payloads.

// ---------------------------------------------------------------------------
// In-process D1 stand-in. Mirrors the surface WaitlistDb uses (prepare -> bind
// -> first/all/run). One sqlite instance is created per test and swapped into
// the cf mock so state is isolated between cases.
// ---------------------------------------------------------------------------

type StubD1 = import("@cloudflare/workers-types").D1Database;

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
    return (this.db.prepare(this.sql).get(...this.boundParams) as T | undefined) ?? null;
  }
  async all<T = Record<string, unknown>>() {
    return {
      results: this.db.prepare(this.sql).all(...this.boundParams) as T[],
      success: true as const,
      meta: {},
    };
  }
  async run() {
    this.db.prepare(this.sql).run(...this.boundParams);
    return { success: true as const, meta: {} };
  }
}

class MockD1 {
  constructor(private readonly db: Database.Database) {}
  prepare(sql: string) {
    return new MockStatement(this.db, sql);
  }
  async batch(): Promise<unknown[]> {
    throw new Error("batch() not implemented in mock");
  }
  async exec(sql: string) {
    this.db.exec(sql);
    return { count: 0, duration: 0 };
  }
  async dump(): Promise<ArrayBuffer> {
    throw new Error("dump() not implemented in mock");
  }
}

// Migrations live in packages/db/migrations. Resolve from the monorepo root so
// the in-memory schema matches production exactly.
function migrationsDir(): string {
  const candidates = [
    join(process.cwd(), "..", "..", "packages", "db", "migrations"),
    join(process.cwd(), "packages", "db", "migrations"),
    join(process.cwd(), "migrations"),
  ];
  for (const d of candidates) {
    try {
      if (readdirSync(d).some((f) => f.endsWith(".sql"))) return d;
    } catch {
      /* try next */
    }
  }
  throw new Error("no migrations dir found for routes test");
}

function createTestD1(): StubD1 {
  const sqlite = new Database(":memory:");
  const dir = migrationsDir();
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    sqlite.exec(readFileSync(join(dir, file), "utf8"));
  }
  return new MockD1(sqlite) as unknown as StubD1;
}

// Holder the cf mock reads from. Reset per test for isolation.
let currentDb: StubD1;

vi.mock("@/lib/cf", () => ({
  // No RESEND_API_KEY so the POST handler never tries to send a welcome email.
  env: vi.fn(async () => ({ DB: currentDb, isDev: true })),
}));

// Route modules import "../../../waitlist.config" relatively; that resolves to
// the real config (jumpsPerReferral: 5, codeLength default 6). No mock needed.

const jsonRequest = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("api routes", () => {
  beforeEach(() => {
    currentDb = createTestD1();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("POST /api/waitlist", () => {
    it("returns ok + a referralCode + position for a valid email", async () => {
      const { POST } = await import("@/app/api/waitlist/route");
      const res = await POST(jsonRequest({ email: "alice@example.com" }) as never);

      expect(res.status).toBe(200);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.ok).toBe(true);
      expect(data.alreadyJoined).toBe(false);
      expect(typeof data.referralCode).toBe("string");
      expect((data.referralCode as string).length).toBe(6); // default codeLength
      expect(data.position).toBe(1); // first signup
      expect(data.referralCount).toBe(0);
    });

    it("traps a honeypot hit: success-shaped but never persisted", async () => {
      const { POST } = await import("@/app/api/waitlist/route");
      const res = await POST(
        jsonRequest({ email: "bot@example.com", website_url: "http://spam.example" }) as never,
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as Record<string, unknown>;
      // honeypot path returns the duplicate/no-op shape
      expect(data.ok).toBe(true);
      expect(data.alreadyJoined).toBe(true);
      expect(data.referralCode).toBeNull();
      expect(data.position).toBeNull();

      // and nothing was actually written: count endpoint still reads 0
      const { GET: countGet } = await import("@/app/api/waitlist/count/route");
      const countData = (await (await countGet()).json()) as { count: number | null };
      expect(countData.count).toBe(0);
    });

    it("treats a repeat email as alreadyJoined, returning the existing position", async () => {
      const { POST } = await import("@/app/api/waitlist/route");

      const first = (await (await POST(
        jsonRequest({ email: "dup@example.com" }) as never,
      )).json()) as Record<string, unknown>;
      const code = first.referralCode as string;

      const second = (await (await POST(
        jsonRequest({ email: "DUP@example.com" }) as never, // case-insensitive dedupe
      )).json()) as Record<string, unknown>;

      expect(second.ok).toBe(true);
      expect(second.alreadyJoined).toBe(true);
      expect(second.referralCode).toBe(code); // same row's code returned
      expect(second.position).toBe(1);
    });

    it("rejects malformed JSON with a 400", async () => {
      const { POST } = await import("@/app/api/waitlist/route");
      const res = await POST(jsonRequest("{not json") as never);
      expect(res.status).toBe(400);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.error).toMatch(/invalid json/i);
    });

    it("rejects a missing/invalid email with a 400 validation error", async () => {
      const { POST } = await import("@/app/api/waitlist/route");
      const res = await POST(jsonRequest({ email: "notanemail" }) as never);
      expect(res.status).toBe(400);
      const data = (await res.json()) as Record<string, unknown>;
      expect(typeof data.error).toBe("string");
    });

    it("credits the referrer 5 spots so the friend lands behind them", async () => {
      const { POST } = await import("@/app/api/waitlist/route");

      // Referrer joins first at position 1.
      const ref = (await (await POST(
        jsonRequest({ email: "ref@example.com" }) as never,
      )).json()) as Record<string, unknown>;
      const refCode = ref.referralCode as string;

      // A friend joins via that code.
      const friend = (await (await POST(
        jsonRequest({ email: "friend@example.com", ref: refCode }) as never,
      )).json()) as Record<string, unknown>;
      expect(friend.ok).toBe(true);
      expect(friend.alreadyJoined).toBe(false);

      // Referrer's referralCount is now reflected via the me endpoint.
      const { GET: meGet } = await import("@/app/api/waitlist/me/[code]/route");
      const meRes = await meGet(new Request("http://localhost/me") as never, {
        params: Promise.resolve({ code: refCode }),
      });
      const me = (await meRes.json()) as Record<string, unknown>;
      expect(me.referralCount).toBe(1);
      expect(me.jumpsPerReferral).toBe(5); // waitlist.config override
    });
  });

  describe("GET /api/waitlist/count", () => {
    it("returns { count: number } reflecting signups", async () => {
      const { GET } = await import("@/app/api/waitlist/count/route");
      const { POST } = await import("@/app/api/waitlist/route");

      let res = await GET();
      let data = (await res.json()) as { count: number | null };
      expect(data.count).toBe(0);

      await POST(jsonRequest({ email: "one@example.com" }) as never);
      await POST(jsonRequest({ email: "two@example.com" }) as never);

      res = await GET();
      data = (await res.json()) as { count: number | null };
      expect(data.count).toBe(2);
    });

    it("sets a short edge cache header on success", async () => {
      const { GET } = await import("@/app/api/waitlist/count/route");
      const res = await GET();
      expect(res.headers.get("Cache-Control")).toMatch(/max-age=10/);
    });

    it("returns { count: null } instead of throwing when the DB blows up", async () => {
      // Force the underlying query to fail by handing env() a broken DB.
      const broken = {
        prepare() {
          throw new Error("db unavailable");
        },
      } as unknown as StubD1;
      const prev = currentDb;
      currentDb = broken;
      try {
        const { GET } = await import("@/app/api/waitlist/count/route");
        const res = await GET();
        const data = (await res.json()) as { count: number | null };
        expect(data.count).toBeNull();
      } finally {
        currentDb = prev;
      }
    });
  });

  describe("GET /api/waitlist/me/[code]", () => {
    it("returns the full position payload for a valid, existing code", async () => {
      const { POST } = await import("@/app/api/waitlist/route");
      const joined = (await (await POST(
        jsonRequest({ email: "me@example.com" }) as never,
      )).json()) as Record<string, unknown>;
      const code = joined.referralCode as string;

      const { GET } = await import("@/app/api/waitlist/me/[code]/route");
      const res = await GET(new Request("http://localhost/me") as never, {
        params: Promise.resolve({ code }),
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.position).toBe(1);
      expect(data.baseRank).toBe(1);
      expect(data.referralCount).toBe(0);
      expect(data.jumpsPerReferral).toBe(5);
    });

    it("returns 400 for a malformed code (wrong length / charset)", async () => {
      const { GET } = await import("@/app/api/waitlist/me/[code]/route");
      const res = await GET(new Request("http://localhost/me") as never, {
        params: Promise.resolve({ code: "!!" }),
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.error).toMatch(/bad code/i);
    });

    it("returns 404 for a well-formed code that does not exist", async () => {
      const { GET } = await import("@/app/api/waitlist/me/[code]/route");
      // 6-char uppercase base32-ish code that was never issued.
      const res = await GET(new Request("http://localhost/me") as never, {
        params: Promise.resolve({ code: "ZZZZZZ" }),
      });
      expect(res.status).toBe(404);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.error).toMatch(/not found/i);
    });
  });
});
