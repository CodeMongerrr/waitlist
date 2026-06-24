import { type NextRequest } from "next/server";
import { WaitlistDb } from "@waitlist-stack/db";
import { env } from "../../../lib/cf";
import { verifyAdmin } from "../../../lib/admin-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = {
  id: number;
  name: string;
  email: string;
  source: string | null;
  created_at: string;
  email_status: string;
  email_attempts: number;
  email_sent_at: string | null;
  email_delivered_at: string | null;
  email_last_error: string | null;
  referral_code: string | null;
  referred_by: string | null;
  referral_count: number;
};

const COLUMNS: (keyof Row)[] = [
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

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s = String(v);
  // CSV / formula injection guard. If a cell opens with =, +, -, @, tab, CR, or
  // LF, Excel and most spreadsheet apps will execute it as a formula on open
  // (e.g. =cmd|'/c calc'!A1). Prefix with a single quote to neutralize. The
  // quote is hidden in Excel's display and visible in plain-text readers,
  // which is the right tradeoff for an export of arbitrary user input.
  if (s.length > 0 && /^[=+\-@\t\r\n]/.test(s)) {
    s = `'${s}`;
  }
  // RFC 4180: a field containing a quote, comma, CR, or LF must be wrapped in
  // double quotes (inner quotes doubled). CR matters as much as LF: a bare CR
  // is a record break to spreadsheet importers, so an unquoted cell splits on
  // it and the text after the break becomes a new, unguarded cell that can
  // re-open the formula hole above.
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  // 401 instead of redirect: this is a download endpoint, not a page; clients
  // should treat unauth as a hard error rather than follow a 302 to login.
  if (!(await verifyAdmin())) {
    return new Response("unauthorized", { status: 401 });
  }

  const e = await env();
  const db = new WaitlistDb(e.DB);
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = req.nextUrl.searchParams.get("status")?.trim() ?? "";

  const where: string[] = [];
  const binds: string[] = [];
  if (q) {
    where.push("(LOWER(email) LIKE ? OR LOWER(name) LIKE ?)");
    binds.push(`%${q}%`, `%${q}%`);
  }
  if (status && status !== "all") {
    // "queued" is a synthetic filter (pending + failed combo) shared with the
    // admin page; handled here so an export from the queued tab matches what
    // the user is looking at.
    if (status === "queued") {
      where.push("email_status IN ('pending', 'failed')");
    } else {
      where.push("email_status = ?");
      binds.push(status);
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Hard cap so a viral list can't OOM the worker (Cloudflare cap is 128 MB
  // per request and we materialize the whole CSV in memory). Bumping +1 lets
  // us detect "list was actually larger than the cap" and surface that to the
  // client as a header so the admin UI can warn instead of failing silently.
  const ROW_LIMIT = 50000;
  const result = await db
    .raw()
    .prepare(
      `SELECT ${COLUMNS.join(", ")} FROM waitlist ${whereSql}
         ORDER BY created_at DESC
         LIMIT ?`,
    )
    .bind(...binds, ROW_LIMIT + 1)
    .all<Row>();

  const allRows = result.results ?? [];
  const truncated = allRows.length > ROW_LIMIT;
  const rows = truncated ? allRows.slice(0, ROW_LIMIT) : allRows;

  const lines = [COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(COLUMNS.map((c) => csvEscape(r[c])).join(","));
  }
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="waitlist-${
        new Date().toISOString().split("T")[0]
      }.csv"`,
      "x-export-row-count": String(rows.length),
      "x-export-truncated": truncated ? "true" : "false",
    },
  });
}
