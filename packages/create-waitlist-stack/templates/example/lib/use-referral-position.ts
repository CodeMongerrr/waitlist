"use client";

import { useEffect, useRef } from "react";

interface PositionPayload {
  position: number;
  baseRank: number;
  referralCount: number;
  jumpsPerReferral: number;
}

// Polls GET /api/waitlist/me/{code} on a steady cadence and reports any
// change via onUpdate. Cleans up its interval on unmount or code change.
//
// Why poll instead of SSE / WebSocket: a referral bump only happens when
// someone else signs up, which on a fresh waitlist is human-timescale
// (minutes, not ms). Polling at 8s is plenty fresh, has zero infra cost,
// and works through every CDN / edge config without negotiation. Swap to
// SSE if you ever need sub-second updates at scale.

export function useReferralPosition(
  code: string | null | undefined,
  onUpdate: (next: PositionPayload) => void,
  intervalMs = 8000,
) {
  // Pin onUpdate so the effect doesn't re-tick on every parent re-render.
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!code) return;
    let alive = true;

    const tick = async () => {
      try {
        const res = await fetch(`/api/waitlist/me/${encodeURIComponent(code)}`);
        if (!res.ok || !alive) return;
        const body = (await res.json()) as PositionPayload;
        if (alive && typeof body.position === "number") {
          onUpdateRef.current(body);
        }
      } catch {
        // Network blip; next tick will retry.
      }
    };

    // Don't fire immediately — the signup response already gave us a
    // position. First poll happens after `intervalMs` so the user sees a
    // fresh number when activity actually happens.
    const id = setInterval(tick, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [code, intervalMs]);
}
