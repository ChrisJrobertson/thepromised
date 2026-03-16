import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { Profile, SupabaseDatabase } from "@/types/database";

type ScopedAccessOptions = {
  profile: Profile;
  caseId: string;
  userId: string;
  supabase: SupabaseClient<SupabaseDatabase>;
};

export async function enforcePackScopedCaseAccess({
  profile,
  caseId,
  userId,
  supabase,
}: ScopedAccessOptions): Promise<NextResponse | null> {
  if (profile.subscription_status !== "pack_temporary") return null;

  if (!profile.pack_pro_expires_at) {
    return NextResponse.json(
      { error: "Pack access has expired. Please purchase a new pack." },
      { status: 403 },
    );
  }

  const expiresAt = new Date(profile.pack_pro_expires_at);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Pack access has expired. Please purchase a new pack." },
      { status: 403 },
    );
  }

  if (profile.pack_access_case_id && profile.pack_access_case_id !== caseId) {
    return NextResponse.json(
      {
        error:
          "This temporary pack access is linked to a different case. Buy another pack to unlock this case.",
      },
      { status: 403 },
    );
  }

  const activeStatuses = ["purchased", "in_progress", "fulfilled"];
  let activePack: { id: string } | null = null;

  if (profile.pack_access_case_id) {
    const { data } = await supabase
      .from("complaint_packs")
      .select("id")
      .eq("user_id", userId)
      .eq("entitlement_case_id", caseId)
      .in("status", activeStatuses)
      .maybeSingle();
    activePack = data as { id: string } | null;
  } else {
    const { data: caseScoped } = await supabase
      .from("complaint_packs")
      .select("id")
      .eq("user_id", userId)
      .eq("entitlement_case_id", caseId)
      .in("status", activeStatuses)
      .maybeSingle();
    if (caseScoped) {
      activePack = caseScoped as { id: string };
    } else {
      const { data: globalPack } = await supabase
        .from("complaint_packs")
        .select("id")
        .eq("user_id", userId)
        .is("entitlement_case_id", null)
        .in("status", activeStatuses)
        .maybeSingle();
      activePack = globalPack as { id: string } | null;
    }
  }

  if (!activePack) {
    return NextResponse.json(
      {
        error:
          "No active complaint pack found for this case. Please purchase a pack to continue.",
      },
      { status: 403 },
    );
  }

  return null;
}
