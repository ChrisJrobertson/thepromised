import { NextResponse } from "next/server";
import { z } from "zod";

import { checkRateLimit } from "@/lib/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const enquirySchema = z.object({
  company_name: z.string().min(2).max(200),
  contact_name: z.string().min(2).max(200),
  email: z.string().email(),
  role: z.string().max(200).optional(),
  website: z.string().url().max(300).optional().or(z.literal("")),
  sector: z.string().max(200).optional(),
  complaint_volume_estimate: z.string().max(200).optional(),
  message: z.string().max(4000).optional(),
  consent_to_contact: z.boolean(),
  hp_website: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const payload = enquirySchema.parse(await request.json());
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    if (payload.hp_website) {
      return NextResponse.json({ ok: true });
    }
    if (!payload.consent_to_contact) {
      return NextResponse.json(
        { error: "Consent is required to submit this form." },
        { status: 400 },
      );
    }

    const rate = await checkRateLimit(`b2b-enquiry:${ip}`, "enquiry");
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many enquiries from this IP. Please try again later." },
        { status: 429, headers: rate.headers },
      );
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("business_enquiries").insert({
      company_name: payload.company_name,
      contact_name: payload.contact_name,
      email: payload.email,
      role: payload.role ?? null,
      website: payload.website || null,
      sector: payload.sector ?? null,
      complaint_volume_estimate: payload.complaint_volume_estimate ?? null,
      message: payload.message ?? null,
      consent_to_contact: payload.consent_to_contact,
      source_ip: ip,
      user_agent: userAgent,
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
