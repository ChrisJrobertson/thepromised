export type JourneyActionType =
  | "checklist"
  | "send_letter"
  | "branch"
  | "info"
  | "wait"
  | "escalate"
  | "resolve";

export interface JourneyBranchOption {
  label: string;
  next_step: string;
}

export interface JourneyActionConfig {
  // checklist
  items?: string[];
  tip?: string;

  // send_letter
  letter_type?: string;
  auto_generate?: boolean;
  prompt_context?: string;

  // branch
  question?: string;
  options?: JourneyBranchOption[];

  // info
  compensation_table?: Array<{ distance: string; amount: string }>;
  check_8_week_deadline?: boolean;
  letter_before_action?: boolean;

  // escalate
  export_pdf?: boolean;
  escalation_target?: string;
  escalation_url?: string;
  escalation_method?: string;

  // resolve
  trigger_outcome_form?: boolean;

  // wait
  wait_message?: string;
}

export interface JourneyCompletionCriteria {
  type: "manual" | "letter_sent" | "days_passed";
  letter_type?: string;
  reference?: string;
  days?: number;
}

export interface JourneyStep {
  step_id: string;
  order: number;
  title: string;
  description: string;
  action_type: JourneyActionType;
  action_config: JourneyActionConfig;
  completion_criteria: JourneyCompletionCriteria;
  wait_after_days: number;
  wait_message?: string;
  next_step: string | null;
}

export interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_duration_days: number;
  steps: JourneyStep[];
}

export interface JourneyStepHistoryEntry {
  step_id: string;
  completed_at: string;
  choice?: string;
}

export interface CaseJourney {
  id: string;
  case_id: string;
  user_id: string;
  journey_template_id: string;
  current_step_id: string;
  status: "in_progress" | "completed" | "abandoned";
  step_history: JourneyStepHistoryEntry[];
  started_at: string;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface JourneyWithTemplate {
  journey: CaseJourney;
  template: JourneyTemplate;
  currentStep: JourneyStep | null;
  completedStepIds: Set<string>;
  totalSteps: number;
  completedCount: number;
}
