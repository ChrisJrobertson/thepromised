import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { BusinessEnquiry } from "@/types/database";

export async function getPlatformStats() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("v_platform_stats").select("*").single();
  if (error) throw error;
  return data;
}

export async function getCompanyStats() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("v_company_stats")
    .select("*")
    .order("total_cases", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCompanyStatsById(organisationId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("v_company_stats")
    .select("*")
    .eq("organisation_id", organisationId)
    .single();
  if (error) throw error;
  return data;
}

export async function getMonthlyTrends() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("v_monthly_trends")
    .select("*")
    .order("month", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCategoryStats() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("v_category_stats")
    .select("*")
    .order("total_cases", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCompanyRankings(limit = 20) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("v_company_rankings")
    .select("*")
    .order("complaint_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getRecentSignups(limit = 20) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, subscription_tier, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const userIds = (data ?? []).map((u) => u.id);
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

  return (data ?? []).map((u) => ({
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
  return data ?? [];
}

export async function getAdminUsers(limit = 200) {
  const supabase = createServiceRoleClient();
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, email, subscription_tier, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const userIds = (users ?? []).map((u) => u.id);
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

  return (users ?? []).map((u) => ({
    ...u,
    cases_count: caseCounts.get(u.id) ?? 0,
    interactions_count: interactionCounts.get(u.id) ?? 0,
    letters_count: letterCounts.get(u.id) ?? 0,
  }));
}
