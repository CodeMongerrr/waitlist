import { type NextRequest, NextResponse } from "next/server";
import { checkAdminMiddleware } from "@waitlist-stack/admin";
import config from "./waitlist.config";

export const config_ = {
  matcher: ["/admin/:path*"],
};
export { config_ as config };

// Edge auth gate. Cheap HMAC + expiry check; the full version check happens
// inside every admin handler (page, server action, route) so a cookie that
// slipped past middleware is still rejected at the handler.

export async function middleware(req: NextRequest) {
  const decision = await checkAdminMiddleware({
    pathname: req.nextUrl.pathname,
    cookieHeader: req.headers.get("cookie"),
    cookieSecret: process.env.ADMIN_COOKIE_SECRET,
    config,
  });

  if (decision.allow) return NextResponse.next();

  if (decision.reason === "not_configured") {
    return NextResponse.json(
      { error: "admin auth not configured" },
      { status: 503 },
    );
  }
  if (decision.reason === "redirect" && decision.redirectTo) {
    const url = req.nextUrl.clone();
    const [path, query] = decision.redirectTo.split("?");
    url.pathname = path;
    url.search = query ? `?${query}` : "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
