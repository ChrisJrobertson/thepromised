import Anthropic from "@anthropic-ai/sdk";

// Claude — premium tasks: letter drafting, case analysis, strategic guidance
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Re-export from constants for convenience
export { AI_LIMITS, type AiTier, type AiFeature } from "./constants";

/**
 * Provider routing:
 * - Letter drafting         → Claude Sonnet (quality critical)
 * - Case analysis           → Claude Sonnet (needs reasoning)
 * - Quick summaries         → Hugging Face BART (cheap, high volume)
 * - Channel classification  → Hugging Face zero-shot (cheap)
 * - Entity extraction       → Hugging Face NER (cheap)
 * - Sentiment/mood          → Hugging Face sentiment (cheap)
 */
export const CLAUDE_MODELS = {
  letterDrafting: "claude-sonnet-4-5-20250514",
  caseAnalysis: "claude-sonnet-4-5-20250514",
  summarisation: "claude-haiku-4-5-20251001",
  entityExtraction: "claude-haiku-4-5-20251001",
  classification: "claude-haiku-4-5-20251001",
} as const;

export const CLAUDE_MODEL = CLAUDE_MODELS.caseAnalysis;
