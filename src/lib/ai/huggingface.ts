import { hf, HF_MODELS } from "./client";

/**
 * One-line summary of a longer interaction text using BART.
 * Cheap: suitable for auto-enhancing every interaction on save.
 */
export async function quickSummary(text: string): Promise<string | null> {
  try {
    const truncated = text.slice(0, 1024); // BART input limit
    const result = await hf.summarization({
      model: HF_MODELS.summarisation,
      inputs: truncated,
      parameters: {
        max_new_tokens: 60,
        min_length: 10,
      },
    });
    return result.summary_text ?? null;
  } catch {
    return null;
  }
}

/**
 * Detects the likely interaction channel from pasted text using zero-shot classification.
 */
export async function classifyChannel(
  text: string
): Promise<string | null> {
  try {
    const labels = ["phone call", "email", "letter", "live chat", "in person", "social media", "app"];
    const results = await hf.zeroShotClassification({
      model: HF_MODELS.zeroShot,
      inputs: text.slice(0, 512),
      parameters: { candidate_labels: labels },
    });

    const channelMap: Record<string, string> = {
      "phone call": "phone",
      email: "email",
      letter: "letter",
      "live chat": "webchat",
      "in person": "in_person",
      "social media": "social_media",
      app: "app",
    };

    // Results is an array of { label, score } sorted by score descending
    const topResult = Array.isArray(results) && results.length > 0 ? results[0] : null;
    const topLabel = topResult?.label;
    return topLabel ? (channelMap[topLabel] ?? "other") : null;
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

/**
 * Extracts named entities (persons, organisations, dates) from interaction text.
 * Uses BERT NER model.
 */
export async function extractEntities(
  text: string
): Promise<ExtractedEntities | null> {
  try {
    const results = await hf.tokenClassification({
      model: HF_MODELS.ner,
      inputs: text.slice(0, 512),
    });

    const entities: ExtractedEntities = {
      names: [],
      organisations: [],
      dates: [],
      references: [],
    };

    let currentWord = "";
    let currentTag = "";

    for (const token of results) {
      const tag = token.entity_group ?? token.entity ?? "";
      const word = token.word.replace(/^##/, ""); // Handle sub-word tokens

      if (tag.endsWith("PER")) {
        if (tag.startsWith("B-") || tag === "PER") {
          if (currentWord && currentTag === "PER") {
            entities.names.push(currentWord.trim());
          }
          currentWord = word;
          currentTag = "PER";
        } else if (tag.startsWith("I-")) {
          currentWord += ` ${word}`;
        }
      } else if (tag.endsWith("ORG")) {
        if (tag.startsWith("B-") || tag === "ORG") {
          if (currentWord && currentTag === "ORG") {
            entities.organisations.push(currentWord.trim());
          }
          currentWord = word;
          currentTag = "ORG";
        } else if (tag.startsWith("I-")) {
          currentWord += ` ${word}`;
        }
      } else {
        if (currentWord && currentTag === "PER") {
          entities.names.push(currentWord.trim());
        } else if (currentWord && currentTag === "ORG") {
          entities.organisations.push(currentWord.trim());
        }
        currentWord = "";
        currentTag = "";
      }
    }

    // Flush last entity
    if (currentWord && currentTag === "PER") entities.names.push(currentWord.trim());
    if (currentWord && currentTag === "ORG") entities.organisations.push(currentWord.trim());

    // Extract reference numbers via regex (e.g. REF-12345, CAS/12345, #12345)
    const refPattern = /(?:ref(?:erence)?|case|ticket|complaint|#)\s*[:\-#]?\s*([A-Z0-9][A-Z0-9\-\/]{3,20})/gi;
    const refMatches = text.matchAll(refPattern);
    for (const match of refMatches) {
      if (match[1]) entities.references.push(match[1]);
    }

    // Extract dates via regex
    const datePattern =
      /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\b/gi;
    const dateMatches = text.matchAll(datePattern);
    for (const match of dateMatches) {
      if (match[0]) entities.dates.push(match[0]);
    }

    // Deduplicate
    entities.names = [...new Set(entities.names)].filter((n) => n.length > 2);
    entities.organisations = [...new Set(entities.organisations)].filter((n) => n.length > 2);
    entities.references = [...new Set(entities.references)];
    entities.dates = [...new Set(entities.dates)];

    return entities;
  } catch {
    return null;
  }
}

/**
 * Gauges the sentiment/tone of an interaction text.
 * Maps model labels to our mood field values.
 */
export async function sentimentScore(
  text: string
): Promise<"helpful" | "neutral" | "unhelpful" | "hostile" | null> {
  try {
    const results = await hf.textClassification({
      model: HF_MODELS.sentiment,
      inputs: text.slice(0, 512),
    });

    if (!results.length) return null;

    const topResult = results.sort((a, b) => b.score - a.score)[0];
    const label = topResult?.label?.toLowerCase() ?? "";

    // cardiffnlp model labels: LABEL_0=negative, LABEL_1=neutral, LABEL_2=positive
    // or "negative", "neutral", "positive"
    if (label.includes("positive") || label === "label_2") {
      return "helpful";
    } else if (label.includes("negative") || label === "label_0") {
      return topResult && topResult.score > 0.85 ? "hostile" : "unhelpful";
    } else {
      return "neutral";
    }
  } catch {
    return null;
  }
}
