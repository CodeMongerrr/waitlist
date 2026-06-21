import { type NextRequest, NextResponse } from "next/server";
import { WaitlistDb } from "@waitlist-stack/db";
import { isValidReferralCode } from "@waitlist-stack/core";
import config from "../../../../../waitlist.config";
import { env } from "../../../../../lib/cf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public read-only endpoint: given a referral code, return the holder's
// current effective queue position + referral_count. The success modal calls
// this on a poll so "you're #N" updates as the user's referrals come in.
//
// Knowing a code only reveals its position, not the holder's email or name.
// Codes are random base32 (default 6 chars, ~10^9 keyspace) so brute
// enumeration is not economic against a small list.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  if (!isValidReferralCode(code, config.referral.codeLength)) {
    return NextResponse.json({ error: "bad code" }, { status: 400 });
  }
  const e = await env();
  const db = new WaitlistDb(e.DB);
  const pos = await db.positionFor(code, config.referral.jumpsPerReferral);
  if (!pos) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    position: pos.position,
    baseRank: pos.baseRank,
    referralCount: pos.referralCount,
    jumpsPerReferral: config.referral.jumpsPerReferral,
  });
}
