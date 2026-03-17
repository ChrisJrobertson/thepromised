import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { BusinessEnquiry, Database } from "@/types/database";

type PlatformStatsRow = Database["public"]["Views"]["v_platform_stats"]["Row"];
type CompanyStatsRow = Database["public"]["Views"]["v_company_stats"]["Row"];
type MonthlyTrendRow = Database["public"]["Views"]["v_monthly_trends"]["Row"];
type CategoryStatsRow = Database["public"]["Views"]["v_category_stats"]["Row"];
type CompanyRankingRow = Database["public"]["Views"]["v_company_rankings"]["Row"];
type SignupRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "subscription_tier" | "created_at"
>;
type AdminUserRow = SignupRow & {
  cases_count: number;
  interactions_count: number;
  letters_count: number;
};

export async function getPlatformStats(): Promise<PlatformStatsRow> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("v_platform_stats").select("*").single();
  if (error) throw error;
  return data as PlatformStatsRow;
}

export async function getCompanyStats(): Promise<CompanyStatsRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("v_company_stats")
    .select("*")
    .order("total_cases", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CompanyStatsRow[];
}

export async function getCompanyStatsById(organisationId: string): Promise<CompanyStatsRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("v_company_stats")
    .select("*")
    .eq("organisation_id", organisationId)
    .single();
  if (error) throw error;
  return data as CompanyStatsRow;
}

export async function getMonthlyTrends(): Promise<MonthlyTrendRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("v_monthly_trends")
    .select("*")
    .order("month", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MonthlyTrendRow[];
}

export async function getCategoryStats(): Promise<CategoryStatsRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("v_category_stats")
    .select("*")
    .order("total_cases", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CategoryStatsRow[];
}

export async function getCompanyRankings(limit = 20): Promise<CompanyRankingRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("v_company_rankings")
    .select("*")
    .order("complaint_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as CompanyRankingRow[];
}

export async function getRecentSignups(limit = 20): Promise<Array<SignupRow & { cases_created: number }>> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, subscription_tier, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const signups = (data ?? []) as SignupRow[];

  const userIds = signups.map((u) => u.id);
  if (!userIds.length) return [];

  const { data: cases, error: casesError } = await supabase
    .from("cases")
    .select("user_id")
    .in("user_id", userIds);
  if (casesError) throw casesError;

  const counts = new Map<string, number>();
  for (const c of cases ?? []) {
    counts.set(c.user_id, (counts.get(c.user_id) ?? 0) + 1);
  }

  return signups.map((u) => ({
    ...u,
    cases_created: counts.get(u.id) ?? 0,
  }));
}

export async function getBusinessEnquiries(limit = 20): Promise<BusinessEnquiry[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("business_enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as BusinessEnquiry[];
}

export async function getAdminUsers(limit = 100, offset = 0): Promise<AdminUserRow[]> {
  const supabase = createServiceRoleClient();
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, email, subscription_tier, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  const rows = (users ?? []) as SignupRow[];

  const userIds = rows.map((u) => u.id);
  if (!userIds.length) return [];

  const [{ data: cases }, { data: interactions }, { data: letters }] = await Promise.all([
    supabase.from("cases").select("user_id").in("user_id", userIds),
    supabase.from("interactions").select("user_id").in("user_id", userIds),
    supabase.from("letters").select("user_id").in("user_id", userIds),
  ]);

  const countBy = (rows: Array<{ user_id: string }> | null | undefined) => {
    const map = new Map<string, number>();
    for (const row of rows ?? []) {
      map.set(row.user_id, (map.get(row.user_id) ?? 0) + 1);
    }
    return map;
  };

  const caseCounts = countBy(cases);
  const interactionCounts = countBy(interactions);
  const letterCounts = countBy(letters);

  return rows.map((u) => ({
    ...u,
    cases_count: caseCounts.get(u.id) ?? 0,
    interactions_count: interactionCounts.get(u.id) ?? 0,
    letters_count: letterCounts.get(u.id) ?? 0,
  }));
}
