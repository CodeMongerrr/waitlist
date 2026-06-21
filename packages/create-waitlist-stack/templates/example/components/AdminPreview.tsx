"use client";

import { useState } from "react";
import type { Theme } from "@/lib/theme";
import type { SeedSignup } from "@/lib/helpers";

type Props = {
  t: Theme;
  signups: SeedSignup[];
};

const FILTERS = ["all", "pending", "sent", "delivered", "bounced", "failed"] as const;
type Filter = (typeof FILTERS)[number];

export function AdminPreview({ t, signups }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const counts = signups.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  const visible = signups.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (
      query &&
      !s.name.toLowerCase().includes(query.toLowerCase()) &&
      !s.email.toLowerCase().includes(query.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const statusColor = (st: SeedSignup["status"]): string =>
    ({
      delivered: t.success,
      sent: t.muted,
      pending: t.muted,
      bounced: t.warning,
      failed: t.danger,
    }[st] || t.muted);

  const toggle = (id: number) => {
    const n = new Set(selected);
    if (n.has(id)) {
      n.delete(id);
    } else {
      n.add(id);
    }
    setSelected(n);
  };

  return (
    <div style={{ fontFamily: t.uiFont, fontSize: 12.5, color: t.fg }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: t.codeBg,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <input
          placeholder="Search name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "6px 10px",
            fontSize: 12,
            background: t.bg,
            color: t.fg,
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            outline: "none",
            fontFamily: t.uiFont,
          }}
        />
        <button
          style={{
            padding: "6px 10px",
            fontSize: 11.5,
            fontWeight: 500,
            background: selected.size ? t.btnBg : "transparent",
            color: selected.size ? t.btnFg : t.muted,
            border: `1px solid ${selected.size ? t.btnBg : t.border}`,
            borderRadius: 6,
            cursor: selected.size ? "pointer" : "not-allowed",
            fontFamily: t.uiFont,
          }}
        >
          Retry {selected.size || ""}
        </button>
        <button
          style={{
            padding: "6px 10px",
            fontSize: 11.5,
            background: "transparent",
            color: t.fg,
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: t.uiFont,
          }}
        >
          ↓ csv
        </button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 14px",
          borderBottom: `1px solid ${t.border}`,
          flexWrap: "wrap",
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          const n = f === "all" ? signups.length : counts[f] || 0;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 10px",
                fontSize: 11.5,
                fontFamily: t.uiFont,
                background: active ? t.fg : "transparent",
                color: active ? t.bg : t.muted,
                border: `1px solid ${active ? t.fg : t.border}`,
                borderRadius: 999,
                cursor: "pointer",
                textTransform: "lowercase",
              }}
            >
              {f}{" "}
              <span style={{ opacity: 0.6, marginLeft: 3 }}>{n}</span>
            </button>
          );
        })}
      </div>
      <div style={{ maxHeight: 220, overflowY: "auto" }}>
        {visible.slice(0, 12).map((s) => (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr 1.4fr 70px 60px 50px",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              borderBottom: `1px solid ${t.border}`,
              background: selected.has(s.id) ? t.highlight : "transparent",
              cursor: "pointer",
              fontSize: 12,
            }}
            onClick={() => toggle(s.id)}
          >
            <input
              type="checkbox"
              checked={selected.has(s.id)}
              readOnly
              style={{ accentColor: t.accent }}
            />
            <span
              style={{
                color: t.fg,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.name}
            </span>
            <span
              style={{
                color: t.muted,
                fontFamily: t.monoFont,
                fontSize: 11.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.email}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: statusColor(s.status),
                fontSize: 11.5,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: statusColor(s.status),
                }}
              />
              {s.status}
            </span>
            <span
              style={{
                color: t.muted,
                fontFamily: t.monoFont,
                fontSize: 11,
              }}
            >
              {s.joined}
            </span>
            <span
              style={{
                textAlign: "right",
                color: t.muted,
                fontFamily: t.monoFont,
                fontSize: 11.5,
              }}
            >
              {s.refs > 0 ? `+${s.refs}` : "—"}
            </span>
          </div>
        ))}
        {visible.length === 0 && (
          <div
            style={{ padding: 24, textAlign: "center", color: t.muted }}
          >
            No matches.
          </div>
        )}
      </div>
    </div>
  );
}
