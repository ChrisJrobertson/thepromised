export type LetterTemplateType =
  | "initial_complaint"
  | "follow_up"
  | "escalation"
  | "final_response_request"
  | "ombudsman_referral"
  | "subject_access_request"
  | "formal_notice"
  | "custom";

export type LetterTemplate = {
  type: LetterTemplateType;
  name: string;
  description: string;
  whenToUse: string;
  requiredFields: string[];
  legalReferences: string[];
  suggestedTone: string;
  icon: string;
};

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    type: "initial_complaint",
    name: "Initial Complaint",
    description: "Your first formal written complaint to the organisation.",
    whenToUse: "Use at the start of the process or when you want to put the complaint in writing for the first time.",
    requiredFields: ["organisation name", "complaint description", "desired outcome"],
    legalReferences: [
      "Consumer Rights Act 2015",
      "Consumer Contracts Regulations 2013",
    ],
    suggestedTone: "Firm but professional",
    icon: "📝",
  },
  {
    type: "follow_up",
    name: "Follow-up — No Response",
    description: "A chaser letter when the organisation has not replied within a reasonable time.",
    whenToUse: "Use if you haven't received a response after 14 days.",
    requiredFields: ["original complaint date", "reference number"],
    legalReferences: [],
    suggestedTone: "Professional and direct",
    icon: "🔔",
  },
  {
    type: "escalation",
    name: "Escalation to Complaints Manager",
    description: "Formally escalates the complaint beyond the initial response.",
    whenToUse: "Use when the front-line response is unsatisfactory and you need to escalate internally.",
    requiredFields: ["original complaint date", "unsatisfactory response details"],
    legalReferences: [],
    suggestedTone: "Firm and procedural",
    icon: "⬆️",
  },
  {
    type: "final_response_request",
    name: "Final Response / Deadlock Letter Request",
    description: "Requests a final response or deadlock letter so you can escalate to the ombudsman.",
    whenToUse: "Use after 8 weeks of no resolution, or when you want to escalate to the ombudsman.",
    requiredFields: ["complaint reference", "date complaint first raised"],
    legalReferences: [
      "Regulatory requirements for final response (varies by sector)",
    ],
    suggestedTone: "Formal and clear",
    icon: "🔒",
  },
  {
    type: "ombudsman_referral",
    name: "Ombudsman Referral Cover Letter",
    description: "A structured summary letter to accompany your ombudsman complaint submission.",
    whenToUse: "Use when you submit your case to an ombudsman or alternative dispute resolution scheme.",
    requiredFields: [
      "full complaint history",
      "what outcome you sought",
      "why the response was unsatisfactory",
    ],
    legalReferences: [],
    suggestedTone: "Structured and factual",
    icon: "🏛️",
  },
  {
    type: "subject_access_request",
    name: "Subject Access Request (GDPR)",
    description: "Formally requests all personal data held by the organisation about you.",
    whenToUse: "Use to obtain call recordings, account notes, internal case records — powerful evidence for complaints.",
    requiredFields: ["your full name", "any account or reference numbers", "date range if relevant"],
    legalReferences: [
      "UK GDPR Article 15 — Right of access by the data subject",
      "Data Protection Act 2018 Section 45",
    ],
    suggestedTone: "Formal and precise",
    icon: "🔍",
  },
  {
    type: "formal_notice",
    name: "Letter Before Action",
    description: "A formal pre-court letter giving the organisation 14 days to resolve the matter or face legal proceedings.",
    whenToUse: "Use as a last resort before filing a small claims court claim. Required before most court claims.",
    requiredFields: [
      "specific amount claimed (if financial)",
      "precise description of breach",
      "legal basis for claim",
    ],
    legalReferences: [
      "Pre-Action Protocol for Debt Claims",
      "Consumer Rights Act 2015",
      "Civil Procedure Rules Practice Directions",
    ],
    suggestedTone: "Firm and legal — unambiguous intent",
    icon: "⚖️",
  },
  {
    type: "custom",
    name: "Custom Letter",
    description: "A bespoke letter drafted by AI based on your case context and additional instructions.",
    whenToUse: "Use when none of the above templates fit, or to write a unique letter for a specific situation.",
    requiredFields: ["description of what the letter needs to achieve"],
    legalReferences: [],
    suggestedTone: "Professional (AI will adapt to your instructions)",
    icon: "✏️",
  },
];

export function getTemplate(type: LetterTemplateType): LetterTemplate | undefined {
  return LETTER_TEMPLATES.find((t) => t.type === type);
}
