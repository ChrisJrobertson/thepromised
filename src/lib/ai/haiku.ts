import { anthropic, CLAUDE_MODELS } from "./client";

/**
 * One-line summary of a longer interaction text.
 */
export async function quickSummary(text: string): Promise<string | null> {
  try {
    const interactionText = text.slice(0, 8000);
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.summarisation,
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Summarise this customer service interaction in one sentence. Be factual and specific:\n\n${interactionText}`,
      }],
    });
    const content = response.content[0];
    return content?.type === "text" ? content.text.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Detects the likely interaction channel from pasted text.
 */
export async function classifyChannel(
  text: string
): Promise<string | null> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.classification,
      max_tokens: 30,
      messages: [{
        role: "user",
        content:
          `Classify the channel for this interaction text as exactly one of: phone, email, letter, webchat, in_person, social_media, app, other. Reply with only that single value.\n\n${text.slice(0, 3000)}`,
      }],
    });
    const value =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim().toLowerCase()
        : "";
    const allowed = new Set([
      "phone",
      "email",
      "letter",
      "webchat",
      "in_person",
      "social_media",
      "app",
      "other",
    ]);
    return allowed.has(value) ? value : "other";
  } catch {
    return null;
  }
}

export type ExtractedEntities = {
  names: string[];
  organisations: string[];
  dates: string[];
  references: string[];
};

export async function extractEntities(
  text: string
): Promise<ExtractedEntities | null> {
  try {
    const emailText = text.slice(0, 12000);
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.entityExtraction,
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Extract the following from this email. Return JSON only, no other text:
{
  "date": "ISO date string or null",
  "from": "sender name/email or null",
  "subject": "subject line or null",
  "reference_number": "any reference/case number or null",
  "contact_name": "person who wrote it or null",
  "department": "department mentioned or null",
  "promises_made": "any commitments made or null",
  "summary": "one sentence summary"
}

Email:
${emailText}`,
      }],
    });
    const raw =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "";
    const cleaned = raw.replace(/^```(?:json)?\n?/m, "").replace(/```$/m, "").trim();
    const parsed = JSON.parse(cleaned) as {
      date?: string | null;
      from?: string | null;
      contact_name?: string | null;
      reference_number?: string | null;
    };
    const entities: ExtractedEntities = {
      names: [parsed.contact_name, parsed.from].filter((v): v is string => Boolean(v)),
      organisations: [],
      dates: parsed.date ? [parsed.date] : [],
      references: parsed.reference_number ? [parsed.reference_number] : [],
    };
    return entities;
  } catch {
    return null;
  }
}

export async function sentimentScore(
  text: string
): Promise<"helpful" | "neutral" | "unhelpful" | "hostile" | null> {
  try {
    const summary = text.slice(0, 3000);
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.classification,
      max_tokens: 50,
      messages: [{
        role: "user",
        content:
          `Based on this customer service interaction summary, rate the helpfulness of the company representative as exactly one of: helpful, neutral, unhelpful, hostile. Reply with only that single word.\n\n${summary}`,
      }],
    });
    const value =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim().toLowerCase()
        : "";
    if (value === "helpful" || value === "neutral" || value === "unhelpful" || value === "hostile") {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}
