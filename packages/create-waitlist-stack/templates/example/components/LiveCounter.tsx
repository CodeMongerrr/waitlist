"use client";

import { useEffect, useState } from "react";
import type { Theme } from "@/lib/theme";

type Props = {
  t: Theme;
  value: number;
  label: string;
};

export function LiveCounter({ t, value, label }: Props) {
  const [n, setN] = useState(value);

  useEffect(() => {
    const id = setInterval(() => {
      setN((v) => v + (Math.random() < 0.6 ? 1 : 0));
    }, 1900);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
      <span
        style={{
          fontFamily: t.serifFont,
          fontSize: 56,
          fontWeight: 500,
          letterSpacing: "-0.03em",
          color: t.fg,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {n.toLocaleString()}
      </span>
      <span
        style={{ fontFamily: t.uiFont, fontSize: 12.5, color: t.muted }}
      >
        {label}
      </span>
    </div>
  );
}
