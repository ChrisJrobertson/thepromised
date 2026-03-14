import type { Evidence, Interaction } from "@/types/database";

export type InteractionWithEvidence = Interaction & {
  evidence: Evidence[];
};

export type InteractionChannel = Interaction["channel"];
export type InteractionOutcome = Interaction["outcome"];
