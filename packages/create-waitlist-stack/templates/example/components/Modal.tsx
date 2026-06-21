"use client";

import { useEffect } from "react";
import type { Theme } from "@/lib/theme";

type Props = {
  open: boolean;
  onClose: () => void;
  t: Theme;
  children: React.ReactNode;
};

export function Modal({ open, onClose, t, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: t.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 24,
        animation: "wlFadeIn .18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          background: t.bg,
          color: t.fg,
          borderRadius: t.modalRadius,
          border: `1px solid ${t.border}`,
          boxShadow: "0 30px 60px rgba(20,18,15,0.25)",
          width: "100%",
          maxWidth: 440,
          padding: 28,
          animation: "wlPop .22s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
