"use client";

import { useState, useTransition } from "react";
import {
  resendOneEmailAction,
  retryFailedEmailsAction,
  type RetryBatchResult,
} from "./actions";

const PILL_BTN: React.CSSProperties = {
  background: "#171614",
  color: "#F4EFE3",
  border: 0,
  padding: "10px 14px",
  fontFamily: "inherit",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const ROW_BTN: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #D9D2C0",
  color: "#6B6357",
  padding: "4px 8px",
  fontFamily: "inherit",
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  cursor: "pointer",
};

export function BatchRetryButton() {
  const [pending, start] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button
        type="button"
        disabled={pending}
        style={{ ...PILL_BTN, opacity: pending ? 0.5 : 1 }}
        onClick={() =>
          start(async () => {
            const r: RetryBatchResult = await retryFailedEmailsAction();
            setNotice(formatBatch(r));
          })
        }
      >
        {pending ? "retrying..." : "retry failed/pending"}
      </button>
      {notice ? (
        <span style={{ fontSize: 11, color: "#6B6357" }}>{notice}</span>
      ) : null}
    </div>
  );
}

export function RowRetryButton({ id }: { id: number }) {
  const [pending, start] = useTransition();
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <button
        type="button"
        disabled={pending}
        style={{ ...ROW_BTN, opacity: pending ? 0.5 : 1 }}
        onClick={() =>
          start(async () => {
            const fd = new FormData();
            fd.set("id", String(id));
            const r = await resendOneEmailAction(fd);
            if (r.ok) setNotice({ ok: true, msg: "sent" });
            else if (r.rateLimited) setNotice({ ok: false, msg: "rate-limited" });
            else setNotice({ ok: false, msg: r.error ?? "failed" });
          })
        }
      >
        {pending ? "..." : "retry"}
      </button>
      {notice ? (
        <span style={{ fontSize: 10, color: notice.ok ? "#4F7A3F" : "#A4513A" }}>
          {notice.msg}
        </span>
      ) : null}
    </div>
  );
}

function formatBatch(r: RetryBatchResult): string {
  if (r.attempted === 0) return "nothing to retry.";
  const parts = [`${r.sent}/${r.attempted} sent`];
  if (r.errors > 0) parts.push(`${r.errors} errors`);
  if (r.hitProviderRateLimit) parts.push("hit provider rate limit");
  return parts.join(" · ");
}
