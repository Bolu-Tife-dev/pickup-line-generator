import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "./lib/supabase/middleware";

// Cap how long the session refresh may block navigation. If Supabase is
// slow or unreachable (DNS blip, paused project), the request must still
// proceed — page-level auth checks re-validate and redirect if needed.
// Without this cap, supabase-js retries can run past Vercel's 25s
// middleware limit and surface as a 504 MIDDLEWARE_INVOCATION_TIMEOUT.
const SESSION_REFRESH_TIMEOUT_MS = 5000;

export async function middleware(request: NextRequest) {
  const isGenerate = request.nextUrl.pathname.startsWith("/generate");
  const hasSessionCookie = request
    .cookies.getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  // No Supabase session cookie → nothing to refresh, and /generate is
  // known-unauthenticated. Skip the network call entirely (instant, and
  // immune to Supabase outages for anonymous visitors).
  if (!hasSessionCookie) {
    if (isGenerate) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next({ request });
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const refresh = updateSession(request).then(
      (response) => response,
      (error) => {
        console.error("Session refresh failed:", error);
        return null;
      },
    );
    const timeout = new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), SESSION_REFRESH_TIMEOUT_MS);
    });
    const response = await Promise.race([refresh, timeout]);
    if (response) return response;
    console.error(
      `Session refresh timed out after ${SESSION_REFRESH_TIMEOUT_MS}ms — failing open`,
    );
  } finally {
    if (timer) clearTimeout(timer);
  }

  // Fail open: continue without refreshed cookies. The page's own auth
  // check will redirect to /login if the session is truly invalid.
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
