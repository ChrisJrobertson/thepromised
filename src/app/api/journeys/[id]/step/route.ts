import { NextResponse } from "next/server";
import { z } from "zod";

import { completeStep } from "@/lib/journeys/service";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const stepSchema = z.object({
  stepId: z.string().min(1),
  choice: z.string().optional(),
});

type Params = Promise<{ id: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = stepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
  }

  const { stepId, choice } = parsed.data;

  try {
    const updated = await completeStep(supabase, journeyId, stepId, choice);
    return NextResponse.json({ journey: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to complete step";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
