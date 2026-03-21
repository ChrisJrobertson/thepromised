import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const AUTH_ROUTES = new Set(["/login", "/register"]);
const PROTECTED_PREFIXES = [
  "/admin",
  "/dashboard",
  "/cases",
  "/settings",
  "/reminders",
  "/letters",
  "/packs/success",
  "/journeys",
];

function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (isProtectedRoute(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve query string (e.g. /cases/new?template=energy-wrong-tariff)
    const nextPath = pathname + request.nextUrl.search;
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url);
  }

  if (AUTH_ROUTES.has(pathname) && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
