import { z } from "zod";

export const ORGANISATION_CATEGORIES = [
  "energy",
  "water",
  "broadband_phone",
  "financial_services",
  "insurance",
  "government_hmrc",
  "government_dwp",
  "government_council",
  "nhs",
  "housing",
  "retail",
  "transport",
  "education",
  "employment",
  "other",
] as const;

export const ORGANISATION_CATEGORY_LABELS: Record<
  (typeof ORGANISATION_CATEGORIES)[number],
  string
> = {
  energy: "Energy",
  water: "Water",
  broadband_phone: "Broadband & Phone",
  financial_services: "Financial Services",
  insurance: "Insurance",
  government_hmrc: "Government — HMRC",
  government_dwp: "Government — DWP",
  government_council: "Council",
  nhs: "NHS",
  housing: "Housing",
  retail: "Retail & Services",
  transport: "Transport",
  education: "Education",
  employment: "Employment",
  other: "Other",
};

export const CASE_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const CASE_PRIORITY_LABELS: Record<
  (typeof CASE_PRIORITIES)[number],
  string
> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const INTERACTION_CHANNELS = [
  "phone",
  "email",
  "letter",
  "webchat",
  "in_person",
  "social_media",
  "app",
  "other",
] as const;

export const INTERACTION_CHANNEL_LABELS: Record<
  (typeof INTERACTION_CHANNELS)[number],
  string
> = {
  phone: "Phone",
  email: "Email",
  letter: "Letter",
  webchat: "Webchat",
  in_person: "In Person",
  social_media: "Social Media",
  app: "App",
  other: "Other",
};

export const INTERACTION_OUTCOMES = [
  "resolved",
  "escalated",
  "promised_callback",
  "promised_action",
  "no_resolution",
  "transferred",
  "disconnected",
  "other",
] as const;

export const INTERACTION_OUTCOME_LABELS: Record<
  (typeof INTERACTION_OUTCOMES)[number],
  string
> = {
  resolved: "Resolved",
  escalated: "Escalated",
  promised_callback: "Promised Callback",
  promised_action: "Promised Action",
  no_resolution: "No Resolution",
  transferred: "Transferred",
  disconnected: "Disconnected",
  other: "Other",
};

// Step 1 — Organisation
export const newOrganisationSchema = z.object({
  name: z.string().min(2, "Organisation name must be at least 2 characters"),
  category: z.enum(ORGANISATION_CATEGORIES, {
    error: "Please select a category",
  }),
  website: z.string().optional(),
  complaint_email: z.string().optional(),
  complaint_phone: z.string().optional(),
});

export const organisationStepSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("existing"),
    organisation_id: z.string().min(1, "Please select an organisation"),
    organisation_name: z.string(),
    category: z.enum(ORGANISATION_CATEGORIES),
  }),
  z.object({
    mode: z.literal("new"),
    organisation_id: z.null().optional(),
    organisation_name: z
      .string()
      .min(2, "Organisation name must be at least 2 characters"),
    category: z.enum(ORGANISATION_CATEGORIES, {
      error: "Please select a category",
    }),
    website: z.string().optional(),
    complaint_email: z.string().optional(),
    complaint_phone: z.string().optional(),
  }),
]);

// Step 2 — Case Details
export const caseDetailsSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be 200 characters or fewer"),
  description: z
    .string()
    .min(10, "Please describe the issue (at least 10 characters)"),
  reference_number: z.string().optional(),
  amount_in_dispute: z.string().optional(),
  desired_outcome: z.string().optional(),
  priority: z.enum(CASE_PRIORITIES),
  first_contact_date: z.string().min(1, "Please enter the date of first contact"),
});

// Step 3 — First Interaction (optional)
export const firstInteractionSchema = z.object({
  skip: z.boolean(),
  interaction_date: z.string().optional(),
  channel: z.enum(INTERACTION_CHANNELS).optional(),
  direction: z.enum(["inbound", "outbound"]).optional(),
  summary: z.string().optional(),
  contact_name: z.string().optional(),
  contact_department: z.string().optional(),
  contact_role: z.string().optional(),
  reference_number: z.string().optional(),
  duration_minutes: z.string().optional(),
  promises_made: z.string().optional(),
  promise_deadline: z.string().optional(),
  outcome: z.enum(INTERACTION_OUTCOMES).optional(),
  next_steps: z.string().optional(),
  mood: z.enum(["helpful", "neutral", "unhelpful", "hostile"]).optional(),
});

// Full interaction form schema (used by InteractionModal and interactions/new page)
export const interactionSchema = z.object({
  case_id: z.string().min(1, "Please select a case"),
  interaction_date: z.string().min(1, "Date and time is required"),
  channel: z.enum(INTERACTION_CHANNELS, {
    error: "Please select a channel",
  }),
  direction: z.enum(["inbound", "outbound"] as const, {
    error: "Please select a direction",
  }),
  summary: z
    .string()
    .min(20, "Summary must be at least 20 characters")
    .max(5000),
  contact_name: z.string().optional(),
  contact_department: z.string().optional(),
  contact_role: z.string().optional(),
  reference_number: z.string().optional(),
  duration_minutes: z.string().optional(),
  has_promise: z.boolean(),
  promises_made: z.string().optional(),
  promise_deadline: z.string().optional(),
  outcome: z.enum(INTERACTION_OUTCOMES).optional(),
  next_steps: z.string().optional(),
  mood: z.enum(["helpful", "neutral", "unhelpful", "hostile"] as const).optional(),
});

export type OrganisationStepData = z.infer<typeof organisationStepSchema>;
export type CaseDetailsData = z.infer<typeof caseDetailsSchema>;
export type FirstInteractionData = z.infer<typeof firstInteractionSchema>;
export type InteractionFormData = z.infer<typeof interactionSchema>;
