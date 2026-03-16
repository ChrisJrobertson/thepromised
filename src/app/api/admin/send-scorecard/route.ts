import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/admin-api";
import { EMAIL_FROM, getResendClient } from "@/lib/email/client";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

const inputSchema = z.object({
  organisationId: z.string().uuid(),
  recipientEmail: z.string().email(),
});

type CompanyStatsRow = Database["public"]["Views"]["v_company_stats"]["Row"];

function toGrade(score: number) {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const payload = inputSchema.parse(await request.json());
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("v_company_stats")
      .select("*")
      .eq("organisation_id", payload.organisationId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Company scorecard not found" },
        { status: 404 },
      );
    }

    const stats = data as CompanyStatsRow;
    const totalPromises = Number(stats.total_promises ?? 0);
    const promisesKept = Number(stats.promises_kept ?? 0);
    const promiseKeepingRate = totalPromises
      ? (promisesKept / totalPromises) * 100
      : 0;
    const helpfulnessScore = Number(stats.avg_helpfulness_score ?? 0);
    const helpfulnessPct = Math.min(100, (helpfulnessScore / 4) * 100);
    const responseRate = Number(stats.responses_received_count ?? 0) && Number(stats.letters_sent_count ?? 0)
      ? (Number(stats.responses_received_count ?? 0) /
          Number(stats.letters_sent_count ?? 0)) *
        100
      : 0;
    const resolutionRate = Number(stats.total_cases ?? 0)
      ? (Number(stats.resolved_cases ?? 0) / Number(stats.total_cases ?? 0)) * 100
      : 0;
    const composite =
      promiseKeepingRate * 0.35 +
      helpfulnessPct * 0.25 +
      responseRate * 0.2 +
      resolutionRate * 0.2;
    const grade = toGrade(composite);

    const companyName = stats.organisation_name ?? "Your organisation";
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";
    const fromAddress = process.env.RESEND_ADMIN_FROM ?? EMAIL_FROM;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">${companyName} Complaint Scorecard Preview</h2>
        <p style="margin-top: 0;">This is what your customers are reporting through TheyPromised.</p>
        <div style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc;">
          <p style="font-size: 20px; margin: 0 0 12px;"><strong>Grade: ${grade}</strong></p>
          <ul style="padding-left: 18px; margin: 0;">
            <li>Promise keeping rate: <strong>${promiseKeepingRate.toFixed(1)}%</strong></li>
            <li>Average response time: <strong>${Number(stats.avg_response_days ?? 0).toFixed(1)} days</strong></li>
            <li>Helpfulness score: <strong>${helpfulnessScore.toFixed(2)} / 4</strong></li>
            <li>Escalation rate: <strong>${Number(stats.escalation_rate_pct ?? 0).toFixed(1)}%</strong></li>
            <li>Total tracked complaints: <strong>${Number(stats.total_cases ?? 0)}</strong></li>
          </ul>
        </div>
        <p style="margin-top: 16px;">
          This is what your customers are reporting. Want the full monthly report?
        </p>
        <p>
          <a href="${appUrl}/business" style="display:inline-block;padding:10px 14px;background:#1e3a5f;color:#fff;text-decoration:none;border-radius:6px;">
            Learn about monthly complaint intelligence
          </a>
        </p>
      </div>
    `;

    const resend = getResendClient();
    const sendResult = await resend.emails.send({
      from: fromAddress,
      to: payload.recipientEmail,
      subject: `${companyName} complaint scorecard preview`,
      html,
    });

    return NextResponse.json({
      ok: true,
      id: sendResult.data?.id ?? null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Could not send scorecard email" },
      { status: 500 },
    );
  }
}
