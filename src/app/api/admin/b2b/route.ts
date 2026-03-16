import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const B2B_STATUSES = [
  "enquiry",
  "contacted",
  "pilot_started",
  "active",
  "churned",
] as const;

const patchSchema = z.object({
  pilotId: z.string().uuid().optional(),
  enquiryId: z.string().uuid().optional(),
  status: z.enum(B2B_STATUSES),
  monthlyFee: z.number().int().positive().optional(),
  enquiry: z
    .object({
      companyName: z.string().min(1),
      contactName: z.string().min(1),
      contactEmail: z.string().email(),
      contactRole: z.string().nullable().optional(),
    })
    .optional(),
});

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const payload = patchSchema.parse(await request.json());
    const supabase = createServiceRoleClient();

    const shouldSetStartedAt =
      payload.status === "pilot_started" || payload.status === "active";

    if (payload.pilotId) {
      const { data: existing } = await supabase
        .from("b2b_pilots")
        .select("started_at")
        .eq("id", payload.pilotId)
        .maybeSingle();

      const { data, error } = await supabase
        .from("b2b_pilots")
        .update({
          status: payload.status,
          ...(payload.monthlyFee ? { monthly_fee: payload.monthlyFee } : {}),
          ...(shouldSetStartedAt && !existing?.started_at
            ? { started_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", payload.pilotId)
        .select("id, status, monthly_fee, started_at")
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json(
          { error: error?.message ?? "Pilot not found" },
          { status: 400 },
        );
      }

      return NextResponse.json({ ok: true, row: data });
    }

    if (!payload.enquiry) {
      if (!payload.enquiryId) {
        return NextResponse.json(
          { error: "Missing enquiry details for new pilot" },
          { status: 400 },
        );
      }
    }

    let enquiryPayload = payload.enquiry;
    if (!enquiryPayload && payload.enquiryId) {
      const { data: enquiryRow } = await supabase
        .from("business_enquiries")
        .select("company_name, contact_name, email, role")
        .eq("id", payload.enquiryId)
        .maybeSingle();
      if (!enquiryRow) {
        return NextResponse.json(
          { error: "Business enquiry not found" },
          { status: 404 },
        );
      }
      enquiryPayload = {
        companyName: enquiryRow.company_name,
        contactName: enquiryRow.contact_name,
        contactEmail: enquiryRow.email,
        contactRole: enquiryRow.role,
      };
    }

    const { data, error } = await supabase
      .from("b2b_pilots")
      .insert({
        company_name: enquiryPayload!.companyName,
        contact_name: enquiryPayload!.contactName,
        contact_email: enquiryPayload!.contactEmail,
        contact_role: enquiryPayload!.contactRole ?? null,
        business_enquiry_id: payload.enquiryId ?? null,
        plan_type: "standard",
        monthly_fee: payload.monthlyFee ?? 50000,
        currency: "gbp",
        status: payload.status,
        started_at: shouldSetStartedAt ? new Date().toISOString() : null,
      })
      .select("id, status, monthly_fee, started_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, row: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Could not update B2B status" },
      { status: 500 },
    );
  }
}
