import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceRoleClient } from "@/lib/supabase/admin";

const enquirySchema = z.object({
  company_name: z.string().min(2).max(200),
  contact_name: z.string().min(2).max(200),
  email: z.string().email(),
  role: z.string().max(200).optional(),
  message: z.string().max(4000).optional(),
});

export async function POST(request: Request) {
  try {
    const payload = enquirySchema.parse(await request.json());
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("business_enquiries").insert({
      company_name: payload.company_name,
      contact_name: payload.contact_name,
      email: payload.email,
      role: payload.role ?? null,
      message: payload.message ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}
