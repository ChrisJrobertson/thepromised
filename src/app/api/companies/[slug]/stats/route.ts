import { NextResponse } from "next/server";

import { getPublicScorecardForSlug } from "@/lib/analytics/scorecards";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const scorecard = await getPublicScorecardForSlug(slug);
  if (!scorecard) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const totalCases = scorecard.total_cases;
  if (totalCases < 5) {
    return NextResponse.json(
      { not_enough_data: true, message: "Not enough data yet", minimum_cases: 5, total_cases: totalCases },
      { status: 200 }
    );
  }

  return NextResponse.json(scorecard);
}
