import { NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z.object({
  caseId: z.uuid(),
  exportType: z.enum(["full_case", "timeline_only", "letters_only"]).default("full_case"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = inputSchema.parse(json);

    return NextResponse.json({
      status: "queued",
      message: "PDF export route scaffolded. React PDF generation is in the next phase.",
      request: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }
}
