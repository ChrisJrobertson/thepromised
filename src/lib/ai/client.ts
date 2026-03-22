import Anthropic from "@anthropic-ai/sdk";

// Claude — premium tasks: letter drafting, case analysis, strategic guidance
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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
 * Canonical Claude model IDs — Anthropic Messages API.
 *
 * Sonnet 4 (claude-sonnet-4-20250514) — letter drafting, case analysis.
 *   Best quality/cost ratio for structured legal-tone writing.
 *
 * Haiku 4.5 (claude-haiku-4-5-20251001) — summarisation, extraction, classification.
 *   Near-frontier quality at $1/$5 per MTok (input/output).
 *
 * If upgrading later, get valid IDs from: https://platform.claude.com/docs/en/about-claude/models/overview
 * Or query the Models API: GET https://api.anthropic.com/v1/models
 *
 * Last updated: 17 March 2026
 */
export const CLAUDE_MODELS = {
  letterDrafting: "claude-sonnet-4-20250514",
  caseAnalysis: "claude-sonnet-4-20250514",
  summarisation: "claude-haiku-4-5-20251001",
  entityExtraction: "claude-haiku-4-5-20251001",
  classification: "claude-haiku-4-5-20251001",
} as const;

export const CLAUDE_MODEL = CLAUDE_MODELS.caseAnalysis;
