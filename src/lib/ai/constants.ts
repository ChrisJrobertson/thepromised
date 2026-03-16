export type AiTier = "free" | "basic" | "pro";
export type AiFeature = "suggestions" | "letters" | "summaries";

export const AI_LIMITS: Record<AiTier, Record<AiFeature, number>> = {
  free: { suggestions: 3, letters: 1, summaries: 0 },
  basic: { suggestions: 10, letters: 5, summaries: 100 },
  pro: { suggestions: 50, letters: 30, summaries: 500 },
} as const;
