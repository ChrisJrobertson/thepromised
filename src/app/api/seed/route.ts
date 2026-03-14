import { NextResponse } from "next/server";

import { seedEscalationRules } from "@/lib/seed/escalation-rules";
import { seedOrganisations } from "@/lib/seed/organisations";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Seed organisations
    const orgResult = await seedOrganisations(
      supabase as unknown as Parameters<typeof seedOrganisations>[0]
    );

    // Seed escalation rules
    const rulesResult = await seedEscalationRules(
      supabase as unknown as Parameters<typeof seedEscalationRules>[0]
    );

    return NextResponse.json({
      ok: true,
      organisations_seeded: orgResult.seeded,
      escalation_rules_seeded: rulesResult.seeded,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 }
    );
  }
}
