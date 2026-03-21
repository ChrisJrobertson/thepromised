import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { trackServerEvent } from "@/lib/analytics/posthog-server";
import { sanitizeAuthRedirectNext } from "@/lib/navigation/auth-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = sanitizeAuthRedirectNext(url.searchParams.get("next"));

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

  return NextResponse.redirect(new URL(next, request.url));
}
