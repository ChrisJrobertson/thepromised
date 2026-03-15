import type { Case, Organisation } from "@/types/database";

export type CaseWithOrganisation = Case & {
  organisations: Organisation | null;
};

export type CaseStatus = Case["status"];
export type CasePriority = Case["priority"];
