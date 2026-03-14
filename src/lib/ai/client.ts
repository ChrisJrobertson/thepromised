import Anthropic from "@anthropic-ai/sdk";
import { HfInference } from "@huggingface/inference";

// Claude — premium tasks: letter drafting, case analysis, strategic guidance
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Hugging Face — volume tasks: summaries, classification, entity extraction, sentiment
export const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Re-export from constants for convenience
export { AI_LIMITS, type AiTier, type AiFeature } from "./constants";

export function getAiLimit(tier: import("./constants").AiTier, feature: import("./constants").AiFeature): number {
  const limits: Record<string, Record<string, number>> = {
    free: { suggestions: 0, letters: 0, summaries: 0 },
    basic: { suggestions: 10, letters: 5, summaries: 100 },
    pro: { suggestions: 50, letters: 30, summaries: 500 },
  };
  return limits[tier]?.[feature] ?? 0;
}

/**
 * Provider routing:
 * - Letter drafting         → Claude Sonnet (quality critical)
 * - Case analysis           → Claude Sonnet (needs reasoning)
 * - Quick summaries         → Hugging Face BART (cheap, high volume)
 * - Channel classification  → Hugging Face zero-shot (cheap)
 * - Entity extraction       → Hugging Face NER (cheap)
 * - Sentiment/mood          → Hugging Face sentiment (cheap)
 */
export const CLAUDE_MODEL = "claude-sonnet-4-5";

export const HF_MODELS = {
  summarisation: "facebook/bart-large-cnn",
  zeroShot: "facebook/bart-large-mnli",
  ner: "dslim/bert-base-NER",
  sentiment: "cardiffnlp/twitter-roberta-base-sentiment-latest",
} as const;
