import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/admin-api";
import { getPlatformStats } from "@/lib/analytics/service";

export async function GET() {
  const auth = await requireAdminApi();
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const stats = await getPlatformStats();
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch admin stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
