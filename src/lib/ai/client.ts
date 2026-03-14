import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type AiTier = "free" | "basic" | "pro";
export type AiFeature = "suggestions" | "letters" | "summaries";

const TIER_LIMITS: Record<AiTier, Record<AiFeature, number>> = {
  free: {
    suggestions: 0,
    letters: 0,
    summaries: 100,
  },
  basic: {
    suggestions: 10,
    letters: 5,
    summaries: 100,
  },
  pro: {
    suggestions: 50,
    letters: 30,
    summaries: 100,
  },
};

export function getAiLimit(tier: AiTier, feature: AiFeature) {
  return TIER_LIMITS[tier][feature];
}

export function getAnthropicClient() {
  return anthropic;
}
