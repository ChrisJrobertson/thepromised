import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";

type Params = Promise<{ id: string }>;

export async function POST(_req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Verify case belongs to user
  const { data: caseData, error: caseError } = await supabase
    .from("cases")
    .select("id, share_token")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (caseError || !caseData) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  // Reuse existing token or generate a new one
  const token = caseData.share_token ?? crypto.randomUUID();

  const { error: updateError } = await supabase
    .from("cases")
    .update({ share_token: token, is_shared: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to generate share link" }, { status: 500 });
  }

  return NextResponse.json({
    shareUrl: `${APP_URL}/shared/${token}`,
    token,
  });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { error } = await supabase
    .from("cases")
    .update({ share_token: null, is_shared: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to disable sharing" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
