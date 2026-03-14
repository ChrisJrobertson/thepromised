export type LetterTemplate = {
  type:
    | "initial_complaint"
    | "follow_up"
    | "escalation"
    | "final_response_request"
    | "ombudsman_referral"
    | "subject_access_request"
    | "formal_notice"
    | "custom";
  name: string;
  description: string;
  legalReferences: string[];
  suggestedTone: string;
};

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    type: "initial_complaint",
    name: "Initial Complaint",
    description: "First formal complaint to an organisation.",
    legalReferences: ["Consumer Rights Act 2015"],
    suggestedTone: "Firm and factual",
  },
  {
    type: "follow_up",
    name: "Follow-up",
    description: "Follow-up when no response has been received.",
    legalReferences: [],
    suggestedTone: "Professional and direct",
  },
  {
    type: "escalation",
    name: "Escalation to complaints manager",
    description: "Escalates unresolved complaint to a senior team.",
    legalReferences: [],
    suggestedTone: "Firm and procedural",
  },
  {
    type: "final_response_request",
    name: "Final response / deadlock letter request",
    description: "Requests a final response or deadlock letter.",
    legalReferences: [],
    suggestedTone: "Formal and clear",
  },
  {
    type: "ombudsman_referral",
    name: "Ombudsman referral cover letter",
    description: "Cover note for ombudsman escalation.",
    legalReferences: [],
    suggestedTone: "Structured and factual",
  },
  {
    type: "subject_access_request",
    name: "Subject Access Request (GDPR)",
    description: "Requests personal data under GDPR Article 15.",
    legalReferences: ["GDPR Article 15"],
    suggestedTone: "Formal",
  },
  {
    type: "formal_notice",
    name: "Letter Before Action",
    description: "Pre-court letter before action.",
    legalReferences: [],
    suggestedTone: "Firm and legal",
  },
  {
    type: "custom",
    name: "Custom letter",
    description: "A custom draft based on case context.",
    legalReferences: [],
    suggestedTone: "Professional",
  },
];
