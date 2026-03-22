import { anthropic, CLAUDE_MODELS } from "./client";
import { traceAICall } from "./trace";

/**
 * One-line summary of a longer interaction text.
 */
export async function quickSummary(text: string): Promise<string | null> {
  const userContent = `Summarise this customer service interaction in one sentence. Be factual and specific:\n\n${text.slice(0, 8000)}`;

  const tracer = traceAICall({
    name: "summarise",
    model: CLAUDE_MODELS.summarisation,
    input: { messages: [{ role: "user", content: userContent }] },
    tags: ["summarisation"],
  });

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.summarisation,
      max_tokens: 150,
      messages: [{ role: "user", content: userContent }],
    });
    const content = response.content[0];
    const result = content?.type === "text" ? content.text.trim() : null;

    tracer.success({
      content: result ?? "",
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason,
    });

    return result;
  } catch (error) {
    tracer.error(error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Detects the likely interaction channel from pasted text.
 */
export async function classifyChannel(
  text: string
): Promise<string | null> {
  const userContent = `Classify the channel for this interaction text as exactly one of: phone, email, letter, webchat, in_person, social_media, app, other. Reply with only that single value.\n\n${text.slice(0, 3000)}`;

  const tracer = traceAICall({
    name: "classify-channel",
    model: CLAUDE_MODELS.classification,
    input: { messages: [{ role: "user", content: userContent }] },
    tags: ["classification", "channel"],
  });

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.classification,
      max_tokens: 30,
      messages: [{ role: "user", content: userContent }],
    });
    const value =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim().toLowerCase()
        : "";

    tracer.success({
      content: value,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason,
    });

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
  } catch (error) {
    tracer.error(error instanceof Error ? error : new Error(String(error)));
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
  const emailText = text.slice(0, 12000);
  const userContent = `Extract the following from this email. Return JSON only, no other text:
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
${emailText}`;

  const tracer = traceAICall({
    name: "entity-extraction",
    model: CLAUDE_MODELS.entityExtraction,
    input: { messages: [{ role: "user", content: userContent }] },
    tags: ["entity-extraction"],
  });

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.entityExtraction,
      max_tokens: 500,
      messages: [{ role: "user", content: userContent }],
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

    tracer.success({
      content: raw,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason,
    });

    const entities: ExtractedEntities = {
      names: [parsed.contact_name, parsed.from].filter((v): v is string => Boolean(v)),
      organisations: [],
      dates: parsed.date ? [parsed.date] : [],
      references: parsed.reference_number ? [parsed.reference_number] : [],
    };
    return entities;
  } catch (error) {
    tracer.error(error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

export async function sentimentScore(
  text: string
): Promise<"helpful" | "neutral" | "unhelpful" | "hostile" | null> {
  const summary = text.slice(0, 3000);
  const userContent = `Based on this customer service interaction summary, rate the helpfulness of the company representative as exactly one of: helpful, neutral, unhelpful, hostile. Reply with only that single word.\n\n${summary}`;

  const tracer = traceAICall({
    name: "sentiment-score",
    model: CLAUDE_MODELS.classification,
    input: { messages: [{ role: "user", content: userContent }] },
    tags: ["classification", "sentiment"],
  });

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.classification,
      max_tokens: 50,
      messages: [{ role: "user", content: userContent }],
    });
    const value =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim().toLowerCase()
        : "";

    tracer.success({
      content: value,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason,
    });

    if (value === "helpful" || value === "neutral" || value === "unhelpful" || value === "hostile") {
      return value;
    }
    return null;
  } catch (error) {
    tracer.error(error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}
