import type { EscalationRule } from "@/types/database";

export type EscalationStage = {
  stage: EscalationRule["stage"];
  stageOrder: number;
  title: string;
  description: string;
  actionRequired: string;
  waitPeriodDays: number | null;
  regulatoryBody: string | null;
  regulatoryUrl: string | null;
  tips: string | null;
};
