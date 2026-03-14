import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { NextResponse } from "next/server";
import { z } from "zod";

import { LetterPdfDocument } from "@/lib/pdf/LetterPdfDocument";
import { createClient } from "@/lib/supabase/server";
import type { Letter } from "@/types/database";

export const runtime = "nodejs";

const inputSchema = z.object({
  letterId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const json = await request.json();
    const { letterId } = inputSchema.parse(json);

    // Fetch letter (RLS enforces ownership)
    const { data: letter, error: letterError } = await supabase
      .from("letters")
      .select("*")
      .eq("id", letterId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (letterError || !letter) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }

    const typedLetter = letter as Letter;

    const generatedAt = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const pdfBuffer = await renderToBuffer(
      createElement(LetterPdfDocument, {
        data: {
          subject: typedLetter.subject,
          body: typedLetter.body,
          caseTitle: typedLetter.subject,
          generatedAt,
        },
      }) as ReactElement<DocumentProps>
    );

    const safeFilename = typedLetter.subject
      .replace(/[^a-zA-Z0-9\s\-]/g, "")
      .slice(0, 60)
      .trim();

    const uint8Array = new Uint8Array(pdfBuffer);
    return new Response(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}.pdf"`,
        "Content-Length": uint8Array.length.toString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[Letter PDF error]", error);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
