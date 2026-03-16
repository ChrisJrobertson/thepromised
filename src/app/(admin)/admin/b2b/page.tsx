import { B2BPilotsTable, type B2BTableRow } from "@/components/admin/B2BPilotsTable";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { B2BPilot, BusinessEnquiry } from "@/types/database";

function toKey(companyName: string, contactEmail: string) {
  return `${companyName.trim().toLowerCase()}::${contactEmail.trim().toLowerCase()}`;
}

export default async function AdminB2BPage() {
  const supabase = createServiceRoleClient();
  const [{ data: enquiriesRaw }, { data: pilotsRaw }] = await Promise.all([
    supabase
      .from("business_enquiries")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("b2b_pilots")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const enquiries = (enquiriesRaw ?? []) as BusinessEnquiry[];
  const pilots = (pilotsRaw ?? []) as B2BPilot[];

  const pilotsByKey = new Map(
    pilots.map((pilot) => [toKey(pilot.company_name, pilot.contact_email), pilot]),
  );

  const rows: B2BTableRow[] = enquiries.map((enquiry) => {
    const pilot = pilotsByKey.get(toKey(enquiry.company_name, enquiry.email));
    return {
      key: `enquiry:${enquiry.id}`,
      pilotId: pilot?.id ?? null,
      companyName: enquiry.company_name,
      contactName: enquiry.contact_name,
      contactEmail: enquiry.email,
      contactRole: enquiry.role,
      status: (pilot?.status ?? "enquiry") as B2BTableRow["status"],
      monthlyFee: pilot?.monthly_fee ?? 50000,
      startedAt: pilot?.started_at ?? null,
    };
  });

  const enquiryKeys = new Set(
    enquiries.map((enquiry) => toKey(enquiry.company_name, enquiry.email)),
  );

  for (const pilot of pilots) {
    const key = toKey(pilot.company_name, pilot.contact_email);
    if (enquiryKeys.has(key)) continue;

    rows.push({
      key: `pilot:${pilot.id}`,
      pilotId: pilot.id,
      companyName: pilot.company_name,
      contactName: pilot.contact_name,
      contactEmail: pilot.contact_email,
      contactRole: pilot.contact_role,
      status: pilot.status as B2BTableRow["status"],
      monthlyFee: pilot.monthly_fee,
      startedAt: pilot.started_at,
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">B2B Pilots</h1>
      <p className="text-sm text-slate-600">
        Track company enquiries and pilot progression from enquiry to active
        account.
      </p>

      <B2BPilotsTable initialRows={rows} />
    </div>
  );
}
