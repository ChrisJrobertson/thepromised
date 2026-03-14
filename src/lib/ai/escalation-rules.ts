export const ESCALATION_STAGES = [
  "initial",
  "formal_complaint",
  "final_response",
  "ombudsman",
  "court",
] as const;

export type EscalationStage = (typeof ESCALATION_STAGES)[number];
