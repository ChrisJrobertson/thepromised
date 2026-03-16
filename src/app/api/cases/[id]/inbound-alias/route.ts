import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: existing, error: existingError } = await supabase
    .from("cases")
    .select("inbound_email_alias")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existingError || !existing) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  if (existing.inbound_email_alias) {
    return NextResponse.json({ alias: existing.inbound_email_alias });
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const alias = `case-${nanoid(10).toLowerCase()}`;
    const { error } = await supabase
      .from("cases")
      .update({ inbound_email_alias: alias })
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      return NextResponse.json({ alias });
    }
  }

  return NextResponse.json({ error: "Failed to generate alias" }, { status: 500 });
}
