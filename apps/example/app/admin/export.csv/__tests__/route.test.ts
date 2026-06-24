import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The export.csv GET handler is pure HTTP wiring on top of two boundaries:
// verifyAdmin() for the auth gate and a WaitlistDb query for the rows. We mock
// both so the unit under test is the auth short-circuit, the CSV assembly, the
// formula-injection guard, and the response headers. No Cloudflare runtime, no
// real DB, no real cookies.

const verifyAdminMock = vi.fn<[], Promise<boolean>>();

// raw().prepare(sql).bind(...binds).all<Row>() is the only DB surface the
// handler touches. capturedSql / capturedBinds let us assert the query wiring
// (q + status filters, ROW_LIMIT) while rowsToReturn feeds the CSV builder.
let rowsToReturn: Record<string, unknown>[] = [];
let capturedSql = "";
let capturedBinds: unknown[] = [];

const allMock = vi.fn(async () => ({ results: rowsToReturn, success: true, meta: {} }));

function makeFakeD1() {
  return {
    prepare(sql: string) {
      capturedSql = sql;
      return {
        bind(...binds: unknown[]) {
          capturedBinds = binds;
          return { all: allMock };
        },
      };
    },
  };
}

vi.mock("../../../../lib/admin-guard", () => ({
  verifyAdmin: () => verifyAdminMock(),
}));

vi.mock("../../../../lib/cf", () => ({
  env: vi.fn(async () => ({ DB: { __d1: true }, isDev: true })),
}));

vi.mock("@waitlist-stack/db", () => ({
  WaitlistDb: class {
    raw() {
      return makeFakeD1();
    }
  },
}));

const COLUMNS = [
  "id",
  "name",
  "email",
  "source",
  "created_at",
  "email_status",
  "email_attempts",
  "email_sent_at",
  "email_delivered_at",
  "email_last_error",
  "referral_code",
  "referred_by",
  "referral_count",
];

const row = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  source: "twitter",
  created_at: "2026-06-01T00:00:00.000Z",
  email_status: "sent",
  email_attempts: 1,
  email_sent_at: "2026-06-01T00:00:01.000Z",
  email_delivered_at: "2026-06-01T00:00:02.000Z",
  email_last_error: null,
  referral_code: "ABC123",
  referred_by: null,
  referral_count: 0,
  ...over,
});

// The handler reads req.nextUrl.searchParams (a NextRequest field), so we hand
// it a minimal object exposing nextUrl rather than a plain undici Request.
const req = (url = "http://localhost/admin/export.csv") =>
  ({ nextUrl: new URL(url) }) as unknown as Parameters<
    typeof import("../route").GET
  >[0];

describe("GET /admin/export.csv", () => {
  beforeEach(() => {
    verifyAdminMock.mockReset().mockResolvedValue(true);
    allMock.mockClear();
    rowsToReturn = [];
    capturedSql = "";
    capturedBinds = [];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("returns 401 (not a redirect) when unauthenticated", async () => {
    verifyAdminMock.mockResolvedValue(false);
    const { GET } = await import("../route");

    const res = await GET(req());

    expect(res.status).toBe(401);
    // Hard error, never a 3xx redirect to login.
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(await res.text()).toMatch(/unauthorized/i);
    // Bails before ever touching the DB.
    expect(allMock).not.toHaveBeenCalled();
  });

  it("returns 200 CSV with a header row + one data row per record", async () => {
    rowsToReturn = [
      row({ id: 1, name: "Alice", email: "alice@example.com" }),
      row({ id: 2, name: "Bob", email: "bob@example.com", source: null }),
    ];
    const { GET } = await import("../route");

    const res = await GET(req());

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/csv/);
    expect(res.headers.get("content-disposition")).toMatch(
      /attachment; filename="waitlist-\d{4}-\d{2}-\d{2}\.csv"/,
    );

    const body = await res.text();
    const lines = body.split("\n");
    expect(lines[0]).toBe(COLUMNS.join(","));
    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[1].startsWith("1,Alice,alice@example.com,")).toBe(true);
    expect(lines[2].startsWith("2,Bob,bob@example.com,")).toBe(true);
    // null source renders as an empty cell.
    expect(lines[2].split(",")[3]).toBe("");

    expect(res.headers.get("x-export-row-count")).toBe("2");
    expect(res.headers.get("x-export-truncated")).toBe("false");
  });

  it("emits only the header row when there are no records", async () => {
    rowsToReturn = [];
    const { GET } = await import("../route");

    const res = await GET(req());

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe(COLUMNS.join(","));
    expect(res.headers.get("x-export-row-count")).toBe("0");
  });

  it("neutralizes formula-injection: a name starting with = is prefixed with a quote", async () => {
    // Leading '=' would be executed as a formula by Excel; the handler prefixes
    // a single quote. The leading quote also forces CSV quoting of the cell.
    rowsToReturn = [row({ id: 7, name: "=cmd|'/c calc'!A1", email: "x@example.com" })];
    const { GET } = await import("../route");

    const res = await GET(req());
    const body = await res.text();
    const dataLine = body.split("\n")[1];

    // The name cell is neutralized with a leading single quote. It has no
    // comma/quote/newline so it is NOT additionally double-quote-wrapped.
    expect(dataLine.split(",")[1]).toBe(`'=cmd|'/c calc'!A1`);
    // The raw, unquoted formula must NOT appear at a cell boundary.
    expect(dataLine.includes(",=cmd")).toBe(false);
  });

  it("neutralizes other dangerous leading chars (+, -, @)", async () => {
    rowsToReturn = [
      row({ id: 1, name: "+SUM(1+1)", email: "a@example.com" }),
      row({ id: 2, name: "-2+3", email: "b@example.com" }),
      row({ id: 3, name: "@formula", email: "c@example.com" }),
    ];
    const { GET } = await import("../route");

    const res = await GET(req());
    const lines = (await res.text()).split("\n");

    // Each cell gets a leading single quote. + and @ have no other CSV-special
    // chars so they are bare-quote-prefixed; -2+3 has no comma/quote/newline so
    // it is also just prefixed (no surrounding double-quotes).
    expect(lines[1].split(",")[1]).toBe("'+SUM(1+1)");
    expect(lines[2].split(",")[1]).toBe("'-2+3");
    expect(lines[3].split(",")[1]).toBe("'@formula");
  });

  it("CSV-quotes ordinary cells that contain commas, quotes, or newlines", async () => {
    rowsToReturn = [
      row({ id: 1, name: 'Doe, "Jane"', email: "jane@example.com" }),
    ];
    const { GET } = await import("../route");

    const res = await GET(req());
    const dataLine = (await res.text()).split("\n")[1];

    // Comma forces quoting; inner double-quotes are doubled.
    expect(dataLine).toContain('"Doe, ""Jane"""');
  });

  it("applies q and status filters to the query bind params", async () => {
    rowsToReturn = [row()];
    const { GET } = await import("../route");

    await GET(req("http://localhost/admin/export.csv?q=ALICE&status=sent"));

    expect(capturedSql).toMatch(/FROM waitlist WHERE/);
    expect(capturedSql).toMatch(/LIMIT \?/);
    // q is lowercased and wrapped with % on both sides (used twice: email + name),
    // status appended, then the ROW_LIMIT+1 cap is the final bind.
    expect(capturedBinds).toEqual(["%alice%", "%alice%", "sent", 50001]);
  });

  it("expands the synthetic 'queued' status into pending+failed without a bind", async () => {
    rowsToReturn = [row()];
    const { GET } = await import("../route");

    await GET(req("http://localhost/admin/export.csv?status=queued"));

    expect(capturedSql).toMatch(/email_status IN \('pending', 'failed'\)/);
    // No bind for the IN clause; only the ROW_LIMIT+1 cap.
    expect(capturedBinds).toEqual([50001]);
  });

  it("ignores status=all (no WHERE filter) and unsets q", async () => {
    rowsToReturn = [row()];
    const { GET } = await import("../route");

    await GET(req("http://localhost/admin/export.csv?status=all"));

    expect(capturedSql).not.toMatch(/WHERE/);
    expect(capturedBinds).toEqual([50001]);
  });

  it("marks the export truncated when more than the row cap is returned", async () => {
    // ROW_LIMIT is 50000; the handler over-fetches by 1 to detect truncation.
    rowsToReturn = Array.from({ length: 50001 }, (_, i) =>
      row({ id: i + 1, email: `u${i}@example.com` }),
    );
    const { GET } = await import("../route");

    const res = await GET(req());

    expect(res.headers.get("x-export-truncated")).toBe("true");
    // Body is sliced back to exactly the cap.
    expect(res.headers.get("x-export-row-count")).toBe("50000");
    const lines = (await res.text()).split("\n");
    expect(lines).toHaveLength(50001); // header + 50000 rows
  });
});
