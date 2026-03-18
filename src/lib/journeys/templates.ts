export type JourneyStepType =
  | "info"
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
    decision_yes_label?: string;
    decision_no_label?: string;
    decision_yes_next?: string;
    decision_no_next?: string;
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
  // ── Landlord Deposit Dispute ────────────────────────────────────────────
  {
    id: "landlord-deposit-dispute",
    category: "landlord_deposit",
    title: "Landlord Deposit Dispute",
    description:
      "Your landlord hasn't returned your deposit within the legal timeframe, or has made unfair deductions. You want your money back.",
    sector: "housing",
    is_active: true,
    steps: [
      {
        id: "document-issue",
        title: "Document the issue",
        description:
          "Gather your evidence: check-in/check-out inventory, tenancy agreement, photos of the property condition, and any correspondence with your landlord.",
        type: "action_log_interaction",
        action_config: { interaction_channel: "other" },
        tips: [
          "Take dated photos of the property condition when you move out.",
          "Get a copy of the check-in and check-out inventory reports.",
          "Check which deposit scheme holds your deposit (TDS, DPS, or MyDeposits).",
          "Confirm your landlord protected the deposit within 30 days of receiving it.",
        ],
        next_step_id: "draft-deposit-demand",
      },
      {
        id: "draft-deposit-demand",
        title: "Write to your landlord requesting deposit return",
        description:
          "Send a formal letter demanding the return of your deposit within 14 days. If the deposit wasn't protected, you may be entitled to 1x–3x the deposit as compensation.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "initial_complaint",
          prompt_context: "landlord_deposit_demand",
        },
        legal_basis:
          "Housing Act 2004 ss.213–215 requires deposits to be protected in a government-approved scheme within 30 days. Failure to protect entitles the tenant to 1x–3x the deposit amount.",
        tips: [
          "Give 14 days to respond.",
          "State clearly whether the deposit was protected or not.",
          "If unprotected, mention the 1x–3x penalty claim.",
        ],
        next_step_id: "wait-landlord-response",
      },
      {
        id: "wait-landlord-response",
        title: "Wait for your landlord to respond",
        description:
          "Give the landlord 14 days to respond to your deposit demand letter.",
        type: "wait",
        action_config: { wait_days: 14 },
        next_step_id: "landlord-response-check",
      },
      {
        id: "landlord-response-check",
        title: "Did your landlord return the deposit?",
        description: "Check whether your landlord has returned the deposit in full.",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — deposit returned in full",
          decision_no_label: "No — refused or unfair deductions",
          decision_yes_next: "resolved",
          decision_no_next: "contact-deposit-scheme",
        },
        next_step_id: "contact-deposit-scheme",
      },
      {
        id: "contact-deposit-scheme",
        title: "Contact the deposit protection scheme",
        description:
          "Raise a dispute through the deposit protection scheme (TDS, DPS, or MyDeposits). Their free ADR service can resolve the dispute without court.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "adr_referral",
          prompt_context: "landlord_deposit_adr",
        },
        legal_basis:
          "All three government-approved schemes offer free Alternative Dispute Resolution (ADR). Both parties must agree to be bound by the adjudicator's decision.",
        tips: [
          "You can raise a dispute directly through the scheme's website.",
          "Submit your evidence pack: inventory, photos, tenancy agreement.",
          "The adjudicator's decision is binding on both parties.",
        ],
        next_step_id: "adr-response-check",
      },
      {
        id: "adr-response-check",
        title: "Was the ADR outcome satisfactory?",
        description: "Did the deposit scheme's ADR resolve the dispute fairly?",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — fair outcome",
          decision_no_label: "No — landlord refused ADR or unfair outcome",
          decision_yes_next: "resolved",
          decision_no_next: "draft-tribunal",
        },
        next_step_id: "draft-tribunal",
      },
      {
        id: "draft-tribunal",
        title: "Apply to the First-tier Tribunal",
        description:
          "If ADR fails or the landlord won't engage, apply to the First-tier Tribunal (Property Chamber). This is free and handles deposit disputes, including the 1x–3x penalty for unprotected deposits.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "court_claim",
          prompt_context: "landlord_deposit_demand",
        },
        legal_basis:
          "First-tier Tribunal (Property Chamber) has jurisdiction over deposit protection disputes under Housing Act 2004 ss.213–215. Claims for non-protection penalties must be made within 6 years.",
        tips: [
          "Export your case PDF — it's your evidence bundle for the tribunal.",
          "The tribunal is informal and you don't need a solicitor.",
          "The tribunal can award 1x–3x the deposit if it wasn't protected.",
        ],
        next_step_id: "resolved",
      },
      {
        id: "resolved",
        title: "Record the outcome",
        description: "Log the resolution — deposit returned, ADR award, or tribunal decision.",
        type: "complete",
      },
    ],
  },

  // ── Parking PCN Appeal ──────────────────────────────────────────────────
  {
    id: "parking-pcn-appeal",
    category: "parking_pcn_appeal",
    title: "Parking PCN Appeal",
    description:
      "You received a private parking charge notice (PCN) that you believe is unfair — unclear signage, mitigating circumstances, or keeper liability issues.",
    sector: "parking",
    is_active: true,
    steps: [
      {
        id: "gather-evidence",
        title: "Gather your evidence",
        description:
          "Photograph the signage, your ticket, the parking location, and any mitigating factors. Check if the operator is a BPA or IPC member.",
        type: "action_log_interaction",
        action_config: { interaction_channel: "other" },
        tips: [
          "Take photos of ALL signage at the car park — including any that's faded, obscured, or missing.",
          "Note whether the operator is a BPA member (appeals go to POPLA) or IPC member (appeals go to IAS).",
          "Check the PCN was issued within 14 days (required by PoFA 2012 for keeper liability).",
          "Don't ignore the PCN — appeal within 28 days.",
        ],
        next_step_id: "draft-operator-appeal",
      },
      {
        id: "draft-operator-appeal",
        title: "Appeal to the parking operator",
        description:
          "Submit a formal appeal to the operator within 28 days of the PCN. Most operators must follow the BPA or IPC Code of Practice.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "initial_complaint",
          prompt_context: "parking_pcn_operator_appeal",
        },
        legal_basis:
          "Protection of Freedoms Act 2012 (PoFA) Schedule 4 governs private parking charges. The parking operator must comply with their trade association's Code of Practice (BPA or IPC).",
        tips: [
          "Appeal within 28 days to preserve your right to POPLA/IAS.",
          "Common grounds: inadequate signage, no grace period, mitigating circumstances.",
          "Many operators accept appeals to avoid POPLA/IAS costs.",
        ],
        next_step_id: "wait-operator-response",
      },
      {
        id: "wait-operator-response",
        title: "Wait for the operator's response",
        description:
          "The operator should respond within 28 days. If they reject your appeal, they must issue a POPLA/IAS code so you can appeal independently.",
        type: "wait",
        action_config: { wait_days: 28 },
        next_step_id: "operator-response-check",
      },
      {
        id: "operator-response-check",
        title: "Did the operator cancel the charge?",
        description: "What did the parking operator say?",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — charge cancelled",
          decision_no_label: "No — appeal rejected",
          decision_yes_next: "resolved",
          decision_no_next: "draft-independent-appeal",
        },
        next_step_id: "draft-independent-appeal",
      },
      {
        id: "draft-independent-appeal",
        title: "Appeal to POPLA or IAS",
        description:
          "Submit an independent appeal to POPLA (BPA members) or IAS (IPC members). Their decision is binding on the operator but not on you.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "adr_referral",
          prompt_context: "parking_pcn_popla_appeal",
        },
        legal_basis:
          "POPLA (Parking on Private Land Appeals) and IAS (Independent Appeals Service) are the two independent appeal services. Their decisions bind the operator but not the motorist.",
        tips: [
          "You have 28 days from the operator's rejection to appeal to POPLA/IAS.",
          "Upload all evidence: photos, PCN, correspondence.",
          "If POPLA/IAS upholds your appeal, the charge is cancelled.",
        ],
        next_step_id: "independent-response-check",
      },
      {
        id: "independent-response-check",
        title: "Was the independent appeal successful?",
        description: "Did POPLA or IAS uphold your appeal?",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — charge cancelled",
          decision_no_label: "No — appeal rejected",
          decision_yes_next: "resolved",
          decision_no_next: "draft-court-defence",
        },
        next_step_id: "draft-court-defence",
      },
      {
        id: "draft-court-defence",
        title: "Prepare your court defence",
        description:
          "If the operator pursues the charge through the County Court, prepare your defence. Many operators don't follow through — but if they do, you need to respond within 14 days of the claim.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "court_defence",
          prompt_context: "parking_pcn_court_defence",
        },
        legal_basis:
          "Private parking charges are contractual, not criminal. The operator must prove: adequate signage, a genuine pre-estimate of loss, and compliance with PoFA 2012. Beavis v ParkingEye [2015] UKSC 67 sets the key precedent.",
        tips: [
          "Many operators don't follow through with court action.",
          "If they do, you have 14 days to file a defence.",
          "Export your case PDF as your evidence bundle.",
          "Small Claims Court — no solicitor needed.",
        ],
        next_step_id: "resolved",
      },
      {
        id: "resolved",
        title: "Record the outcome",
        description: "Log the resolution — charge cancelled, appeal outcome, or court result.",
        type: "complete",
      },
    ],
  },

  // ── Faulty Product Return (Retail) ──────────────────────────────────────
  {
    id: "faulty-product-return",
    category: "retail_product",
    title: "Faulty Product Return — Retail & Online Shopping",
    description:
      "You bought a product online or in-store that was faulty, not as described, or never delivered. The retailer won't give you a proper resolution.",
    sector: "retail_shopping",
    is_active: true,
    steps: [
      {
        id: "document-fault",
        title: "Document the fault",
        description:
          "Gather your evidence: order confirmation, receipt, photos of the fault, and any correspondence with the retailer so far.",
        type: "action_log_interaction",
        action_config: { interaction_channel: "other" },
        tips: [
          "Take clear photos of the fault from multiple angles.",
          "Save your order confirmation email and delivery notification.",
          "Note the purchase date — your rights depend on how long ago you bought it.",
          "Check whether you paid by credit card (Section 75 may apply).",
        ],
        next_step_id: "within-30-days-check",
      },
      {
        id: "within-30-days-check",
        title: "Is the product less than 30 days old?",
        description:
          "Your rights depend on when you discovered the fault relative to the purchase date.",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — less than 30 days since purchase",
          decision_no_label: "No — more than 30 days since purchase",
          decision_yes_next: "draft-reject-letter",
          decision_no_next: "draft-repair-letter",
        },
        next_step_id: "draft-reject-letter",
      },
      {
        id: "draft-reject-letter",
        title: "Exercise your short-term right to reject",
        description:
          "Within 30 days, you have an absolute right to a full refund. The retailer cannot insist on a repair.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "initial_complaint",
          prompt_context: "retail_product_reject",
        },
        legal_basis:
          "Consumer Rights Act 2015, section 22 — the short-term right to reject goods. Full refund, no deduction for use.",
        tips: [
          "State clearly you are rejecting the goods under CRA 2015 s.22.",
          "The retailer must refund you within 14 days.",
          "They cannot insist on a repair during the 30-day window.",
        ],
        next_step_id: "retailer-response-check",
      },
      {
        id: "draft-repair-letter",
        title: "Request a repair or replacement",
        description:
          "After 30 days, the retailer can offer one repair attempt. If the repair fails, you get a price reduction or final right to reject.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "initial_complaint",
          prompt_context: "retail_product_repair",
        },
        legal_basis:
          "Consumer Rights Act 2015, sections 23–24. Within the first 6 months, the burden of proof is on the retailer to show the goods were not faulty at delivery.",
        tips: [
          "Give the retailer a reasonable timeframe for repair (14–28 days).",
          "If the first repair fails, you can demand a refund.",
          "Within 6 months, the fault is presumed to have existed at delivery.",
        ],
        next_step_id: "retailer-response-check",
      },
      {
        id: "retailer-response-check",
        title: "Did the retailer resolve it?",
        description: "Did you get a satisfactory refund, repair, or replacement?",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — fully resolved",
          decision_no_label: "No — refused or unsatisfactory",
          decision_yes_next: "resolved",
          decision_no_next: "paid-by-credit-card",
        },
        next_step_id: "paid-by-credit-card",
      },
      {
        id: "paid-by-credit-card",
        title: "Did you pay by credit card?",
        description:
          "If you paid by credit card and the purchase was between £100 and £30,000, your card provider is jointly liable under Section 75.",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — paid by credit card (not debit)",
          decision_no_label: "No — debit card, cash, or other method",
          decision_yes_next: "draft-section75",
          decision_no_next: "draft-lba",
        },
        next_step_id: "draft-section75",
      },
      {
        id: "draft-section75",
        title: "Make a Section 75 claim",
        description:
          "Your credit card provider is jointly liable with the retailer. This is often faster and more reliable than pursuing the retailer directly.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "section_75_claim",
          prompt_context: "retail_product_section75",
        },
        legal_basis:
          "Consumer Credit Act 1974, section 75. The credit card provider has equal liability with the retailer for purchases between £100 and £30,000.",
        tips: [
          "This applies to credit cards only, not debit cards.",
          "The purchase must be over £100.",
          "If the card provider rejects your claim, refer to the FOS.",
        ],
        next_step_id: "s75-check",
      },
      {
        id: "s75-check",
        title: "Did the card provider uphold your claim?",
        description: "What did your credit card provider say?",
        type: "decision",
        action_config: {
          decision_yes_label: "Yes — refund processed",
          decision_no_label: "No — claim rejected",
          decision_yes_next: "resolved",
          decision_no_next: "draft-fos",
        },
        next_step_id: "draft-fos",
      },
      {
        id: "draft-fos",
        title: "Refer to the Financial Ombudsman",
        description:
          "If your Section 75 claim was rejected, the Financial Ombudsman Service can investigate for free.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "ombudsman_referral",
          prompt_context: "retail_product_fos",
        },
        legal_basis:
          "The FOS has compulsory jurisdiction over credit card providers. They can award up to £415,000.",
        next_step_id: "resolved",
      },
      {
        id: "draft-lba",
        title: "Send a Letter Before Action",
        description:
          "A formal pre-action letter gives the retailer one final chance to settle before you issue a County Court claim.",
        type: "action_draft_letter",
        action_config: {
          letter_type: "letter_before_action",
          prompt_context: "retail_product_lba",
        },
        legal_basis:
          "Pre-Action Protocol for Debt Claims requires a letter before issuing court proceedings. Small Claims Court handles claims up to £10,000 without needing a solicitor.",
        tips: [
          "Give 14 days to respond.",
          "Export your case PDF as your evidence bundle.",
          "MCOL (Money Claim Online) filing fee is £35–£70 depending on amount.",
        ],
        next_step_id: "resolved",
      },
      {
        id: "resolved",
        title: "Record the outcome",
        description: "Log the resolution — refund, repair, Section 75 payout, or court outcome.",
        type: "complete",
      },
    ],
  },
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
  { id: "housing", label: "Landlord & Tenant", icon: "🏠" },
  { id: "parking", label: "Parking", icon: "🚗" },
  { id: "retail_shopping", label: "Retail & Online Shopping", icon: "🛒" },
];
