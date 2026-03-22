import { DISSOLVED_COMPANY_JOURNEY } from "./journey-dissolved-company";

export type JourneyStepType =
  | "info"
  | "checklist"
  | "branch"
  | "action_log_interaction"
  | "action_draft_letter"
  | "action_send_letter"
  | "action_escalate"
  | "decision"
  | "wait"
  | "complete";

export type JourneyStep = {
  id: string;
  title: string;
  description: string;
  type: JourneyStepType;
  action_config?: {
    letter_type?: string;
    prompt_context?: string;
    interaction_channel?: string;
    escalation_stage?: string;
    wait_days?: number;
    wait_message?: string;
    decision_yes_label?: string;
    decision_no_label?: string;
    decision_yes_next?: string;
    decision_no_next?: string;
    /** Multi-option branch (replaces linear next_step_id for that step). */
    branch_question?: string;
    branch_options?: { label: string; next_step_id: string }[];
    checklist_items?: string[];
    checklist_tip?: string;
    /** On final step: show link to record case outcome. */
    suggest_outcome_link?: boolean;
    letter_before_action?: boolean;
  };
  tips?: string[];
  legal_basis?: string;
  next_step_id?: string;
};

export type JourneyTemplate = {
  id: string;
  category: string;
  title: string;
  description: string;
  sector: string;
  steps: JourneyStep[];
  is_active: boolean;
};

export const JOURNEY_TEMPLATES: JourneyTemplate[] = [
  // ── Energy Billing ─────────────────────────────────────────────────────────
  {
    id: "energy-billing",
    category: "energy_billing",
    title: "Energy Billing Dispute",
    description:
      "Your energy supplier overcharged you, sent estimated bills, raised your direct debit without notice, or billed you for energy you didn't use.",
    sector: "energy",
    is_active: true,
    steps: [
      {
        id: "log-initial-contact",
        title: "Log your first attempt to resolve this",
        description:
          "Before we draft letters, record what's happened so far — phone calls, webchat, or anything else. This builds your evidence trail.",
        type: "action_log_interaction",
        action_config: { interaction_channel: "phone" },
        tips: [
          "Note the date, time, who you spoke to, and what they said.",
          "If they made a promise (e.g. 'we'll refund by Friday'), log that separately as a Promise.",
        ],
        next_step_id: "draft-initial-complaint",
      },
      {
        id: "draft-initial-complaint",
        title: "Send a formal complaint letter",
        description:
          "A formal written complaint starts the 8-week clock. After 8 weeks (or a deadlock letter), you can go to the Energy Ombudsman.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "initial_complaint",
          prompt_context: "energy_billing_initial",
        },
        legal_basis:
          "Energy suppliers have Standard Licence Conditions (SLC 27, SLC 31) requiring accurate billing. Ofgem's back-billing rule caps claims to 12 months.",
        tips: [
          "State the exact amount in dispute and the billing period.",
          "Keep a copy and note when you sent it.",
        ],
        next_step_id: "wait-response",
      },
      {
        id: "wait-response",
        title: "Wait up to 8 weeks for a response",
        description:
          "Energy suppliers must respond to formal complaints within 8 weeks. Set a reminder — we'll alert you when the deadline approaches.",
        type: "wait",
        action_config: { wait_days: 56 },
        tips: [
          "If they respond and resolve the issue — mark the case resolved.",
          "If they respond unsatisfactorily or not at all — move to the follow-up.",
        ],
        next_step_id: "response-received",
      },
      {
        id: "response-received",
        title: "Did the supplier resolve your complaint?",
        description:
          "Check whether you're satisfied with the response you received.",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — fully resolved",
          decision_no_label: "No — unresolved or unsatisfactory response",
          decision_yes_next: "resolved",
          decision_no_next: "draft-followup",
        },
        next_step_id: "draft-followup",
      },
      {
        id: "draft-followup",
        title: "Send a follow-up escalation letter",
        description:
          "If the supplier hasn't resolved it or gave an unsatisfactory response, this letter puts them on notice that you'll escalate to the Ombudsman.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "escalation",
          prompt_context: "energy_billing_followup",
        },
        tips: ["Reference your original complaint date.", "Give them 14 days to respond."],
        next_step_id: "decide-ombudsman",
      },
      {
        id: "decide-ombudsman",
        title: "Has it been 8 weeks since your formal complaint?",
        description:
          "You can refer to the Energy Ombudsman after 8 weeks (or if you received a deadlock letter).",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — 8 weeks have passed (or I have a deadlock letter)",
          decision_no_label: "No — still waiting",
          decision_yes_next: "draft-ombudsman",
          decision_no_next: "wait-final",
        },
        next_step_id: "draft-ombudsman",
      },
      {
        id: "wait-final",
        title: "Wait for the 8-week deadline",
        description: "Continue logging interactions. Come back when the 8 weeks are up.",
        type: "wait",
        action_config: { wait_days: 14 },
        next_step_id: "draft-ombudsman",
      },
      {
        id: "draft-ombudsman",
        title: "Refer to the Energy Ombudsman",
        description:
          "The Energy Ombudsman is free to use and their decisions are binding on suppliers. They can award up to £10,000.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "ombudsman_referral",
          prompt_context: "energy_billing_ombudsman",
        },
        legal_basis:
          "The Energy Ombudsman operates under the Gas and Electricity (Consumer Complaints Handling Standards) Regulations 2008.",
        tips: [
          "You'll also need to submit a form at ombudsman-services.org/energy.",
          "This letter will be submitted alongside your form as supporting evidence.",
          "Export your case file as PDF — it's the perfect evidence pack.",
        ],
        next_step_id: "escalated",
      },
      {
        id: "escalated",
        title: "Escalation submitted — track the outcome",
        description:
          "Log the Ombudsman reference number as an interaction. We'll remind you to chase if you don't hear back within the typical 8–12 week window.",
        type: "action_log_interaction",
        action_config: { interaction_channel: "email" },
        next_step_id: "resolved",
      },
      {
        id: "resolved",
        title: "Mark your case as resolved",
        description:
          "Record the outcome — whether you got a full refund, partial resolution, or compensation. This data helps other consumers.",
        type: "complete",
      },
    ],
  },

  // ── Broadband Speed ────────────────────────────────────────────────────────
  {
    id: "broadband-speed",
    category: "broadband_speed",
    title: "Broadband Speed Below Guarantee",
    description:
      "Your broadband speeds are consistently below the minimum guaranteed speed in your contract, and your provider hasn't fixed the problem.",
    sector: "telecoms",
    is_active: true,
    steps: [
      {
        id: "log-speed-tests",
        title: "Log your speed test evidence",
        description:
          "Run speed tests at multiple times of day using Ofcom's checker or your provider's tool. Log the results here.",
        type: "action_log_interaction",
        action_config: { interaction_channel: "other" },
        tips: [
          "Use the Ofcom broadband speed checker at checker.ofcom.org.uk.",
          "Test at least 3 times per day for a week.",
          "Note the guaranteed minimum speed from your contract.",
        ],
        next_step_id: "draft-initial-complaint",
      },
      {
        id: "draft-initial-complaint",
        title: "Send a formal complaint",
        description:
          "This triggers Ofcom's Voluntary Code process. Your provider must resolve this or you can exit your contract penalty-free.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "initial_complaint",
          prompt_context: "broadband_speed_initial",
        },
        legal_basis:
          "Consumer Rights Act 2015 s.49 (service with reasonable care and skill). Ofcom Voluntary Code of Practice on Broadband Speeds (if the provider is a signatory).",
        tips: ["State the guaranteed minimum speed from your contract.", "Attach the speed test evidence."],
        next_step_id: "wait-response",
      },
      {
        id: "wait-response",
        title: "Wait for your provider to respond",
        description:
          "Under the Ofcom code, providers have a specific timeframe to investigate and repair or allow you to exit.",
        type: "wait",
        action_config: { wait_days: 30 },
        next_step_id: "response-check",
      },
      {
        id: "response-check",
        title: "Was the issue resolved?",
        description: "Did your provider fix the speeds, or offer a penalty-free exit?",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — resolved or I've exited the contract",
          decision_no_label: "No — still below guaranteed speed",
          decision_yes_next: "resolved",
          decision_no_next: "draft-followup",
        },
        next_step_id: "draft-followup",
      },
      {
        id: "draft-followup",
        title: "Escalate with a follow-up letter",
        description:
          "If the issue isn't fixed, escalate. You now have a strong basis to demand a penalty-free exit or ADR referral.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "escalation",
          prompt_context: "broadband_speed_followup",
        },
        tips: ["Run fresh speed tests to include updated evidence."],
        next_step_id: "draft-adr",
      },
      {
        id: "draft-adr",
        title: "Refer to Alternative Dispute Resolution",
        description:
          "After 8 weeks (or a deadlock letter) you can go to CISAS or Ombudsman Services: Communications — both are free.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "adr_referral",
          prompt_context: "broadband_speed_adr",
        },
        legal_basis: "Communications Act 2003; Ofcom Dispute Resolution guidance.",
        tips: [
          "Export your case PDF — it's ready to submit to ADR.",
          "CISAS handles most major providers. Check your provider's ADR scheme.",
        ],
        next_step_id: "resolved",
      },
      {
        id: "resolved",
        title: "Record the outcome",
        description: "Log what happened — exit, refund, speed upgrade, or ADR decision.",
        type: "complete",
      },
    ],
  },

  // ── Flight Delay ───────────────────────────────────────────────────────────
  {
    id: "flight-delay",
    category: "flight_delay",
    title: "Flight Delay / Cancellation Compensation",
    description:
      "Your flight was delayed by 3+ hours or cancelled and you want to claim compensation under UK261 (formerly EU261).",
    sector: "travel",
    is_active: true,
    steps: [
      {
        id: "log-flight-details",
        title: "Log your flight details",
        description:
          "Record the flight number, route, booked times, actual arrival time, and the reason the airline gave for the delay.",
        type: "action_log_interaction",
        action_config: { interaction_channel: "email" },
        tips: [
          "A delay entitles you to compensation only if the delay on arrival was 3 hours or more.",
          "Extraordinary circumstances (genuine severe weather, air traffic control strikes) can exempt the airline.",
          "Technical faults are NOT extraordinary circumstances (Huzar v Jet2, 2014).",
        ],
        next_step_id: "draft-initial-complaint",
      },
      {
        id: "draft-initial-complaint",
        title: "Submit your compensation claim",
        description: "A formal claim letter citing UK261 gives the airline 14 days to respond.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "initial_complaint",
          prompt_context: "flight_delay_initial",
        },
        legal_basis:
          "UK Regulation EC 261/2004 (as retained by the Air Passenger Rights and Air Travel Organisers' Licensing (Amendment) (EU Exit) Regulations 2019). Compensation: under 1,500km = £220; 1,500–3,500km = £350; over 3,500km = £520.",
        tips: ["Include your flight booking reference.", "Calculate the correct compensation band."],
        next_step_id: "wait-response",
      },
      {
        id: "wait-response",
        title: "Wait for the airline to respond",
        description: "Airlines typically respond within 14–28 days. Most try to refuse or offer vouchers first.",
        type: "wait",
        action_config: { wait_days: 28 },
        next_step_id: "response-check",
      },
      {
        id: "response-check",
        title: "What did the airline say?",
        description: "How did the airline respond to your claim?",
        type: "decision",
        action_config: {
          decision_yes_label: "They paid the full amount in cash",
          decision_no_label: "Refused, offered vouchers, or cited extraordinary circumstances",
          decision_yes_next: "resolved",
          decision_no_next: "draft-followup",
        },
        next_step_id: "draft-followup",
      },
      {
        id: "draft-followup",
        title: "Challenge the airline's refusal",
        description:
          "Most airline refusals are incorrect. This letter challenges their reasons, particularly false 'extraordinary circumstances' claims.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "follow_up",
          prompt_context: "flight_delay_followup",
        },
        tips: [
          "If they offered vouchers, state clearly you're entitled to cash under UK261.",
          "If they cited technical fault as extraordinary circumstances, this is wrong — cite Huzar v Jet2 [2014].",
        ],
        next_step_id: "draft-adr",
      },
      {
        id: "draft-adr",
        title: "Refer to ADR or MCOL",
        description:
          "After 8 weeks you can go to AviationADR (free) or issue a claim at Money Claim Online (MCOL). MCOL has a strong success rate for valid UK261 claims.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "adr_referral",
          prompt_context: "flight_delay_adr",
        },
        tips: [
          "AviationADR is free at www.aviationadr.org.uk.",
          "MCOL filing fee is £35 for claims under £300 — often recoverable.",
        ],
        next_step_id: "resolved",
      },
      {
        id: "resolved",
        title: "Record the outcome",
        description: "Log whether you received compensation and how much.",
        type: "complete",
      },
    ],
  },

  // ── Bank Charges ───────────────────────────────────────────────────────────
  {
    id: "bank-charges",
    category: "bank_charges",
    title: "Unfair Bank Charges",
    description:
      "Your bank charged fees you believe are unfair, incorrect, or unlawful — including overdraft fees, error charges, or charges for services not properly explained.",
    sector: "finance",
    is_active: true,
    steps: [
      {
        id: "log-charges",
        title: "Log the charges you're disputing",
        description:
          "List each charge — date, amount, description. Calculate the total. This is the foundation of your complaint.",
        type: "action_log_interaction",
        action_config: { interaction_channel: "other" },
        tips: [
          "Download your bank statements for the relevant period.",
          "Since April 2020, banks can only charge a simple annual interest rate for unarranged overdrafts — fixed fees are banned.",
        ],
        next_step_id: "draft-initial-complaint",
      },
      {
        id: "draft-initial-complaint",
        title: "Submit your formal complaint",
        description: "A formal complaint starts the FCA 8-week clock. Banks must issue a final response within 8 weeks.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "initial_complaint",
          prompt_context: "bank_charges_initial",
        },
        legal_basis:
          "FCA overdraft pricing rules (effective April 2020). Consumer Rights Act 2015 (unfair contract terms). Payment Services Regulations 2017.",
        tips: ["State the total amount you're claiming.", "Send via recorded delivery if by post."],
        next_step_id: "wait-response",
      },
      {
        id: "wait-response",
        title: "Wait up to 8 weeks for a final response",
        description:
          "Banks must acknowledge within 5 business days and issue a final response within 8 weeks.",
        type: "wait",
        action_config: { wait_days: 56 },
        next_step_id: "response-check",
      },
      {
        id: "response-check",
        title: "Did the bank resolve your complaint?",
        description: "What did they offer?",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — full refund or satisfactory offer",
          decision_no_label: "No — rejected or partial offer",
          decision_yes_next: "resolved",
          decision_no_next: "draft-followup",
        },
        next_step_id: "draft-followup",
      },
      {
        id: "draft-followup",
        title: "Follow-up with FOS warning",
        description: "Put the bank on notice you'll escalate to the Financial Ombudsman Service.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "escalation",
          prompt_context: "bank_charges_followup",
        },
        next_step_id: "draft-fos",
      },
      {
        id: "draft-fos",
        title: "Refer to the Financial Ombudsman Service",
        description:
          "The FOS is free and handles millions of banking complaints. They can award up to £415,000. You have 6 months from the bank's final response letter.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "ombudsman_referral",
          prompt_context: "bank_charges_fos",
        },
        legal_basis:
          "Financial Services and Markets Act 2000 (FSMA) gives the FOS compulsory jurisdiction. Banks must cooperate and are bound by FOS decisions.",
        tips: [
          "You can also submit online at financial-ombudsman.org.uk.",
          "Export your case PDF — it's the evidence pack for your FOS submission.",
          "You have 6 months from the date of the bank's final response letter.",
        ],
        next_step_id: "resolved",
      },
      {
        id: "resolved",
        title: "Record the outcome",
        description: "Log the FOS decision or settlement details.",
        type: "complete",
      },
    ],
  },

  // ── Faulty Product ─────────────────────────────────────────────────────────
  {
    id: "faulty-product",
    category: "faulty_product",
    title: "Faulty Product — Return or Repair",
    description:
      "You bought a product that was faulty, broke quickly, or doesn't work as described. The retailer won't give you a refund or fix it.",
    sector: "retail",
    is_active: true,
    steps: [
      {
        id: "within-30-days",
        title: "Is the product less than 30 days old?",
        description:
          "The law gives you different rights depending on when you discovered the fault.",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — less than 30 days since purchase",
          decision_no_label: "No — more than 30 days since purchase",
          decision_yes_next: "draft-short-term-reject",
          decision_no_next: "draft-repair-request",
        },
        next_step_id: "draft-short-term-reject",
      },
      {
        id: "draft-short-term-reject",
        title: "Exercise your short-term right to reject",
        description:
          "Within 30 days you have an absolute right to a full refund. The retailer cannot offer a repair instead.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "initial_complaint",
          prompt_context: "faulty_product_reject",
        },
        legal_basis:
          "Consumer Rights Act 2015, section 22 — the short-term right to reject goods that are not of satisfactory quality, fit for purpose, or as described.",
        tips: [
          "The 30 days is from the date of purchase (or delivery).",
          "You get a full refund — no deduction for use.",
          "The retailer cannot insist on a repair first. That right ends at 30 days.",
        ],
        next_step_id: "repair-response-check",
      },
      {
        id: "draft-repair-request",
        title: "Request a repair or replacement",
        description:
          "After 30 days the retailer can offer a repair or replacement first. But they must act within a reasonable time.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "initial_complaint",
          prompt_context: "faulty_product_repair",
        },
        legal_basis:
          "Consumer Rights Act 2015, sections 23–24. Within the first 6 months, the burden is on the retailer to show the goods were not faulty at delivery.",
        tips: [
          "Request a repair or replacement within a reasonable time (14–28 days is reasonable).",
          "Keep records of any inconvenience the fault caused.",
        ],
        next_step_id: "repair-response-check",
      },
      {
        id: "repair-response-check",
        title: "Did the retailer resolve it?",
        description: "Did you get a refund, or was the repair/replacement successful?",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — fully resolved",
          decision_no_label: "No — refused, or repair failed",
          decision_yes_next: "resolved",
          decision_no_next: "paid-by-card",
        },
        next_step_id: "paid-by-card",
      },
      {
        id: "paid-by-card",
        title: "Did you pay by credit card (not debit card)?",
        description: "Section 75 of the Consumer Credit Act gives you powerful rights if you paid by credit card.",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — paid by credit card (not debit)",
          decision_no_label: "No — paid by debit card, cash, or other",
          decision_yes_next: "draft-s75",
          decision_no_next: "draft-lba",
        },
        next_step_id: "draft-s75",
      },
      {
        id: "draft-s75",
        title: "Make a Section 75 claim to your credit card provider",
        description:
          "Your credit card provider is jointly and severally liable for the retailer's breach. This is often faster and more reliable than pursuing the retailer.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "section_75_claim",
          prompt_context: "faulty_product_section75",
        },
        legal_basis:
          "Consumer Credit Act 1974, section 75. Applies to purchases of £100–£30,000. The card provider is equally liable as the retailer.",
        tips: [
          "This applies to credit cards only, not debit cards.",
          "Purchase must be over £100.",
          "If rejected, refer to the FOS.",
        ],
        next_step_id: "s75-response-check",
      },
      {
        id: "s75-response-check",
        title: "Did your credit card provider uphold the claim?",
        description: "What did the card provider say?",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — refund processed",
          decision_no_label: "No — claim rejected",
          decision_yes_next: "resolved",
          decision_no_next: "draft-fos-s75",
        },
        next_step_id: "draft-fos-s75",
      },
      {
        id: "draft-fos-s75",
        title: "Refer to the Financial Ombudsman",
        description: "If your credit card provider rejected a valid Section 75 claim, the FOS can intervene.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "ombudsman_referral",
          prompt_context: "faulty_product_fos_s75",
        },
        next_step_id: "resolved",
      },
      {
        id: "draft-lba",
        title: "Send a Letter Before Action",
        description:
          "A formal letter before court proceedings gives the retailer one last chance to settle. This is required before filing at the County Court.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "letter_before_action",
          prompt_context: "faulty_product_lba",
        },
        legal_basis:
          "Pre-Action Protocol for Debt Claims; Civil Procedure Rules Practice Directions. Filing at MCOL costs £35–£70 depending on claim amount.",
        tips: [
          "Give 14 days to respond.",
          "Export your case PDF as your evidence bundle.",
          "Small Claims Court (up to £10,000) does not require a solicitor.",
        ],
        next_step_id: "resolved",
      },
      {
        id: "resolved",
        title: "Record the outcome",
        description: "Log the resolution — refund amount, repair success, or court outcome.",
        type: "complete",
      },
    ],
  },
  DISSOLVED_COMPANY_JOURNEY as unknown as JourneyTemplate,
];

export function getJourneyTemplate(id: string): JourneyTemplate | undefined {
  return JOURNEY_TEMPLATES.find((t) => t.id === id);
}

export function getJourneyTemplatesBySector(sector: string): JourneyTemplate[] {
  return JOURNEY_TEMPLATES.filter((t) => t.is_active && t.sector === sector);
}

export const JOURNEY_SECTORS = [
  { id: "energy", label: "Energy", icon: "⚡" },
  { id: "telecoms", label: "Telecoms & Broadband", icon: "📡" },
  { id: "travel", label: "Travel & Airlines", icon: "✈️" },
  { id: "finance", label: "Banking & Finance", icon: "🏦" },
  { id: "retail", label: "Retail & Products", icon: "🛍️" },
  {
    id: "fraud",
    label: "Fraud & Dissolved Companies",
    description:
      "For situations where a company has been dissolved, is trading fraudulently, or has ceased to exist while owing you money or services.",
    icon: "🛡️",
  },
];
