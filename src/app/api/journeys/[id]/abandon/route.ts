import { NextResponse } from "next/server";

import { abandonJourney } from "@/lib/journeys/service";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function POST(_req: Request, { params }: { params: Params }) {
  const { id: journeyId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  // Verify journey belongs to user
  const { data: journeyRow } = await supabase
    .from("case_journeys")
    .select("id, user_id")
    .eq("id", journeyId)
    .maybeSingle();

  if (!journeyRow || journeyRow.user_id !== user.id) {
    return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  }

  try {
    await abandonJourney(supabase, journeyId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to abandon journey";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
