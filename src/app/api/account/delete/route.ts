import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { confirmation?: string };
  if (body.confirmation !== "DELETE") {
    return NextResponse.json({ error: "Confirmation must be DELETE" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.stripe_customer_id) {
    try {
      const stripe = getStripeClient();
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "all",
        limit: 100,
      });
      for (const sub of subscriptions.data) {
        if (["active", "trialing", "past_due", "incomplete"].includes(sub.status)) {
          await stripe.subscriptions.cancel(sub.id);
        }
      }
    } catch {
      // Continue deletion even if subscription cancellation fails.
    }
  }

  const { data: evidenceFiles } = await admin
    .from("evidence")
    .select("storage_path")
    .eq("user_id", user.id);
  const paths = (evidenceFiles ?? []).map((e) => e.storage_path);
  if (paths.length) {
    await admin.storage.from("evidence").remove(paths);
  }

  const { data: cases } = await admin.from("cases").select("id").eq("user_id", user.id);
  const caseIds = (cases ?? []).map((c) => c.id);

  if (caseIds.length) {
    await admin.from("reminders").delete().eq("user_id", user.id).in("case_id", caseIds);
    await admin.from("letters").delete().eq("user_id", user.id).in("case_id", caseIds);
    await admin.from("interactions").delete().eq("user_id", user.id).in("case_id", caseIds);
    await admin.from("evidence").delete().eq("user_id", user.id).in("case_id", caseIds);
    await admin.from("cases").delete().eq("user_id", user.id).in("id", caseIds);
  }

  await admin.from("profiles").delete().eq("id", user.id);
  await admin.auth.admin.deleteUser(user.id);

  return NextResponse.json({ ok: true, redirectUrl: "/" });
}
