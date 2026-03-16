import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function requireAdminApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { errorResponse: NextResponse.json({ error: "Unauthorised" }, { status: 401 }) };
  }

  const adminSupabase = createServiceRoleClient();
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return { errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}
