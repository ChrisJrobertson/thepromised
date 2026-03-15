import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Gather all user data in parallel
    const [
      { data: profile },
      { data: cases },
      { data: interactions },
      { data: evidence },
      { data: letters },
      { data: reminders },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("cases").select("*").eq("user_id", user.id),
      supabase.from("interactions").select("*").eq("user_id", user.id),
      supabase
        .from("evidence")
        .select("id, case_id, file_name, file_type, file_size, description, evidence_type, created_at")
        .eq("user_id", user.id),
      supabase.from("letters").select("*").eq("user_id", user.id),
      supabase.from("reminders").select("*").eq("user_id", user.id),
    ]);

    // Strip sensitive fields from profile before export
    const safeProfile = profile
      ? {
          ...(profile as Record<string, unknown>),
          stripe_customer_id: "[REDACTED]",
          subscription_id: "[REDACTED]",
        }
      : null;

    const exportData = {
      exported_at: new Date().toISOString(),
      exported_by: user.email,
      gdpr_notice:
        "This export contains all personal data held by TheyPromised about your account. Exported under UK GDPR Article 20 (right to data portability).",
      profile: safeProfile,
      cases: cases ?? [],
      interactions: interactions ?? [],
      evidence: evidence ?? [],
      letters: letters ?? [],
      reminders: reminders ?? [],
    };

    const json = JSON.stringify(exportData, null, 2);

    return new Response(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="theypromised-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error("[Data export error]", error);
    return NextResponse.json(
      { error: "Export failed. Please try again." },
      { status: 500 }
    );
  }
}
