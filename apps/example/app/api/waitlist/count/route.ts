import { NextResponse } from "next/server";
import { WaitlistDb } from "@waitlist-stack/db";
import { env } from "../../../../lib/cf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public read-only endpoint: the total number of waitlist signups. Powers the
// "founders already in line" social-proof line in the hero and CTA. Exposing a
// count reveals nothing about any individual row. Short edge cache so a burst
// of page loads does not turn into a burst of COUNT(*) queries.
export async function GET() {
  try {
    const e = await env();
    const db = new WaitlistDb(e.DB);
    const count = await db.totalSignups();
    return NextResponse.json(
      { count },
      { headers: { "Cache-Control": "public, max-age=10" } },
    );
  } catch {
    // Never surface a broken "0" to the UI; let the client fall back to its
    // qualitative line when the count is unavailable.
    return NextResponse.json({ count: null });
  }
}
