/**
 * Single source of truth for all subscription tier limits and configuration.
 *
 * TODO: This file consolidates limits that were previously scattered across:
 *   - src/lib/ai/constants.ts
 *   - src/lib/ai/client.ts (getAiLimit duplicate)
 *   - src/app/api/ai/suggest/route.ts (inline tierLimits)
 *   - src/app/api/ai/draft-letter/route.ts (inline tierLimits)
 *   - src/app/api/ai/summarise/route.ts (inline tierLimits)
 */

export type SubscriptionTier = "free" | "basic" | "pro";
export type AiFeature = "suggestions" | "letters" | "summaries";

/**
 * Monthly AI usage limits per subscription tier.
 *
 * Free tier has intentional non-zero credits so new users can experience
 * AI-powered features before being asked to upgrade (the "magic moment").
 */
export const TIER_AI_LIMITS: Record<SubscriptionTier, Record<AiFeature, number>> = {
  free: { suggestions: 3, letters: 1, summaries: 5 },
  basic: { suggestions: 10, letters: 5, summaries: 100 },
  pro: { suggestions: 50, letters: 30, summaries: 500 },
} as const;

/** Maximum number of active cases per tier. null = unlimited. */
export const TIER_CASE_LIMITS: Record<SubscriptionTier, number | null> = {
  free: 1,
  basic: null,
  pro: null,
} as const;
