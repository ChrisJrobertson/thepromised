export interface ComplaintTemplate {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  commonWith: string[];
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedDesiredOutcome: string;
  suggestedPriority: "low" | "medium" | "high" | "urgent";
  suggestedFirstLetterType: string;
  relevantLegislation: string[];
  tips: string[];
}

export const complaintTemplates: ComplaintTemplate[] = [
  {
    id: "energy-wrong-tariff",
    slug: "wrong-energy-tariff",
    title: "Wrong Energy Tariff / Billing Error",
    category: "energy",
    description: "Your energy provider is charging you on the wrong tariff, overbilling, or not applying agreed rates.",
    commonWith: ["British Gas", "EDF Energy", "OVO Energy", "Scottish Power", "E.ON"],
    suggestedTitle: "Billing dispute — incorrect tariff applied",
    suggestedDescription: "I am being charged at the wrong tariff rate despite having a confirmed agreement. My bills are higher than they should be.",
    suggestedDesiredOutcome: "Full refund of overcharged amount, correction of tariff to agreed rate, written apology.",
    suggestedPriority: "high",
    suggestedFirstLetterType: "initial",
    relevantLegislation: ["Consumer Rights Act 2015", "Energy supply licence conditions (Ofgem)"],
    tips: [
      "Keep your original tariff confirmation email or letter",
      "Screenshot your online account showing the wrong rate",
      "Calculate the exact overcharge amount from your bills",
      "Ask for a deadlock letter if not resolved in 8 weeks",
    ],
  },
  {
    id: "broadband-speed",
    slug: "broadband-speed-not-as-advertised",
    title: "Broadband Speed Not As Advertised",
    category: "broadband_phone",
    description: "Your broadband speed is consistently below the minimum guaranteed speed in your contract.",
    commonWith: ["BT", "Sky", "Virgin Media", "TalkTalk", "Plusnet"],
    suggestedTitle: "Broadband speed complaint — below guaranteed minimum",
    suggestedDescription: "My broadband speed is consistently below the minimum speed guaranteed in my contract. I have run multiple speed tests at different times showing speeds of [X] Mbps against a guaranteed minimum of [Y] Mbps.",
    suggestedDesiredOutcome: "Fix the speed issue, or allow me to exit my contract without penalty, plus compensation for the period of poor service.",
    suggestedPriority: "medium",
    suggestedFirstLetterType: "initial",
    relevantLegislation: ["Ofcom Voluntary Code of Practice on Broadband Speeds", "Consumer Rights Act 2015 (service not as described)"],
    tips: [
      "Run speed tests at different times of day",
      "Check your contract for the minimum guaranteed speed",
      "Test with a wired connection for accuracy",
      "If speed stays below minimum, you can usually exit penalty-free",
    ],
  },
  {
    id: "bank-charges",
    slug: "unfair-bank-charges",
    title: "Unfair Bank Charges or Fees",
    category: "financial_services",
    description: "Your bank has applied unfair charges, hidden fees, or penalties that were not clearly disclosed.",
    commonWith: ["HSBC", "Barclays", "Lloyds Bank", "NatWest", "Santander"],
    suggestedTitle: "Dispute — unfair charges applied to my account",
    suggestedDescription: "My bank has applied charges/fees that I believe are unfair and were not adequately disclosed at the time of opening my account or making the transaction.",
    suggestedDesiredOutcome: "Full refund of all unfair charges, written confirmation that no further charges will be applied, compensation for distress.",
    suggestedPriority: "high",
    suggestedFirstLetterType: "initial",
    relevantLegislation: ["Consumer Rights Act 2015", "FCA Consumer Duty (PS22/9)"],
    tips: [
      "Request a full statement of charges",
      "Explain if charges caused financial difficulty",
      "Escalate to the Financial Ombudsman after 8 weeks or deadlock",
    ],
  },
  {
    id: "insurance-claim-denied",
    slug: "insurance-claim-denied",
    title: "Insurance Claim Unfairly Denied",
    category: "insurance",
    description: "Your insurer has denied a claim that you believe should be covered under your policy.",
    commonWith: ["Aviva", "Direct Line", "Admiral", "AXA", "LV="],
    suggestedTitle: "Dispute — insurance claim unfairly denied",
    suggestedDescription: "My insurance claim has been denied. I believe the claim is valid and falls within the terms of my policy.",
    suggestedDesiredOutcome: "Claim to be approved and paid in full, written explanation of the original decision, compensation for delay.",
    suggestedPriority: "high",
    suggestedFirstLetterType: "initial",
    relevantLegislation: ["Insurance Act 2015", "FCA Consumer Duty", "ICOBS"],
    tips: [
      "Request the exact policy clause used to deny the claim",
      "Keep all insurer correspondence",
      "Escalate to the Financial Ombudsman if unresolved",
    ],
  },
  {
    id: "flight-delay",
    slug: "flight-delay-compensation",
    title: "Flight Delay / Cancellation Compensation",
    category: "transport",
    description: "Your flight was delayed over 3 hours or cancelled and the airline owes you compensation under UK261.",
    commonWith: ["British Airways", "easyJet", "Ryanair", "Jet2", "TUI"],
    suggestedTitle: "Flight delay compensation claim under UK261",
    suggestedDescription: "My flight [flight number] on [date] from [origin] to [destination] was delayed by [X] hours / cancelled. I am claiming compensation under UK261.",
    suggestedDesiredOutcome: "Compensation under UK261 plus reimbursement of additional expenses incurred.",
    suggestedPriority: "medium",
    suggestedFirstLetterType: "initial",
    relevantLegislation: ["UK261"],
    tips: [
      "Keep your boarding pass and booking confirmation",
      "Airlines must prove extraordinary circumstances",
      "Technical faults are usually not extraordinary circumstances",
    ],
  },
  {
    id: "council-service-failure",
    slug: "council-service-failure",
    title: "Council Service Failure",
    category: "government_council",
    description: "Your local council has failed to provide a service, made an error, or treated you unfairly.",
    commonWith: [],
    suggestedTitle: "Complaint about council service failure",
    suggestedDescription: "The council has failed to [describe service failure]. This has caused [describe impact].",
    suggestedDesiredOutcome: "The issue to be resolved, a written apology, and compensation where appropriate.",
    suggestedPriority: "medium",
    suggestedFirstLetterType: "initial",
    relevantLegislation: ["Local Government Act 1974"],
    tips: [
      "Use the council complaints process first",
      "Escalate to senior stage if stage 1 fails",
      "Keep dated records of all contacts",
    ],
  },
  {
    id: "landlord-repairs",
    slug: "landlord-not-making-repairs",
    title: "Landlord Not Making Repairs",
    category: "housing",
    description: "Your landlord or letting agent is failing to carry out necessary repairs to your rental property.",
    commonWith: [],
    suggestedTitle: "Complaint — failure to carry out repairs",
    suggestedDescription: "My landlord/letting agent has failed to carry out necessary repairs that I reported on [date].",
    suggestedDesiredOutcome: "Repairs completed within 14 days, written repair schedule, and compensation for reduced living conditions.",
    suggestedPriority: "high",
    suggestedFirstLetterType: "initial",
    relevantLegislation: ["Landlord and Tenant Act 1985", "Homes (Fitness for Human Habitation) Act 2018"],
    tips: [
      "Report repairs in writing",
      "Upload photo/video evidence",
      "Contact environmental health if ignored",
    ],
  },
  {
    id: "faulty-product",
    slug: "faulty-product-refund",
    title: "Faulty Product — Refund or Replacement",
    category: "retail",
    description: "You bought a product that is faulty, not as described, or not fit for purpose.",
    commonWith: ["Amazon UK", "Currys", "Argos", "John Lewis"],
    suggestedTitle: "Faulty product — requesting refund/replacement",
    suggestedDescription: "I purchased [product] on [date] for [price]. The product is faulty/not as described/not fit for purpose.",
    suggestedDesiredOutcome: "Full refund or replacement, plus reimbursement of return costs where applicable.",
    suggestedPriority: "medium",
    suggestedFirstLetterType: "initial",
    relevantLegislation: ["Consumer Rights Act 2015"],
    tips: [
      "Within 30 days you can usually claim a full refund",
      "After 30 days, retailer usually gets one repair/replacement attempt",
      "Always complain to the retailer, not the manufacturer",
    ],
  },
  {
    id: "hmrc-tax-error",
    slug: "hmrc-tax-error",
    title: "HMRC Tax Calculation Error",
    category: "government_hmrc",
    description: "HMRC has made an error in your tax calculation, sent an incorrect bill, or failed to process a submission correctly.",
    commonWith: ["HMRC"],
    suggestedTitle: "Dispute — incorrect tax calculation",
    suggestedDescription: "HMRC has issued an incorrect tax calculation/bill. The error is [describe].",
    suggestedDesiredOutcome: "Correction of tax calculation, removal of penalties caused by HMRC error, and written confirmation.",
    suggestedPriority: "high",
    suggestedFirstLetterType: "initial",
    relevantLegislation: ["Taxes Management Act 1970", "HMRC Charter"],
    tips: [
      "Always include your UTR or NI number",
      "Keep copies of all submissions",
      "Escalate via Adjudicator then Parliamentary Ombudsman route",
    ],
  },
  {
    id: "dwp-benefit-decision",
    slug: "dwp-benefit-decision",
    title: "DWP / Universal Credit Decision Dispute",
    category: "government_dwp",
    description: "The DWP has made an incorrect decision about your Universal Credit, PIP, ESA, or other benefit.",
    commonWith: ["DWP"],
    suggestedTitle: "Dispute — incorrect benefit decision",
    suggestedDescription: "The DWP has made a decision about my benefit that I believe is incorrect because [reasons].",
    suggestedDesiredOutcome: "Decision reviewed and corrected, with missed payments backdated.",
    suggestedPriority: "urgent",
    suggestedFirstLetterType: "initial",
    relevantLegislation: ["Social Security Act 1998", "Universal Credit Regulations 2013"],
    tips: [
      "Request Mandatory Reconsideration within 1 month",
      "Appeal to tribunal if MR fails",
      "Get support from Citizens Advice or welfare-rights services",
    ],
  },
];

export function getComplaintTemplateBySlug(slug: string) {
  return complaintTemplates.find((template) => template.slug === slug);
}

export function getComplaintTemplateById(id: string) {
  return complaintTemplates.find((template) => template.id === id);
}
