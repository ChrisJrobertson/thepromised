import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const AUTH_ROUTES = new Set(["/login", "/register"]);
const PROTECTED_PREFIXES = ["/dashboard", "/cases", "/settings", "/reminders", "/letters"];

function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  try {
    const { response, user } = await updateSession(request);
    const pathname = request.nextUrl.pathname;

    if (isProtectedRoute(pathname) && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (AUTH_ROUTES.has(pathname) && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return response;
  } catch {
    // If Supabase is unavailable (e.g. missing env vars), allow the request
    // through so Next.js can still serve the page. Protected route layouts
    // perform their own server-side auth checks independently.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Run middleware only on routes that need authentication checking.
     * Public marketing pages are intentionally excluded so they remain
     * accessible even if the Supabase client cannot be initialised
     * (e.g. missing env vars in production).
     *
     * Excluded from middleware:
     *   - _next/static  (static assets)
     *   - _next/image   (image optimisation)
     *   - favicon.ico, image files
     *   - / (landing page)
     *   - /pricing, /how-it-works, /escalation-guides, /about, /privacy, /terms
     *   - /api routes   (each handler performs its own auth)
     *   - /robots.txt, /sitemap.xml
     */
    "/dashboard/:path*",
    "/cases/:path*",
    "/settings/:path*",
    "/reminders/:path*",
    "/letters/:path*",
    "/login",
    "/register",
  ],
};
