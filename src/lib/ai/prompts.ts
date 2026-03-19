// Category-specific legal context injected into AI prompts when the case category is known.
export const CATEGORY_LEGAL_CONTEXT: Record<string, string> = {
  energy: "Energy sector: Ofgem regulates. Energy Ombudsman handles complaints after 8 weeks or on deadlock letter. Smart Export Guarantee, direct debit accuracy, Guaranteed Standards of Performance (GSoP) with automatic payments for failures.",
  water: "Water sector: Ofwat regulates. CCWater (Consumer Council for Water) mediates. Guaranteed Standards of Service. Water Redress Scheme (WATRS) for unresolved disputes.",
  broadband_phone: "Telecoms sector: Ofcom regulates. ADR schemes: CISAS (CEDR) or Ombudsman Services: Communications — depends on provider. Guaranteed minimum speeds (Ofcom code). 8-week complaint window before ADR. Automatic compensation for missed appointments and delayed repairs.",
  financial_services: "Financial services: FCA regulates. Financial Ombudsman Service (FOS) after 8 weeks. Awards up to £415,000. FCA rules: BCOBS (banking conduct), ICOBS (insurance), MCOB (mortgages). Consumer Duty. Section 75 Consumer Credit Act 1974 for credit card purchases £100–£30,000.",
  insurance: "Insurance: FCA regulated. Financial Ombudsman Service after 8 weeks. Consumer Insurance (Disclosure and Representations) Act 2012. Insurance Act 2015 (business). Consumer Duty requires fair value and good outcomes. Time limits on claims must be reasonable.",
  nhs: "NHS complaints: NHS Constitution. Local Authority Social Services and NHS Complaints (England) Regulations 2009. PALS (Patient Advice and Liaison Service) first. Formal complaint acknowledged within 3 working days. Parliamentary and Health Service Ombudsman (PHSO) as final stage. 12-month time limit. Clinical negligence: Bolam/Bolitho test, Montgomery v Lanarkshire [2015] consent.",
  housing: "Housing: Housing Act 2004, Housing Act 1988 (assured tenancies), Renters' Rights Act 2026. Housing Ombudsman for social housing. Leasehold disputes: First-tier Tribunal (Property Chamber).",
  retail: "Retail/goods: Consumer Rights Act 2015 (satisfactory quality, fit for purpose, as described). Short-term right to reject within 30 days. Burden of proof reverses at 6 months. ADR: depends on retailer membership. Small claims court for under £10,000.",
  transport: "Transport: Rail complaints to operator, then Rail Ombudsman (for members) or CMOS (non-members). Aviation: UK261 compensation for delays 3h+, cancellations. AviationADR or CAA. Bus/coach: Traffic Commissioner.",
  government_hmrc: "HMRC: complaint to HMRC first, then Adjudicator's Office, then Parliamentary Ombudsman via MP. Statutory interest on overpaid tax. Reasonable excuse for late filing.",
  government_dwp: "DWP: mandatory reconsideration within 1 month, then appeal to First-tier Tribunal (Social Security). Tribunal success rates are high — 65%+ for PIP/ESA appeals. CICA for criminal injuries.",
  government_council: "Council/local authority: complaint to council, then Local Government and Social Care Ombudsman (LGSCO). Housing, planning, social care, roads. No financial compensation cap.",
  education: "Education: complaint to school/college/university, then Office of the Independent Adjudicator (OIA) for higher education. Ofsted for school quality concerns.",
  employment: "Employment: ACAS early conciliation (required before tribunal). Employment Tribunal (ET) for unfair dismissal, discrimination. 3-month minus 1 day time limit from dismissal. ERA 1996, Equality Act 2010.",
  // New verticals
  landlord_tenant: "Landlord and tenant law: Landlord and Tenant Act 1985 s.11 (repair obligations — structure, exterior, utilities). Homes (Fitness for Human Habitation) Act 2018. Tenant Fees Act 2019. Renters' Rights Act 2026 (abolishes Section 21 no-fault eviction). Deposit protection: Housing Act 2004 ss.213–215 — protect within 30 days, prescribed information required, 1–3x deposit penalty for failure. Environmental Health (HHSRS) for disrepair. Housing Ombudsman for social housing. First-tier Tribunal (Property Chamber) for private tenant rights, rent repayment orders, and deposit disputes. Section 8 and Section 21 notices (before Renters' Rights Act commencement).",
  parking: "Parking enforcement: Private Parking Charge Notices (PCNs) are contractual — governed by Protection of Freedoms Act 2012 Sch.4 and contract law. Private operators: BPA Code of Practice (appeal to POPLA) or IPC Code (appeal to IAS). Keeper liability provisions allow operators to pursue the registered keeper rather than driver. Beavis v ParkingEye [2015] UKSC 67: charges up to £85 can be legitimate deterrents. Council Penalty Charge Notices: Traffic Management Act 2004 — statutory, not contractual. Appeals: Traffic Penalty Tribunal (England/Wales), Parking and Bus Lane Tribunal (Scotland/London). Grace periods: BPA requires minimum 10 minutes consideration period.",
  council_tax: "Council tax: Local Government Finance Act 1992. Valuation Office Agency (VOA) sets bands based on 1 April 1991 property values. Challenge band: contact VOA, then appeal to Valuation Tribunal for England within 2 months of VOA decision. Warning: tribunal can increase the band. Single person discount 25%. Student exemption. Empty property charges (councils have discretion). Hardship: every council must have a council tax reduction scheme. Enforcement: liability order from Magistrates' Court, then bailiffs, wage deductions, or committal (priority debt).",
  motor_vehicle: "Motor vehicle purchases: Consumer Rights Act 2015 ss.9–11 (satisfactory quality, fit for purpose, as described). Short-term right to reject within 30 days (s.22). One repair attempt permitted (s.23). If repair fails: full rejection possible (s.24) with deduction for use after 6 months. Burden of proof: presumed defective at purchase within 6 months — dealer must disprove. Section 75 Consumer Credit Act 1974: card company jointly liable for purchases £100–£30,000. Finance (HP/PCP): complain to finance company (as legal owner) then FOS after 8 weeks. DCA (Discretionary Commission Arrangement) mis-selling: FCA ruling January 2024 — pre-January 2021 car finance may entitle compensation. Motor Ombudsman handles accredited dealers. Small claims for under £10,000.",
  nhs_healthcare: "NHS and healthcare complaints: Local Authority Social Services and NHS Complaints (England) Regulations 2009. NHS Constitution. PALS (Patient Advice and Liaison Service) for informal resolution. Formal complaint: acknowledged within 3 working days, full response within 6 months. Parliamentary and Health Service Ombudsman (PHSO) as final stage (free). 12-month time limit from event. Regulatory bodies: GMC (doctors), NMC (nurses), GDC (dentists), CQC (services). Clinical negligence claims: Bolam v Friern Hospital [1957] — reasonable body of medical opinion test. Montgomery v Lanarkshire Health Board [2015] — patient consent. 3-year limitation (Limitation Act 1980 s.11). Legal aid available for some clinical negligence.",
  home_improvements: "Home improvements and building services: Consumer Rights Act 2015 ss.49–52 — services performed with reasonable care and skill, within reasonable time, at reasonable price. If substandard: right to redo to satisfactory standard, or price reduction. Supply of Goods and Services Act 1982 (older contracts). Pre-Action Protocol for Construction and Engineering Disputes. Gas Safety (Installation and Use) Regulations 1998 — gas work must be by Gas Safe registered engineer (criminal offence to use unregistered installer). Building Regulations 2010 — structural and electrical work notification requirements. Trade bodies: FMB, TrustMark (government-endorsed), NICEIC (electrical), Gas Safe Register. TrustMark: insurance-backed guarantee, dispute resolution. Trading Standards via Citizens Advice for criminal breaches.",
  subscriptions: "Subscription services and cancellation: Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 — 14-day cooling-off period for online/distance contracts. Digital Markets, Competition and Consumers Act 2024 (DMCC Act) — subscription rules expected autumn 2026: cancellation must be as easy as sign-up, clearer renewal reminders required, CMA can impose fines up to 10% of global turnover. Direct Debit Guarantee: unconditional right to cancel via bank. Chargeback: Visa/Mastercard scheme rules allow reversal of unauthorised charges. Unfair Commercial Practices: Consumer Protection from Unfair Trading Regulations 2008 — deliberately difficult cancellation is an unfair commercial practice. CMA enforcement powers under DMCC Act 2024.",
};

export const BASE_SYSTEM = `You are an AI assistant for TheyPromised.app, a UK consumer complaint tracking platform. You help people resolve disputes with energy companies, banks, HMRC, landlords, the NHS, councils, and other organisations.

You provide guidance based on:
- UK consumer rights law (Consumer Rights Act 2015, Consumer Contracts Regulations 2013, DMCC Act 2024, etc.)
- Ombudsman procedures (Financial Ombudsman, Energy Ombudsman, Housing Ombudsman, Local Government Ombudsman, Parliamentary Ombudsman, Rail Ombudsman, Communications Ombudsman, Motor Ombudsman, PHSO)
- GDPR and data subject rights
- Employment rights (ACAS, Employment Tribunals)
- Small claims court procedures (England and Wales)
- Landlord and tenant law (Landlord and Tenant Act 1985, Homes Act 2018, Renters' Rights Act 2026, deposit protection)
- Parking enforcement (Protection of Freedoms Act 2012, Traffic Management Act 2004, POPLA, IAS, Traffic Penalty Tribunal)
- Council tax (Local Government Finance Act 1992, VOA, Valuation Tribunal)
- Motor vehicle consumer rights (Consumer Rights Act 2015, Section 75 CCA 1974, Motor Ombudsman, FCA motor finance ruling)
- Healthcare complaints (NHS Complaints Regulations 2009, PALS, PHSO, clinical negligence law)
- Building and construction services (Consumer Rights Act 2015, Building Regulations 2010, Gas Safety Regulations, trade bodies)
- Subscription and cancellation law (Consumer Contracts Regulations 2013, DMCC Act 2024, Direct Debit Guarantee)

Rules:
- Always use UK English (organisation, colour, licence, behaviour, etc.)
- Be accurate. If unsure about a specific procedure, say so and direct the user to verify with the relevant ombudsman's website.
- Never hallucinate legal procedures, deadlines, or compensation limits.
- Do not give legal advice that requires a qualified solicitor — always recommend seeking legal advice for complex matters.
- Be empathetic but practical.`.trim();

export const CASE_ANALYSIS_SYSTEM = `${BASE_SYSTEM}

You are analysing a consumer complaint case to provide actionable guidance. Respond with STRICT JSON only — no markdown, no code blocks, just the raw JSON object.`;

export const LETTER_SYSTEM = `${BASE_SYSTEM}

You are drafting a formal complaint letter for a UK consumer. The letter must:
- Be professional, firm, and factual
- Reference only information provided in the case data — do not invent facts
- Use formal letter format with date, addresses, subject line, and sign-off
- Set a clear 14-day deadline for response
- Reference relevant UK law where applicable (but only laws you are certain apply)
- Be written in the first person from the complainant's perspective
- NOT include any commentary or notes — output only the letter text itself`;

export const AI_PROMPTS = {
  baseSystem: BASE_SYSTEM,
  caseSuggest: CASE_ANALYSIS_SYSTEM,
  draftLetter: LETTER_SYSTEM,
  summarise: `${BASE_SYSTEM}\n\nSummarise the following interaction note into one clear, factual sentence. Output only the summary sentence with no preamble.`,
};

export function buildCaseAnalysisPrompt(caseContext: {
  title: string;
  category: string;
  description: string | null;
  status: string;
  escalationStage: string;
  priority: string;
  firstContactDate: string | null;
  daysOpen: number;
  desiredOutcome: string | null;
  amountInDispute: number | null;
  referenceNumber: string | null;
  organisationName: string;
  interactions: Array<{
    date: string;
    channel: string;
    direction: string;
    summary: string;
    outcome: string | null;
    promisesMade: string | null;
    promiseFulfilled: boolean | null;
    mood: string | null;
  }>;
  escalationRules: Array<{
    stageOrder: number;
    title: string;
    waitPeriodDays: number | null;
    regulatoryBody: string | null;
    tips: string | null;
  }>;
}): string {
  const interactionsSummary = caseContext.interactions
    .slice(-10) // Last 10 interactions to keep prompt size manageable
    .map(
      (i, idx) =>
        `Interaction ${idx + 1} (${i.date}, ${i.channel}, ${i.direction}): ${i.summary}${
          i.outcome ? ` [Outcome: ${i.outcome}]` : ""
        }${i.promisesMade ? ` [Promise: ${i.promisesMade}${i.promiseFulfilled === false ? " — BROKEN" : i.promiseFulfilled === true ? " — KEPT" : " — PENDING"}]` : ""}${
          i.mood ? ` [Staff attitude: ${i.mood}]` : ""
        }`
    )
    .join("\n");

  return `Analyse this UK consumer complaint case and provide actionable guidance.

CASE DETAILS:
- Organisation: ${caseContext.organisationName}
- Category: ${caseContext.category}
- Case title: ${caseContext.title}
- Description: ${caseContext.description ?? "Not provided"}
- Status: ${caseContext.status}
- Current escalation stage: ${caseContext.escalationStage}
- Priority: ${caseContext.priority}
- Days open: ${caseContext.daysOpen}
- First contact date: ${caseContext.firstContactDate ?? "Unknown"}
- Desired outcome: ${caseContext.desiredOutcome ?? "Not specified"}
- Amount in dispute: ${caseContext.amountInDispute ? `£${Number(caseContext.amountInDispute).toFixed(2)}` : "Not specified"}
- Reference number: ${caseContext.referenceNumber ?? "None"}

INTERACTIONS (${caseContext.interactions.length} total, showing last ${Math.min(10, caseContext.interactions.length)}):
${interactionsSummary || "No interactions logged yet."}

AVAILABLE ESCALATION ROUTES:
${caseContext.escalationRules.map((r) => `Stage ${r.stageOrder}: ${r.title} (wait: ${r.waitPeriodDays ?? 0} days, body: ${r.regulatoryBody ?? "N/A"})`).join("\n")}

Respond with this exact JSON structure:
{
  "assessment": "2-3 sentence overall assessment of the case strength and situation",
  "nextStep": "The single most important action to take right now (1-2 sentences, specific and actionable)",
  "deadlines": ["Array of upcoming deadlines or time-sensitive actions, each as a concise string"],
  "evidenceNeeded": ["Array of evidence types that would strengthen the case"],
  "strengthRating": "weak|moderate|strong",
  "strengthExplanation": "1-2 sentence explanation of the strength rating",
  "letterRecommended": true|false,
  "letterType": "initial_complaint|follow_up|escalation|final_response_request|ombudsman_referral|subject_access_request|adr_referral|section_75_claim|letter_before_action|custom|null"
}`;
}

export function buildLetterPrompt(context: {
  letterType: string;
  letterTypeName: string;
  legalReferences: string[];
  suggestedTone: string;
  caseCategory?: string | null;
  organisationName: string;
  complaintEmail: string | null;
  complaintPhone: string | null;
  senderName: string;
  senderAddressLine1: string | null;
  senderAddressLine2: string | null;
  senderCity: string | null;
  senderPostcode: string | null;
  caseTitle: string;
  caseDescription: string | null;
  referenceNumber: string | null;
  firstContactDate: string | null;
  desiredOutcome: string | null;
  amountInDispute: number | null;
  interactions: Array<{
    date: string;
    channel: string;
    summary: string;
    promisesMade: string | null;
    promiseFulfilled: boolean | null;
    referenceNumber: string | null;
  }>;
  additionalInstructions?: string;
}): string {
  const senderAddress = [
    context.senderAddressLine1,
    context.senderAddressLine2,
    context.senderCity,
    context.senderPostcode,
  ]
    .filter(Boolean)
    .join("\n");

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const interactionHistory = context.interactions
    .slice(-8)
    .map(
      (i) =>
        `- ${i.date} (${i.channel}): ${i.summary}${
          i.referenceNumber ? ` [Ref: ${i.referenceNumber}]` : ""
        }${
          i.promisesMade
            ? ` [Promised: ${i.promisesMade} — ${i.promiseFulfilled === false ? "NOT FULFILLED" : i.promiseFulfilled === true ? "fulfilled" : "not yet fulfilled"}]`
            : ""
        }`
    )
    .join("\n");

  const categoryContext = CATEGORY_LEGAL_CONTEXT[context.caseCategory ?? ""] ?? "";

  return `Draft a "${context.letterTypeName}" letter.

Tone: ${context.suggestedTone}
Legal references to include if applicable: ${context.legalReferences.join(", ") || "None specified"}
${categoryContext ? `\nCATEGORY-SPECIFIC LEGAL CONTEXT (${context.caseCategory}):\n${categoryContext}` : ""}

SENDER (place top-right of letter):
${context.senderName}
${senderAddress || "[Address not provided — leave blank line]"}

TODAY'S DATE: ${today}

RECIPIENT:
${context.organisationName} Complaints Department
${context.complaintEmail ? `Email: ${context.complaintEmail}` : ""}

SUBJECT: Formal Complaint${context.caseTitle ? ` — ${context.caseTitle}` : ""}${context.referenceNumber ? ` (Ref: ${context.referenceNumber})` : ""}

CASE INFORMATION:
- What happened: ${context.caseDescription ?? "Not provided"}
- First contact with organisation: ${context.firstContactDate ?? "Unknown"}
- Desired outcome: ${context.desiredOutcome ?? "Resolution of the complaint"}
- Amount in dispute: ${context.amountInDispute ? `£${Number(context.amountInDispute).toFixed(2)}` : "Not applicable"}
- My reference: ${context.referenceNumber ?? "None"}

INTERACTION HISTORY:
${interactionHistory || "No interactions recorded yet."}

${context.additionalInstructions ? `ADDITIONAL INSTRUCTIONS:\n${context.additionalInstructions}\n` : ""}
Draft the complete letter below. Output ONLY the letter text — no notes, no commentary, no explanations. Start with the sender's address.`;
}
