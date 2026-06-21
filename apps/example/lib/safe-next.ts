// Open-redirect guard for the post-login redirect target. Accept only
// strictly-relative paths.
//
//   /admin             ok
//   /admin/users?x=1   ok
//   //evil.com         BLOCKED — protocol-relative URL, browsers treat as offsite
//   https://evil.com   BLOCKED — absolute URL
//   /\evil.com         BLOCKED — Edge/IE quirk; backslash treated as path separator
//
// Anything that doesn't pass falls back to the default admin path so a
// crafted ?next= can't redirect a logged-in user offsite.

export function isSafePath(p: unknown): p is string {
  if (typeof p !== "string" || p.length === 0) return false;
  if (p[0] !== "/") return false;
  if (p[1] === "/" || p[1] === "\\") return false;
  return true;
}

export function safeNextOr(p: unknown, fallback: string): string {
  return isSafePath(p) ? p : fallback;
}
