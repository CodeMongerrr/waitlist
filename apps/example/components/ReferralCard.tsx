"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import type { Signup } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Props = {
  signup: Signup;
  onDone?: () => void;
  compact?: boolean;
};

// First referral milestone. The reward is purely queue movement (no pricing,
// no fabricated perks), so the "goal" just frames the next honest win and
// drives the "one more invite" loop the research calls out.
const MILESTONE = 3;

export function ReferralCard({ signup, onDone, compact = false }: Props) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://catalyst.app";
  const url = `${origin}/?ref=${signup.code}`;
  const display = url.replace(/^https?:\/\//, "");

  const jumps = signup.jumpsPerReferral ?? 5;
  const referrals = signup.referralCount ?? 0;
  const reached = referrals >= MILESTONE;
  const pct = Math.min(100, Math.round((referrals / MILESTONE) * 100));
  const remaining = Math.max(0, MILESTONE - referrals);

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied");
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  };

  const shareX = () => {
    const text =
      "Joined the Catalyst waitlist. Autonomous X drafting in my voice, nothing posts without my approval. Skip the line:";
    // Use intent/tweet, not intent/post: the latter has a known bug that opens
    // the X-app login instead of the composer on mobile. And open it with a real
    // anchor click rather than window.open(u, "_blank", "noopener"). The
    // "noopener" feature string makes window.open return null and mobile Safari
    // dismisses it as a popup, so the composer flashes open and closes.
    const intent = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    const a = document.createElement("a");
    a.href = intent;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="animate-[wlPop_0.35s_ease_both]">
      <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.08em] text-foreground">
        You&apos;re on the list
      </div>

      <div
        className={`mb-2 font-extrabold leading-none tracking-[-0.03em] text-foreground tabular-nums ${
          compact ? "text-[44px]" : "text-[56px]"
        }`}
      >
        #{signup.position.toLocaleString()}
        <span className="text-muted-foreground">.</span>
      </div>

      <p className="mb-5 max-w-[420px] text-sm leading-relaxed text-muted-foreground">
        Confirmation sent to{" "}
        <span className="text-foreground">{signup.email}</span>. Your position
        updates live as friends join.
      </p>

      {/* Referral progress: the "one more invite" hook. */}
      <div className="mb-5 rounded-lg border border-border bg-black/20 p-3.5">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-foreground">
            {reached ? "Climbing fast" : `${referrals} of ${MILESTONE} invited`}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            +{referrals * jumps} spots
          </span>
        </div>
        <Progress value={pct} aria-label="Referral progress" className="h-1.5" />
        <p className="mt-2.5 text-[12.5px] leading-snug text-muted-foreground">
          {reached ? (
            <>
              {referrals} friends joined. Keep sharing, every join still moves you
              up {jumps} spots.
            </>
          ) : (
            <>
              Invite <span className="text-foreground">{remaining} more</span> to
              jump {remaining * jumps} spots.
            </>
          )}
        </p>
      </div>

      {/* Invite link + copy */}
      <div className="mb-2.5 flex items-center gap-2 rounded-lg border border-border bg-popover p-1 pl-3">
        <span className="flex-1 truncate font-mono text-[12.5px] text-foreground">
          {display}
        </span>
        <Button
          type="button"
          size="sm"
          variant={copied ? "default" : "outline"}
          onClick={copy}
          aria-label="Copy invite link"
          className="h-11 shrink-0 sm:h-8"
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <Button type="button" onClick={shareX} size="lg" className="h-12 w-full font-semibold">
        Share on X → skip the line
      </Button>

      {onDone && (
        <Button
          type="button"
          variant="ghost"
          onClick={onDone}
          className="mt-1.5 h-auto w-full py-2.5 text-[12.5px] text-muted-foreground"
        >
          ← back
        </Button>
      )}
    </div>
  );
}
