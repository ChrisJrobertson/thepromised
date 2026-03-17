import type { SupabaseClient } from "@supabase/supabase-js";

const MONTH_YEAR_FORMAT = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

export type MonthlyAiUsage = {
  suggestions_used: number;
  letters_used: number;
  month_year: string;
};

/**
 * Get or create the current month's AI usage row for a user.
 * Used for free-tier monthly limits (calendar month).
 */
export async function getMonthlyUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<MonthlyAiUsage> {
  const monthYear = MONTH_YEAR_FORMAT(new Date());
  const { data, error } = await supabase
    .from("monthly_ai_usage")
    .select("suggestions_used, letters_used, month_year")
    .eq("user_id", userId)
    .eq("month_year", monthYear)
    .maybeSingle();

  if (error) throw error;
  if (data)
    return {
      suggestions_used: data.suggestions_used ?? 0,
      letters_used: data.letters_used ?? 0,
      month_year: data.month_year,
    };

  const { data: inserted, error: insertError } = await supabase
    .from("monthly_ai_usage")
    .insert({ user_id: userId, month_year: monthYear })
    .select("suggestions_used, letters_used, month_year")
    .single();

  if (insertError) throw insertError;
  return {
    suggestions_used: inserted?.suggestions_used ?? 0,
    letters_used: inserted?.letters_used ?? 0,
    month_year: inserted?.month_year ?? monthYear,
  };
}

/**
 * Increment suggestions or letters used for the current month (free tier).
 * Uses get-then-insert/update so the row exists after first use.
 */
export async function incrementMonthlyUsage(
  supabase: SupabaseClient,
  userId: string,
  kind: "suggestions" | "letters"
): Promise<void> {
  const usage = await getMonthlyUsage(supabase, userId);
  const monthYear = usage.month_year;

  const { error } = await supabase
    .from("monthly_ai_usage")
    .update({
      suggestions_used: kind === "suggestions" ? usage.suggestions_used + 1 : usage.suggestions_used,
      letters_used: kind === "letters" ? usage.letters_used + 1 : usage.letters_used,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("month_year", monthYear);

  if (error) throw error;
}
