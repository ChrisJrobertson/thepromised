import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { trackServerEvent } from "@/lib/analytics/posthog-server";
import { createClient } from "@/lib/supabase/server";

/** Return a safe relative path, rejecting any attempt to redirect externally. */
function getSafeRedirectPath(next: string | null): string {
  if (!next) return "/dashboard";
  // Must be a relative path starting with /
  if (!next.startsWith("/")) return "/dashboard";
  // Protocol-relative URLs (//evil.com) must be rejected
  if (next.startsWith("//")) return "/dashboard";
  // Backslash can be used to bypass checks in some environments
  if (next.includes("\\")) return "/dashboard";
  return next;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectPath = getSafeRedirectPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    Sentry.setUser({ id: user.id });
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    const isNewUser = !existing;

    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    });

    // Track new sign-ups
    if (isNewUser) {
      trackServerEvent(user.id, "user_signed_up", { method: "email" });
    }

    // Send welcome email to new users (non-blocking)
    if (isNewUser && user.email) {
      const name =
        (user.user_metadata?.full_name as string | undefined) ?? "there";
      import("@/lib/email/send")
        .then(({ sendWelcomeEmail }) => {
          sendWelcomeEmail(user.email!, name).catch(() => {});
        })
        .catch(() => {});
    }
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
