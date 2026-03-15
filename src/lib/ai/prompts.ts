export const BASE_SYSTEM = `You are an AI assistant for TheyPromised.app, a UK consumer complaint tracking platform. You help people resolve disputes with energy companies, banks, HMRC, landlords, the NHS, councils, and other organisations.

You provide guidance based on:
- UK consumer rights law (Consumer Rights Act 2015, Consumer Contracts Regulations 2013, etc.)
- Ombudsman procedures (Financial Ombudsman, Energy Ombudsman, Housing Ombudsman, Local Government Ombudsman, Parliamentary Ombudsman, Rail Ombudsman, Communications Ombudsman)
- GDPR and data subject rights
- Employment rights (ACAS, Employment Tribunals)
- Small claims court procedures (England and Wales)

Rules:
- Always use UK English (organisation, colour, licence, behaviour, etc.)
- Be accurate. If unsure about a specific procedure, say so and direct the user to verify with the relevant ombudsman's website.
- Never hallucinate legal procedures, deadlines, or compensation limits.
- Do not give legal advice that requires a qualified solicitor — always recommend seeking legal advice for complex matters.
- Be empathetic but practical.`.trim();

export const CASE_ANALYSIS_SYSTEM = `${BASE_SYSTEM}

You are analysing a consumer complaint case to provide actionable guidance. Respond with STRICT JSON only — no markdown, no code blocks, just the raw JSON object.`;

export const LETTER_SYSTEM = `${BASE_SYSTEM}

You are drafting a formal complaint letter for a UK consumer. The letter must:
- Be professional, firm, and factual
- Reference only information provided in the case data — do not invent facts
- Use formal letter format with date, addresses, subject line, and sign-off
- Set a clear 14-day deadline for response
- Reference relevant UK law where applicable (but only laws you are certain apply)
- Be written in the first person from the complainant's perspective
- NOT include any commentary or notes — output only the letter text itself`;

export const AI_PROMPTS = {
  baseSystem: BASE_SYSTEM,
  caseSuggest: CASE_ANALYSIS_SYSTEM,
  draftLetter: LETTER_SYSTEM,
  summarise: `${BASE_SYSTEM}\n\nSummarise the following interaction note into one clear, factual sentence. Output only the summary sentence with no preamble.`,
};

export function buildCaseAnalysisPrompt(caseContext: {
  title: string;
  category: string;
  description: string | null;
  status: string;
  escalationStage: string;
  priority: string;
  firstContactDate: string | null;
  daysOpen: number;
  desiredOutcome: string | null;
  amountInDispute: number | null;
  referenceNumber: string | null;
  organisationName: string;
  interactions: Array<{
    date: string;
    channel: string;
    direction: string;
    summary: string;
    outcome: string | null;
    promisesMade: string | null;
    promiseFulfilled: boolean | null;
    mood: string | null;
  }>;
  escalationRules: Array<{
    stageOrder: number;
    title: string;
    waitPeriodDays: number | null;
    regulatoryBody: string | null;
    tips: string | null;
  }>;
}): string {
  const interactionsSummary = caseContext.interactions
    .slice(-10) // Last 10 interactions to keep prompt size manageable
    .map(
      (i, idx) =>
        `Interaction ${idx + 1} (${i.date}, ${i.channel}, ${i.direction}): ${i.summary}${
          i.outcome ? ` [Outcome: ${i.outcome}]` : ""
        }${i.promisesMade ? ` [Promise: ${i.promisesMade}${i.promiseFulfilled === false ? " — BROKEN" : i.promiseFulfilled === true ? " — KEPT" : " — PENDING"}]` : ""}${
          i.mood ? ` [Staff attitude: ${i.mood}]` : ""
        }`
    )
    .join("\n");

  return `Analyse this UK consumer complaint case and provide actionable guidance.

CASE DETAILS:
- Organisation: ${caseContext.organisationName}
- Category: ${caseContext.category}
- Case title: ${caseContext.title}
- Description: ${caseContext.description ?? "Not provided"}
- Status: ${caseContext.status}
- Current escalation stage: ${caseContext.escalationStage}
- Priority: ${caseContext.priority}
- Days open: ${caseContext.daysOpen}
- First contact date: ${caseContext.firstContactDate ?? "Unknown"}
- Desired outcome: ${caseContext.desiredOutcome ?? "Not specified"}
- Amount in dispute: ${caseContext.amountInDispute ? `£${caseContext.amountInDispute.toFixed(2)}` : "Not specified"}
- Reference number: ${caseContext.referenceNumber ?? "None"}

INTERACTIONS (${caseContext.interactions.length} total, showing last ${Math.min(10, caseContext.interactions.length)}):
${interactionsSummary || "No interactions logged yet."}

AVAILABLE ESCALATION ROUTES:
${caseContext.escalationRules.map((r) => `Stage ${r.stageOrder}: ${r.title} (wait: ${r.waitPeriodDays ?? 0} days, body: ${r.regulatoryBody ?? "N/A"})`).join("\n")}

Respond with this exact JSON structure:
{
  "assessment": "2-3 sentence overall assessment of the case strength and situation",
  "nextStep": "The single most important action to take right now (1-2 sentences, specific and actionable)",
  "deadlines": ["Array of upcoming deadlines or time-sensitive actions, each as a concise string"],
  "evidenceNeeded": ["Array of evidence types that would strengthen the case"],
  "strengthRating": "weak|moderate|strong",
  "strengthExplanation": "1-2 sentence explanation of the strength rating",
  "letterRecommended": true|false,
  "letterType": "initial_complaint|follow_up|escalation|final_response_request|ombudsman_referral|subject_access_request|formal_notice|null"
}`;
}

export function buildLetterPrompt(context: {
  letterType: string;
  letterTypeName: string;
  legalReferences: string[];
  suggestedTone: string;
  organisationName: string;
  complaintEmail: string | null;
  complaintPhone: string | null;
  senderName: string;
  senderAddressLine1: string | null;
  senderAddressLine2: string | null;
  senderCity: string | null;
  senderPostcode: string | null;
  caseTitle: string;
  caseDescription: string | null;
  referenceNumber: string | null;
  firstContactDate: string | null;
  desiredOutcome: string | null;
  amountInDispute: number | null;
  interactions: Array<{
    date: string;
    channel: string;
    summary: string;
    promisesMade: string | null;
    promiseFulfilled: boolean | null;
    referenceNumber: string | null;
  }>;
  additionalInstructions?: string;
}): string {
  const senderAddress = [
    context.senderAddressLine1,
    context.senderAddressLine2,
    context.senderCity,
    context.senderPostcode,
  ]
    .filter(Boolean)
    .join("\n");

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const interactionHistory = context.interactions
    .slice(-8)
    .map(
      (i) =>
        `- ${i.date} (${i.channel}): ${i.summary}${
          i.referenceNumber ? ` [Ref: ${i.referenceNumber}]` : ""
        }${
          i.promisesMade
            ? ` [Promised: ${i.promisesMade} — ${i.promiseFulfilled === false ? "NOT FULFILLED" : i.promiseFulfilled === true ? "fulfilled" : "not yet fulfilled"}]`
            : ""
        }`
    )
    .join("\n");

  return `Draft a "${context.letterTypeName}" letter.

Tone: ${context.suggestedTone}
Legal references to include if applicable: ${context.legalReferences.join(", ") || "None specified"}

SENDER (place top-right of letter):
${context.senderName}
${senderAddress || "[Address not provided — leave blank line]"}

TODAY'S DATE: ${today}

RECIPIENT:
${context.organisationName} Complaints Department
${context.complaintEmail ? `Email: ${context.complaintEmail}` : ""}

SUBJECT: Formal Complaint${context.caseTitle ? ` — ${context.caseTitle}` : ""}${context.referenceNumber ? ` (Ref: ${context.referenceNumber})` : ""}

CASE INFORMATION:
- What happened: ${context.caseDescription ?? "Not provided"}
- First contact with organisation: ${context.firstContactDate ?? "Unknown"}
- Desired outcome: ${context.desiredOutcome ?? "Resolution of the complaint"}
- Amount in dispute: ${context.amountInDispute ? `£${context.amountInDispute.toFixed(2)}` : "Not applicable"}
- My reference: ${context.referenceNumber ?? "None"}

INTERACTION HISTORY:
${interactionHistory || "No interactions recorded yet."}

${context.additionalInstructions ? `ADDITIONAL INSTRUCTIONS:\n${context.additionalInstructions}\n` : ""}
Draft the complete letter below. Output ONLY the letter text — no notes, no commentary, no explanations. Start with the sender's address.`;
}
