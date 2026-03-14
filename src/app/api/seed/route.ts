import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { seedEscalationRules } from "@/lib/seed/escalation-rules";
import { seedOrganisations } from "@/lib/seed/organisations";
import { seedTestData } from "@/lib/seed/test-data";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseDatabase } from "@/types/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const seedType = url.searchParams.get("type") === "test" ? "test" : "production";

    const supabase =
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL
        ? createSupabaseClient<SupabaseDatabase>(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
              },
            }
          )
        : await createClient();

    // Seed organisations
    const orgResult = await seedOrganisations(
      supabase as unknown as Parameters<typeof seedOrganisations>[0]
    );

    // Seed escalation rules
    const rulesResult = await seedEscalationRules(
      supabase as unknown as Parameters<typeof seedEscalationRules>[0]
    );

    let testDataResult: Awaited<ReturnType<typeof seedTestData>> | null = null;
    if (seedType === "test") {
      testDataResult = await seedTestData(
        supabase as unknown as Parameters<typeof seedTestData>[0]
      );
    }

    return NextResponse.json({
      ok: true,
      seed_type: seedType,
      organisations_seeded: orgResult.seeded,
      escalation_rules_seeded: rulesResult.seeded,
      test_data: testDataResult,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 }
    );
  }
}
