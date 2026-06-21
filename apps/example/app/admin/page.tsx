import { WaitlistDb } from "@waitlist-stack/db";
import config from "../../waitlist.config";
import { env } from "../../lib/cf";
import { requireAdminOrRedirect } from "../../lib/admin-guard";
import { logoutAction } from "./actions";
import { BatchRetryButton, RowRetryButton } from "./retry-controls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending: "#A88A2C",
  sent: "#4F7A3F",
  delivered: "#2F6E55",
  bounced: "#A4513A",
  failed: "#A4513A",
};

const FILTER_OPTIONS = [
  "all",
  "queued",
  "pending",
  "sent",
  "delivered",
  "bounced",
  "failed",
] as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminOrRedirect();

  const e = await env();
  const db = new WaitlistDb(e.DB);

  const params = await searchParams;
  const filter = typeof params.filter === "string" ? params.filter : "all";
  const q = typeof params.q === "string" ? params.q.trim() : "";

  // Build the WHERE dynamically. "queued" is a synthetic combo of pending +
  // failed (the two states the retry batch picks up).
  const where: string[] = [];
  const binds: (string | string[])[] = [];
  if (filter === "queued") {
    where.push("email_status IN ('pending', 'failed')");
  } else if (filter !== "all") {
    where.push("email_status = ?");
    binds.push(filter);
  }
  if (q) {
    where.push("(LOWER(email) LIKE ? OR LOWER(name) LIKE ?)");
    const needle = `%${q.toLowerCase()}%`;
    binds.push(needle, needle);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = await db.totalSignups();
  const rows = await db
    .raw()
    .prepare(
      `SELECT id, name, email, email_status, email_attempts, email_last_error,
              referral_count, created_at
         FROM waitlist
         ${whereSql}
         ORDER BY created_at DESC
         LIMIT 200`,
    )
    .bind(...binds.flat())
    .all<{
      id: number;
      name: string;
      email: string;
      email_status: string;
      email_attempts: number;
      email_last_error: string | null;
      referral_count: number;
      created_at: string;
    }>();

  const csvHref = (() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    // "queued" is a synthetic combo of pending + failed — the CSV route
    // recognizes the same name and expands it to IN ('pending','failed').
    if (filter !== "all") sp.set("status", filter);
    const qs = sp.toString();
    return `${config.admin.path}/export.csv${qs ? `?${qs}` : ""}`;
  })();

  // CSV export hard-caps at 50k rows (worker memory). Surface this to the
  // admin only when the current view actually exceeds the cap.
  const CSV_ROW_CAP = 50000;
  const csvWillTruncate = total > CSV_ROW_CAP;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F4EFE3",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        color: "#171614",
        padding: "32px 48px",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, margin: 0 }}>
          {config.brand.name} admin
        </h1>
        <form action={logoutAction}>
          <button
            type="submit"
            style={{
              background: "transparent",
              border: "1px solid #D9D2C0",
              color: "#6B6357",
              padding: "6px 10px",
              fontFamily: "inherit",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            log out
          </button>
        </form>
      </header>

      <section
        style={{
          display: "flex",
          gap: 24,
          marginBottom: 16,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <Stat label="total signups" value={total.toLocaleString()} />
        <Stat
          label="filter"
          value={
            <FilterTabs
              current={filter}
              q={q}
              path={config.admin.path}
              options={[...FILTER_OPTIONS]}
            />
          }
        />
        <form
          method="get"
          action={config.admin.path}
          style={{ display: "flex", gap: 6, alignItems: "center" }}
        >
          {filter !== "all" ? (
            <input type="hidden" name="filter" value={filter} />
          ) : null}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="search name or email"
            style={{
              border: "1px solid #D9D2C0",
              background: "#fffdf5",
              color: "#171614",
              padding: "6px 10px",
              fontFamily: "inherit",
              fontSize: 12,
              minWidth: 220,
            }}
          />
          <button
            type="submit"
            style={{
              background: "transparent",
              border: "1px solid #D9D2C0",
              color: "#6B6357",
              padding: "6px 10px",
              fontFamily: "inherit",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            search
          </button>
        </form>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <a
            href={csvHref}
            title={
              csvWillTruncate
                ? `List exceeds ${CSV_ROW_CAP.toLocaleString()} rows; export will be truncated to the most recent ${CSV_ROW_CAP.toLocaleString()}.`
                : undefined
            }
            style={{
              border: "1px solid #D9D2C0",
              color: "#6B6357",
              padding: "10px 14px",
              fontFamily: "inherit",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            export csv{csvWillTruncate ? ` (first ${(CSV_ROW_CAP / 1000).toFixed(0)}k)` : ""}
          </a>
          <BatchRetryButton />
        </div>
      </section>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #D9D2C0", color: "#6B6357" }}>
            <Th>id</Th>
            <Th>name</Th>
            <Th>email</Th>
            <Th>status</Th>
            <Th align="right">refs</Th>
            <Th>created</Th>
            <Th>action</Th>
          </tr>
        </thead>
        <tbody>
          {(rows.results ?? []).map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #ECE6D5", verticalAlign: "top" }}>
              <Td>{r.id}</Td>
              <Td>{r.name}</Td>
              <Td>{r.email}</Td>
              <Td>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ color: STATUS_COLORS[r.email_status] ?? "#6B6357" }}>
                    {r.email_status}
                    {r.email_attempts > 0 ? (
                      <span style={{ color: "#6B6357", marginLeft: 6 }}>
                        ×{r.email_attempts}
                      </span>
                    ) : null}
                  </span>
                  {r.email_last_error ? (
                    <span
                      style={{
                        fontSize: 10,
                        color: "#A4513A",
                        maxWidth: 280,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={r.email_last_error}
                    >
                      {r.email_last_error}
                    </span>
                  ) : null}
                </div>
              </Td>
              <Td align="right">{r.referral_count}</Td>
              <Td>{r.created_at}</Td>
              <Td>
                {r.email_status === "failed" || r.email_status === "pending" ? (
                  <RowRetryButton id={r.id} />
                ) : null}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
      {(rows.results?.length ?? 0) === 0 ? (
        <p style={{ color: "#6B6357", marginTop: 24 }}>no signups match this filter.</p>
      ) : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#6B6357",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 18 }}>{value}</span>
    </div>
  );
}

function FilterTabs({
  current,
  options,
  path,
  q,
}: {
  current: string;
  options: string[];
  path: string;
  q: string;
}) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 13, flexWrap: "wrap" }}>
      {options.map((o) => {
        const sp = new URLSearchParams();
        if (o !== "all") sp.set("filter", o);
        if (q) sp.set("q", q);
        const qs = sp.toString();
        return (
          <a
            key={o}
            href={`${path}${qs ? `?${qs}` : ""}`}
            style={{
              padding: "4px 10px",
              border: "1px solid",
              borderColor: current === o ? "#171614" : "#D9D2C0",
              color: current === o ? "#171614" : "#6B6357",
              background: current === o ? "#fffdf5" : "transparent",
              textDecoration: "none",
            }}
          >
            {o}
          </a>
        );
      })}
    </div>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "right";
}) {
  return (
    <th
      style={{
        padding: "10px 6px",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        textAlign: align ?? "left",
        fontWeight: 400,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "right";
}) {
  return (
    <td
      style={{
        padding: "10px 6px",
        textAlign: align ?? "left",
      }}
    >
      {children}
    </td>
  );
}
