export interface PackDefinition {
  id: string;
  name: string;
  slug: string;
  price: number; // pence
  priceDisplay: string;
  description: string;
  includes: string[];
  bestFor: string;
  popular?: boolean;
}

export const COMPLAINT_PACKS: PackDefinition[] = [
  {
    id: "starter-pack",
    name: "Complaint Starter Pack",
    slug: "starter",
    price: 2900, // £29
    priceDisplay: "£29",
    description:
      "Get your complaint off on the right foot with a professionally structured case and initial letter.",
    includes: [
      "Case setup and evidence organisation review",
      "AI-drafted initial complaint letter tailored to your case",
      "Escalation path summary with deadlines",
      "PDF case file ready to send",
    ],
    bestFor: "You know something is wrong but don't know where to start.",
  },
  {
    id: "escalation-pack",
    name: "Escalation Pack",
    slug: "escalation",
    price: 4900, // £49
    priceDisplay: "£49",
    description:
      "For complaints that have stalled. We review your case, draft the right escalation letter, and prepare your ombudsman submission.",
    includes: [
      "Full case review and strength assessment",
      "AI-drafted escalation or final response letter",
      "Ombudsman referral cover letter",
      "Complete case file formatted for ombudsman submission",
      "Deadline and next-steps summary",
    ],
    bestFor: "You've been going back and forth for weeks with no resolution.",
    popular: true,
  },
  {
    id: "full-case-pack",
    name: "Full Case Pack",
    slug: "full-case",
    price: 7900, // £79
    priceDisplay: "£79",
    description:
      "Everything you need to fight your complaint from start to ombudsman. The complete ammunition.",
    includes: [
      "Full case setup, evidence review, and organisation",
      "Up to 3 AI-drafted letters (initial, follow-up, escalation)",
      "Promise tracking analysis with breach timeline",
      "Ombudsman referral letter and submission pack",
      "Full PDF case file with cover page, timeline, promises table, and evidence index",
      '"What Am I Owed?" compensation assessment for your specific case',
      "Priority email support for 30 days",
    ],
    bestFor:
      "You want the strongest possible case file without doing it all yourself.",
  },
];

export const COMPLAINT_PACKS_BY_ID = new Map(
  COMPLAINT_PACKS.map((pack) => [pack.id, pack]),
);
