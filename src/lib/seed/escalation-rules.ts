import type { EscalationRuleInsert } from "@/types/database";

export const ESCALATION_RULES_SEED: EscalationRuleInsert[] = [
  // ─── ENERGY ────────────────────────────────────────────────────────────────
  {
    category: "energy",
    stage: "initial",
    stage_order: 1,
    title: "Raise a complaint with your supplier",
    description:
      "Contact your energy supplier directly — by phone, email, or their online complaints form. Quote any account or reference numbers. Keep records of all contact.",
    action_required:
      "Phone, email, or use the online complaints form on your supplier's website. Ask for a complaint reference number.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Always get the complaint in writing — follow up any phone call with an email. Note the date, time, name of the person you spoke to, and any reference number given.",
  },
  {
    category: "energy",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Request escalation to the complaints team",
    description:
      "If your initial contact does not resolve the issue within 14 days, ask specifically for your complaint to be escalated to the formal complaints team or a senior manager.",
    action_required:
      "Write a formal complaint letter or email referencing your original complaint date and reference number. State that you are escalating.",
    wait_period_days: 14,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Send by recorded post or email with read receipt so you have proof of delivery. Keep a copy of everything.",
  },
  {
    category: "energy",
    stage: "final_response",
    stage_order: 3,
    title: "Request a Deadlock Letter or wait 8 weeks",
    description:
      "Under the Energy Ombudsman scheme, you can refer your complaint after 8 weeks from your original complaint date, or sooner if your supplier issues a 'deadlock letter' (meaning they cannot resolve the dispute).",
    action_required:
      "If 8 weeks have passed without resolution, or if you receive a deadlock letter, you may now refer to the Energy Ombudsman. Write to your supplier requesting a deadlock letter if you believe they are not making progress.",
    wait_period_days: 56,
    deadline_type: "from_complaint",
    regulatory_body: "Energy Ombudsman (Ombudsman Services: Energy)",
    regulatory_url: "https://www.ombudsman-services.org/sectors/energy",
    template_available: true,
    tips:
      "The 8-week clock starts from the date you first raised the complaint. Keep all records — the Ombudsman will need evidence of your attempts to resolve the issue.",
  },
  {
    category: "energy",
    stage: "ombudsman",
    stage_order: 4,
    title: "Refer to the Energy Ombudsman",
    description:
      "The Energy Ombudsman is a free, independent service that resolves disputes between energy consumers and suppliers. Their decisions are binding on the supplier (not on you). Compensation of up to £10,000 can be awarded.",
    action_required:
      "Submit a complaint to the Energy Ombudsman online, by post, or by phone. Provide all your evidence and correspondence.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Energy Ombudsman (Ombudsman Services: Energy)",
    regulatory_url: "https://www.ombudsman-services.org/sectors/energy",
    template_available: true,
    tips:
      "The Ombudsman investigates free of charge. They typically respond within 6–8 weeks. You can accept or reject their decision — if you accept it, the supplier must comply.",
  },
  {
    category: "energy",
    stage: "court",
    stage_order: 5,
    title: "Small Claims Court (if Ombudsman cannot help)",
    description:
      "If the Energy Ombudsman cannot take your case (e.g., it falls outside their remit) or their outcome is unsatisfactory, you may pursue the matter through the small claims court for amounts up to £10,000 in England and Wales.",
    action_required:
      "File a claim on the HMCTS Money Claim Online service. Send a formal 'Letter Before Action' first, giving 14 days to respond.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips:
      "Court should be a last resort. Consider whether the cost and time are proportionate. Citizens Advice can help you decide.",
  },

  // ─── WATER ─────────────────────────────────────────────────────────────────
  {
    category: "water",
    stage: "initial",
    stage_order: 1,
    title: "Complain to your water company",
    description:
      "Contact your water or sewerage company directly with details of your complaint.",
    action_required:
      "Phone, email, or write to your water company's customer service team.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "Keep a record of all contact, including dates and reference numbers.",
  },
  {
    category: "water",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Formal complaint and escalation",
    description:
      "If unresolved after initial contact, submit a formal written complaint and escalate to the complaints team.",
    action_required: "Send a formal complaint letter citing your complaint reference and dates.",
    wait_period_days: 10,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "Water companies must respond to written complaints within 10 working days.",
  },
  {
    category: "water",
    stage: "ombudsman",
    stage_order: 3,
    title: "Refer to the Consumer Council for Water (CCW)",
    description:
      "If you remain dissatisfied after the company's complaints process, the Consumer Council for Water (CCW) is the independent body that can investigate and help resolve disputes.",
    action_required:
      "Contact CCW to request assistance. Provide all correspondence.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Consumer Council for Water (CCW)",
    regulatory_url: "https://www.ccwater.org.uk/",
    template_available: false,
    tips:
      "CCW can refer cases to the Water Industry Ombudsman if needed. Their service is free.",
  },
  {
    category: "water",
    stage: "court",
    stage_order: 4,
    title: "Small Claims Court",
    description: "For financial claims up to £10,000, pursue via the small claims court.",
    action_required: "Send Letter Before Action (14 days), then file with HMCTS.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips: "Court is a last resort. Citizens Advice can provide guidance.",
  },

  // ─── BROADBAND & PHONE ─────────────────────────────────────────────────────
  {
    category: "broadband_phone",
    stage: "initial",
    stage_order: 1,
    title: "Complain to your provider",
    description:
      "Contact your broadband or phone provider directly. Most providers have a dedicated complaints team.",
    action_required:
      "Phone, email, or use the online complaints process. Ask for a complaint reference number.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Note that under Ofcom rules, providers must acknowledge your complaint promptly.",
  },
  {
    category: "broadband_phone",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Escalate to the complaints department",
    description:
      "If unresolved, request formal escalation. Providers have up to 8 weeks to resolve complaints before you can refer to the Ombudsman.",
    action_required:
      "Submit a formal written complaint referencing your original complaint date.",
    wait_period_days: 14,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "Keep written records of all communications.",
  },
  {
    category: "broadband_phone",
    stage: "final_response",
    stage_order: 3,
    title: "Request a Deadlock Letter or wait 8 weeks",
    description:
      "After 8 weeks, or on receipt of a 'deadlock letter', you can refer to an approved Alternative Dispute Resolution (ADR) scheme — either CISAS or Ombudsman Services: Communications.",
    action_required:
      "If 8 weeks have passed, check which ADR scheme your provider belongs to and submit your complaint.",
    wait_period_days: 56,
    deadline_type: "from_complaint",
    regulatory_body: "Ombudsman Services: Communications or CISAS",
    regulatory_url: "https://www.ombudsman-services.org/sectors/communications",
    template_available: true,
    tips:
      "Ofcom maintains a list of which providers belong to which scheme. The service is free to consumers.",
  },
  {
    category: "broadband_phone",
    stage: "ombudsman",
    stage_order: 4,
    title: "Refer to the Communications Ombudsman",
    description:
      "Submit your complaint to the relevant ADR scheme. Their decisions are binding on the provider.",
    action_required:
      "Apply online to Ombudsman Services: Communications (commsombudsman.org) or CISAS depending on your provider.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Ombudsman Services: Communications / CISAS",
    regulatory_url: "https://www.commsombudsman.org/",
    template_available: true,
    tips: "Provide all evidence including bills, correspondence, and notes of phone calls.",
  },
  {
    category: "broadband_phone",
    stage: "court",
    stage_order: 5,
    title: "Small Claims Court",
    description: "For financial claims up to £10,000 not resolved by the Ombudsman.",
    action_required: "Send Letter Before Action (14 days), then file with HMCTS.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips: "Check whether Ofcom can assist with systemic issues.",
  },

  // ─── FINANCIAL SERVICES ────────────────────────────────────────────────────
  {
    category: "financial_services",
    stage: "initial",
    stage_order: 1,
    title: "Complain to the firm",
    description:
      "All FCA-regulated financial firms must have a formal complaints procedure. Submit your complaint in writing for a paper trail.",
    action_required:
      "Write to the firm's dedicated complaints department. Include your account number, the nature of the complaint, and what outcome you want.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "FCA rules require the firm to acknowledge your complaint within 5 business days, and to send a 'final response' within 8 weeks.",
  },
  {
    category: "financial_services",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Await the firm's Final Response (up to 8 weeks)",
    description:
      "The firm has up to 8 weeks to issue a final response. If you are unhappy with their response, or if 8 weeks pass without a final response, you can escalate to the Financial Ombudsman Service (FOS).",
    action_required:
      "If you receive an unsatisfactory final response before 8 weeks, you can escalate to FOS immediately. Otherwise wait 8 weeks.",
    wait_period_days: 56,
    deadline_type: "from_complaint",
    regulatory_body: "Financial Ombudsman Service",
    regulatory_url: "https://www.financial-ombudsman.org.uk/",
    template_available: false,
    tips:
      "The time limit to refer to FOS is 6 months from the date of the firm's final response letter. Do not miss this deadline.",
  },
  {
    category: "financial_services",
    stage: "ombudsman",
    stage_order: 3,
    title: "Refer to the Financial Ombudsman Service (FOS)",
    description:
      "FOS is a free, independent service. They can award compensation up to £430,000. Their decision is binding on the firm (not on you — you can still go to court if you disagree).",
    action_required:
      "Submit a complaint form to FOS online, by post, or by phone. Provide all your evidence and the firm's final response letter.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Financial Ombudsman Service",
    regulatory_url: "https://www.financial-ombudsman.org.uk/",
    template_available: true,
    tips:
      "FOS handles disputes with banks, insurance, investments, mortgages, pensions, and most other financial products. The service is entirely free to consumers.",
  },
  {
    category: "financial_services",
    stage: "court",
    stage_order: 4,
    title: "Court action",
    description:
      "If FOS cannot help or you disagree with their decision, you may pursue the matter through the courts. For amounts up to £10,000 use the small claims track.",
    action_required:
      "Send a Letter Before Action giving 14 days to respond, then file with HMCTS.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips:
      "Note that going to court after accepting an FOS award may not be possible. Seek legal advice before proceeding.",
  },

  // ─── INSURANCE ─────────────────────────────────────────────────────────────
  {
    category: "insurance",
    stage: "initial",
    stage_order: 1,
    title: "Complain to your insurer",
    description:
      "Contact your insurance company's complaints team directly, in writing. Insurance firms are FCA-regulated and must follow the same 8-week rule as other financial firms.",
    action_required:
      "Write to the insurer's formal complaints department. Include your policy number and a clear description of the complaint.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "Record all contact. Request acknowledgement in writing within 5 business days.",
  },
  {
    category: "insurance",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Await Final Response (up to 8 weeks)",
    description:
      "The insurer has 8 weeks to issue a final response. If you are unhappy or 8 weeks pass, escalate to FOS. Note: for some Lloyd's of London policies, there is a separate process.",
    action_required:
      "If dissatisfied with the response or after 8 weeks, refer to the Financial Ombudsman Service.",
    wait_period_days: 56,
    deadline_type: "from_complaint",
    regulatory_body: "Financial Ombudsman Service",
    regulatory_url: "https://www.financial-ombudsman.org.uk/",
    template_available: false,
    tips:
      "Keep all documentation including your original policy, renewal documents, correspondence, and any claim forms or decisions.",
  },
  {
    category: "insurance",
    stage: "ombudsman",
    stage_order: 3,
    title: "Refer to the Financial Ombudsman Service (FOS)",
    description:
      "FOS handles complaints against most UK insurance providers. Awards up to £430,000.",
    action_required: "Submit your complaint to FOS with all evidence.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Financial Ombudsman Service",
    regulatory_url: "https://www.financial-ombudsman.org.uk/",
    template_available: true,
    tips:
      "You must refer within 6 months of the insurer's final response letter.",
  },
  {
    category: "insurance",
    stage: "court",
    stage_order: 4,
    title: "Court action",
    description: "For larger claims or where FOS cannot assist.",
    action_required: "Send Letter Before Action (14 days), then file with HMCTS.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips: "Seek legal advice for insurance disputes over £10,000.",
  },

  // ─── GOVERNMENT — HMRC ─────────────────────────────────────────────────────
  {
    category: "government_hmrc",
    stage: "initial",
    stage_order: 1,
    title: "Complain to HMRC directly",
    description:
      "Contact HMRC's complaints team. You can complain online, by post, or by calling the relevant HMRC helpline. Quote your Unique Taxpayer Reference (UTR) or National Insurance number.",
    action_required:
      "Use the HMRC online complaints form or write to HMRC's complaints team at the address on your correspondence.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: "HM Revenue & Customs",
    regulatory_url: "https://www.gov.uk/complain-about-hmrc",
    template_available: true,
    tips:
      "HMRC aims to respond within 15 working days. Keep all HMRC correspondence including reference numbers.",
  },
  {
    category: "government_hmrc",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Request a Tier 2 review",
    description:
      "If you are unhappy with the Tier 1 response, you can request a Tier 2 review by a different, more senior HMRC officer.",
    action_required:
      "Write back to HMRC stating you are unsatisfied and requesting a Tier 2 review. Reference your original complaint reference number.",
    wait_period_days: 30,
    deadline_type: "from_response",
    regulatory_body: "HM Revenue & Customs",
    regulatory_url: "https://www.gov.uk/complain-about-hmrc",
    template_available: true,
    tips: "Be specific about what you disagree with in the Tier 1 response.",
  },
  {
    category: "government_hmrc",
    stage: "final_response",
    stage_order: 3,
    title: "Refer to the Adjudicator's Office",
    description:
      "The Adjudicator's Office investigates complaints about HMRC and the Valuation Office Agency. It is free and independent. You must have completed HMRC's internal process first.",
    action_required:
      "Contact the Adjudicator's Office online or by post. Provide all correspondence with HMRC.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "The Adjudicator's Office",
    regulatory_url: "https://www.adjudicatorsoffice.gov.uk/",
    template_available: false,
    tips:
      "The Adjudicator cannot investigate tax decisions — only HMRC's handling of the complaint. For tax disputes, use the Tax Tribunal.",
  },
  {
    category: "government_hmrc",
    stage: "ombudsman",
    stage_order: 4,
    title: "Parliamentary and Health Service Ombudsman (via your MP)",
    description:
      "If you are still dissatisfied after the Adjudicator's investigation, you can complain to the Parliamentary Ombudsman via your MP.",
    action_required:
      "Contact your local MP and ask them to refer your complaint to the Parliamentary and Health Service Ombudsman.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Parliamentary and Health Service Ombudsman",
    regulatory_url: "https://www.ombudsman.org.uk/",
    template_available: false,
    tips:
      "Find your MP at members.parliament.uk. Explain your case clearly and provide all supporting documents.",
  },
  {
    category: "government_hmrc",
    stage: "court",
    stage_order: 5,
    title: "Judicial Review (extreme cases only)",
    description:
      "Judicial review challenges the lawfulness of a public body's decision. It is a last resort and requires legal representation.",
    action_required:
      "Seek specialist legal advice before pursuing judicial review. A pre-action letter must be sent first.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Administrative Court",
    regulatory_url: "https://www.gov.uk/courts-tribunals/administrative-court",
    template_available: false,
    tips:
      "Judicial review is expensive and complex. Only pursue this with legal advice and a strong case on the lawfulness of HMRC's decision.",
  },

  // ─── GOVERNMENT — DWP ──────────────────────────────────────────────────────
  {
    category: "government_dwp",
    stage: "initial",
    stage_order: 1,
    title: "Complain to DWP",
    description:
      "Contact DWP (Department for Work & Pensions) directly about their service or a benefit decision you disagree with.",
    action_required:
      "Phone, write, or use GOV.UK to submit your complaint to the relevant DWP service (Universal Credit, PIP, Jobcentre, etc.).",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: "Department for Work & Pensions",
    regulatory_url: "https://www.gov.uk/government/organisations/department-for-work-pensions",
    template_available: true,
    tips:
      "If challenging a benefit decision (not just a service complaint), the correct route is Mandatory Reconsideration — see the next stage.",
  },
  {
    category: "government_dwp",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Request Mandatory Reconsideration",
    description:
      "If you disagree with a benefit decision (e.g., PIP, Universal Credit), you must first request a Mandatory Reconsideration before you can appeal to a tribunal. You have 1 month from the decision letter to request this.",
    action_required:
      "Write to DWP requesting a Mandatory Reconsideration. State clearly which decision you disagree with and why. Provide supporting evidence.",
    wait_period_days: 28,
    deadline_type: "absolute",
    regulatory_body: "DWP — Mandatory Reconsideration",
    regulatory_url: "https://www.gov.uk/mandatory-reconsideration",
    template_available: true,
    tips:
      "Important: You generally have 1 month from the decision date to request Mandatory Reconsideration. If you miss this, DWP may refuse. Always act quickly.",
  },
  {
    category: "government_dwp",
    stage: "ombudsman",
    stage_order: 3,
    title: "Appeal to the First-tier Tribunal",
    description:
      "If the Mandatory Reconsideration upholds the original decision, you can appeal to the independent Social Security and Child Support (SSCS) First-tier Tribunal. This is free.",
    action_required:
      "Complete form SSCS1 and submit to the Tribunal Service within 1 month of the Mandatory Reconsideration decision.",
    wait_period_days: 28,
    deadline_type: "absolute",
    regulatory_body: "HM Courts & Tribunals Service — First-tier Tribunal (SSCS)",
    regulatory_url:
      "https://www.gov.uk/social-security-child-support-tribunal",
    template_available: false,
    tips:
      "Get free tribunal advice from Citizens Advice or a disability rights charity. Tribunals overturn DWP decisions in around 70% of PIP appeal hearings.",
  },
  {
    category: "government_dwp",
    stage: "court",
    stage_order: 4,
    title: "Parliamentary Ombudsman (via MP) for maladministration",
    description:
      "For complaints about DWP's handling of your case (not the benefit decision itself), you can refer to the Parliamentary Ombudsman via your MP.",
    action_required:
      "Contact your local MP and ask them to refer your complaint to the Parliamentary and Health Service Ombudsman.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Parliamentary and Health Service Ombudsman",
    regulatory_url: "https://www.ombudsman.org.uk/",
    template_available: false,
    tips:
      "This route is for complaints about how DWP handled your case, not the merits of a benefit decision.",
  },

  // ─── GOVERNMENT — COUNCIL ──────────────────────────────────────────────────
  {
    category: "government_council",
    stage: "initial",
    stage_order: 1,
    title: "Complain to the council department",
    description:
      "Contact the relevant council department directly. Most councils have a multi-stage formal complaints process.",
    action_required:
      "Submit a complaint to the council's customer services or the relevant department (housing, planning, social care, etc.).",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "Councils typically have a Stage 1 response time of 10–15 working days.",
  },
  {
    category: "government_council",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Stage 2 — Senior manager review",
    description:
      "If the Stage 1 response is unsatisfactory, escalate to Stage 2, which is reviewed by a senior manager or different officer.",
    action_required:
      "Write to the council requesting a Stage 2 review of your complaint. Reference your Stage 1 complaint reference.",
    wait_period_days: 20,
    deadline_type: "from_response",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "Stage 2 responses typically take 20–25 working days.",
  },
  {
    category: "government_council",
    stage: "ombudsman",
    stage_order: 3,
    title: "Refer to the Local Government & Social Care Ombudsman",
    description:
      "The Local Government & Social Care Ombudsman (LGO) investigates complaints about councils, social care providers, and some other public bodies. Their service is free. They can recommend compensation and service improvements.",
    action_required:
      "Submit your complaint to the LGO online. You must have completed the council's internal complaints process first.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Local Government & Social Care Ombudsman",
    regulatory_url: "https://www.lgo.org.uk/",
    template_available: false,
    tips:
      "The LGO can investigate planning, housing, social care, education, and other council services. Their recommendations are not legally binding but councils almost always comply.",
  },
  {
    category: "government_council",
    stage: "court",
    stage_order: 4,
    title: "Judicial Review or Specialist Tribunal",
    description:
      "For unlawful council decisions (e.g., planning, housing allocation), you may be able to challenge via the courts or a specialist tribunal.",
    action_required: "Seek legal advice. Pre-action protocol letter required before court.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Administrative Court / relevant tribunal",
    regulatory_url: "https://www.gov.uk/courts-tribunals/administrative-court",
    template_available: false,
    tips:
      "Time limits for judicial review are very short (usually 3 months). Act quickly and seek legal advice urgently.",
  },

  // ─── NHS ────────────────────────────────────────────────────────────────────
  {
    category: "nhs",
    stage: "initial",
    stage_order: 1,
    title: "Complain to the NHS provider",
    description:
      "All NHS providers (GP practices, hospitals, dentists, etc.) must have a formal complaints procedure. You can complain directly to the provider, or to the commissioner (NHS England or the ICB).",
    action_required:
      "Contact the provider's Patient Advice and Liaison Service (PALS) or their formal complaints team. You can also write directly to the chief executive.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: "NHS England / Integrated Care Board",
    regulatory_url: "https://www.england.nhs.uk/contact-us/complaint/",
    template_available: true,
    tips:
      "NHS complaints must normally be made within 12 months of the incident or of when you became aware of it. Providers should acknowledge within 3 working days.",
  },
  {
    category: "nhs",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Formal written complaint — await investigation",
    description:
      "The provider must investigate your complaint and respond with their findings, usually within 25 working days. If they need more time, they must tell you why.",
    action_required:
      "Send or confirm your complaint in writing. Request a written response within 25 working days.",
    wait_period_days: 25,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Ask for a 'keeping you informed' update if you do not hear within 25 days. PALS can support you through this process.",
  },
  {
    category: "nhs",
    stage: "ombudsman",
    stage_order: 3,
    title: "Refer to the Parliamentary and Health Service Ombudsman",
    description:
      "The Parliamentary and Health Service Ombudsman (PHSO) independently investigates complaints about the NHS in England. Their service is free. They can recommend financial compensation and service improvements.",
    action_required:
      "Submit a complaint to the PHSO online. You must have completed the NHS provider's complaints process first.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Parliamentary and Health Service Ombudsman",
    regulatory_url: "https://www.ombudsman.org.uk/",
    template_available: false,
    tips:
      "You must normally refer within 12 months of the NHS final response. The PHSO can take many months to investigate but their decisions carry significant weight.",
  },
  {
    category: "nhs",
    stage: "court",
    stage_order: 4,
    title: "CQC (systemic issues) or civil litigation (clinical negligence)",
    description:
      "The Care Quality Commission (CQC) regulates NHS providers but does not handle individual complaints. For clinical negligence, you may be able to pursue a civil claim.",
    action_required:
      "For clinical negligence: contact a specialist solicitor. For systemic issues: report to CQC.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Care Quality Commission / Civil Courts",
    regulatory_url: "https://www.cqc.org.uk/",
    template_available: false,
    tips:
      "Clinical negligence claims have a 3-year limitation period. Free advice is available from the NHS Resolution or AvMA (Action Against Medical Accidents).",
  },

  // ─── HOUSING ────────────────────────────────────────────────────────────────
  {
    category: "housing",
    stage: "initial",
    stage_order: 1,
    title: "Complain to your landlord or letting agent in writing",
    description:
      "Send a formal written complaint to your landlord or letting agent. Be specific about the issue, the date it started, and what resolution you want. Always in writing — email is fine.",
    action_required:
      "Write an email or letter detailing the complaint. Give 14 days to respond.",
    wait_period_days: 14,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Photograph any issues (damp, broken fixtures, etc.) as evidence. Keep copies of all correspondence.",
  },
  {
    category: "housing",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Escalate within the letting agent's complaints process",
    description:
      "If using a letting agent, they must belong to a redress scheme and have a formal complaints process. Escalate your complaint following their procedure.",
    action_required:
      "Request escalation to senior management within the letting agent. Most have a 2-stage internal process.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Letting agents must be members of either The Property Ombudsman (TPO), Property Redress Scheme (PRS), or similar.",
  },
  {
    category: "housing",
    stage: "final_response",
    stage_order: 3,
    title: "Refer to The Property Ombudsman or Housing Ombudsman",
    description:
      "Letting agents: refer to The Property Ombudsman (TPO) or Property Redress Scheme. Housing associations: refer to the Housing Ombudsman. Private landlords: contact Environmental Health or consider the tribunal.",
    action_required:
      "Submit your complaint to the relevant scheme after exhausting the internal process.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "The Property Ombudsman / Housing Ombudsman",
    regulatory_url: "https://www.tpos.co.uk/",
    template_available: false,
    tips:
      "Housing associations are covered by the Housing Ombudsman Service. Their decisions can be binding. Private landlords are not always covered by a redress scheme.",
  },
  {
    category: "housing",
    stage: "ombudsman",
    stage_order: 4,
    title: "Housing Ombudsman (housing associations)",
    description:
      "If your landlord is a housing association, registered provider, or local council housing department, refer to the Housing Ombudsman Service.",
    action_required:
      "Submit a complaint to the Housing Ombudsman online after completing the landlord's internal process.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Housing Ombudsman Service",
    regulatory_url: "https://www.housing-ombudsman.org.uk/",
    template_available: false,
    tips:
      "Since April 2023, residents can now refer directly to the Housing Ombudsman without needing to wait for a 'designated person' referral.",
  },
  {
    category: "housing",
    stage: "court",
    stage_order: 5,
    title: "Environmental Health, Property Tribunal, or Court",
    description:
      "For habitability issues: contact your council's Environmental Health team (they can issue enforcement notices). For deposit disputes or rent repayment: First-tier Tribunal (Property Chamber). For financial claims: small claims court.",
    action_required:
      "Contact your council's Environmental Health for disrepair issues. Use the Property Chamber for deposit/rent disputes. Use HMCTS for financial claims.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "First-tier Tribunal (Property Chamber)",
    regulatory_url:
      "https://www.gov.uk/courts-tribunals/first-tier-tribunal-property-chamber",
    template_available: true,
    tips:
      "Rent Repayment Orders can require landlords to repay up to 12 months' rent for certain offences. Seek advice from Shelter or Citizens Advice.",
  },

  // ─── RETAIL & SERVICES ─────────────────────────────────────────────────────
  {
    category: "retail",
    stage: "initial",
    stage_order: 1,
    title: "Complain to the retailer or service provider",
    description:
      "Contact the business directly. Under the Consumer Rights Act 2015, you have rights to repair, replacement, or refund for faulty goods and services.",
    action_required:
      "Email or write to the company's customer service or complaints team. State the issue, what you want, and your legal rights under the Consumer Rights Act 2015.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "For goods: you have 30 days for a full refund if faulty. After 30 days, they can offer a repair or replacement first. After 6 months, the burden shifts to them to prove the fault is not inherent.",
  },
  {
    category: "retail",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Formal Letter Before Action (14 days)",
    description:
      "Send a formal 'Letter Before Action' giving the business 14 days to resolve the matter before you pursue it through the courts. This is a legal requirement before small claims.",
    action_required:
      "Send a formal Letter Before Action by email and/or recorded post. State the amount claimed and the deadline.",
    wait_period_days: 14,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Keep the letter professional and factual. Mention that you will pursue the matter via the courts if not resolved.",
  },
  {
    category: "retail",
    stage: "ombudsman",
    stage_order: 3,
    title: "Small Claims Court (up to £10,000)",
    description:
      "For claims up to £10,000 in England and Wales (£5,000 in Scotland via Simple Procedure), you can use the small claims court. The process is designed to be accessible without a solicitor.",
    action_required:
      "File a money claim online at HMCTS. Pay the court fee (typically £35–£455 depending on the amount). Serve the claim on the defendant.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips:
      "Many businesses settle before the hearing once a claim is filed. Court fees are recoverable if you win.",
  },
  {
    category: "retail",
    stage: "court",
    stage_order: 4,
    title: "Alternative Dispute Resolution (ADR) if available",
    description:
      "Some industries have ADR schemes. Check whether the trader belongs to one. ADR is often faster and cheaper than court.",
    action_required:
      "Check the trader's website or ask them which ADR scheme they use. Submit your dispute to the relevant scheme.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Varies by trader",
    regulatory_url: "https://www.gov.uk/find-out-about-alternative-dispute-resolution",
    template_available: false,
    tips:
      "The trader must tell you which ADR scheme they use. They are not legally required to use ADR, but many do.",
  },

  // ─── TRANSPORT ─────────────────────────────────────────────────────────────
  {
    category: "transport",
    stage: "initial",
    stage_order: 1,
    title: "Complain to the transport operator",
    description:
      "Contact the train, bus, or other transport operator directly. Most have a formal complaints procedure and are required to respond promptly.",
    action_required:
      "Submit your complaint via the operator's website, email, or written letter.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "Rail operators must acknowledge complaints within 5 days and respond within 20 days.",
  },
  {
    category: "transport",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Escalate within the operator's process",
    description:
      "If unsatisfied, escalate your complaint to the operator's complaints management team.",
    action_required: "Request escalation or appeal the initial response.",
    wait_period_days: 20,
    deadline_type: "from_response",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "Keep all tickets, receipts, and confirmation emails as evidence.",
  },
  {
    category: "transport",
    stage: "ombudsman",
    stage_order: 3,
    title: "Refer to the Rail Ombudsman or CEDR",
    description:
      "Rail passengers can use the Rail Ombudsman. Airline passengers can use CEDR or the CAA. Bus passengers may contact the Traffic Commissioner.",
    action_required:
      "Submit your complaint to the relevant ADR scheme after completing the operator's process.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Rail Ombudsman / CEDR",
    regulatory_url: "https://www.railombudsman.org/",
    template_available: false,
    tips:
      "You must have received the operator's final response before referring to the Rail Ombudsman.",
  },
  {
    category: "transport",
    stage: "court",
    stage_order: 4,
    title: "Small Claims Court",
    description: "For financial claims up to £10,000.",
    action_required: "Send Letter Before Action (14 days), then file with HMCTS.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips: "Citizen Advice can help you decide if court is proportionate.",
  },

  // ─── EDUCATION ─────────────────────────────────────────────────────────────
  {
    category: "education",
    stage: "initial",
    stage_order: 1,
    title: "Complain to the school, college, or university",
    description:
      "All state schools and higher education institutions must have a formal complaints procedure. Contact the headteacher, principal, or student services as appropriate.",
    action_required:
      "Submit a written complaint to the institution following their published complaints process.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Universities must publish their complaints procedure. Ask for it if not easily found.",
  },
  {
    category: "education",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Formal complaint / appeal stage",
    description:
      "Escalate to the governor, principal, or formal appeals panel depending on the institution type.",
    action_required: "Request escalation per the institution's published procedure.",
    wait_period_days: 28,
    deadline_type: "from_response",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "Keep all communication in writing.",
  },
  {
    category: "education",
    stage: "ombudsman",
    stage_order: 3,
    title: "Office of the Independent Adjudicator (universities) or Ofsted (schools)",
    description:
      "University students can refer to the OIA after exhausting the university's process. School complaints can be referred to the Regional Schools Commissioner or Ofsted.",
    action_required:
      "Submit to the OIA (universities) or contact Ofsted / RSC (schools).",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Office of the Independent Adjudicator / Ofsted",
    regulatory_url: "https://www.oiahe.org.uk/",
    template_available: false,
    tips:
      "OIA decisions are not legally binding but universities almost always comply. Ofsted focuses on systemic issues rather than individual complaints.",
  },
  {
    category: "education",
    stage: "court",
    stage_order: 4,
    title: "Courts or specialist legal routes",
    description:
      "For discrimination claims: Employment Tribunal or County Court. For exclusion disputes: school exclusion independent review panel.",
    action_required: "Seek legal advice. Time limits apply.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Courts / Tribunals",
    regulatory_url: "https://www.gov.uk/courts-tribunals",
    template_available: false,
    tips: "Equality Act 2010 claims must generally be brought within 6 months.",
  },

  // ─── EMPLOYMENT ─────────────────────────────────────────────────────────────
  {
    category: "employment",
    stage: "initial",
    stage_order: 1,
    title: "Raise a grievance with your employer",
    description:
      "Submit a formal written grievance to your employer following their grievance procedure. Be specific about the issue and what you want to happen.",
    action_required:
      "Write a formal grievance letter to HR or your line manager's manager. Request a grievance meeting.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Your employer must have a written grievance procedure. Ask for it if not available. You have the right to be accompanied by a colleague or trade union rep.",
  },
  {
    category: "employment",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Grievance outcome and appeal",
    description:
      "Your employer must respond to your grievance in writing and allow you to appeal the outcome.",
    action_required:
      "If unhappy with the outcome, submit a written appeal. Follow the employer's appeals process.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Document everything. The ACAS Code of Practice on Disciplinary and Grievance Procedures sets out expected standards.",
  },
  {
    category: "employment",
    stage: "ombudsman",
    stage_order: 3,
    title: "ACAS Early Conciliation (mandatory before Employment Tribunal)",
    description:
      "Before you can make a claim to an Employment Tribunal, you must notify ACAS and give them a chance to conciliate. This is mandatory and free. ACAS will attempt to settle the matter before tribunal.",
    action_required:
      "Notify ACAS of your intention to bring an Employment Tribunal claim. ACAS will contact both parties and attempt to resolve the dispute through conciliation.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: "Advisory, Conciliation and Arbitration Service (ACAS)",
    regulatory_url: "https://www.acas.org.uk/",
    template_available: false,
    tips:
      "CRITICAL: Employment Tribunal time limits are strict — generally 3 months minus 1 day from the act complained of (e.g., dismissal date). Contact ACAS immediately.",
  },
  {
    category: "employment",
    stage: "court",
    stage_order: 4,
    title: "Employment Tribunal",
    description:
      "If ACAS conciliation does not resolve the matter, you can submit your Employment Tribunal claim. This covers unfair dismissal, discrimination, unpaid wages, whistleblowing, and more.",
    action_required:
      "Complete ET1 form and submit to the Employment Tribunal within the time limit. You will receive an ACAS Early Conciliation Certificate number.",
    wait_period_days: 0,
    deadline_type: "absolute",
    regulatory_body: "Employment Tribunal",
    regulatory_url: "https://www.gov.uk/employment-tribunals",
    template_available: false,
    tips:
      "CRITICAL TIME LIMIT: You generally have 3 months minus 1 day from the act complained of to bring a claim. This is very strict — missing it will almost certainly bar your claim. Get advice from ACAS or a solicitor urgently.",
  },

  // ─── OTHER ───────────────────────────────────────────────────────────────────
  {
    category: "other",
    stage: "initial",
    stage_order: 1,
    title: "Complain to the organisation directly",
    description:
      "Start by complaining formally to the organisation. Most companies and public bodies have a formal complaints procedure.",
    action_required:
      "Submit a written complaint to the relevant department. Keep copies of everything.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "Always complain in writing so you have a paper trail.",
  },
  {
    category: "other",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Formal escalation",
    description:
      "If the initial response is unsatisfactory, escalate to a senior manager or specialist complaints team.",
    action_required:
      "Send a formal written escalation referencing your original complaint.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips: "State clearly what you want to happen and set a response deadline.",
  },
  {
    category: "other",
    stage: "ombudsman",
    stage_order: 3,
    title: "Alternative Dispute Resolution or Ombudsman",
    description:
      "Many industries have an ombudsman or ADR scheme. Research which body covers your specific complaint.",
    action_required:
      "Identify the relevant ombudsman or ADR scheme and submit your complaint after exhausting the internal process.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Industry-specific ombudsman",
    regulatory_url: "https://www.ombudsmanassociation.org/find-ombudsman",
    template_available: false,
    tips: "Citizens Advice can help you identify the right ombudsman for your case.",
  },
  {
    category: "other",
    stage: "court",
    stage_order: 4,
    title: "Small Claims Court",
    description: "For financial claims up to £10,000.",
    action_required:
      "Send a Letter Before Action (14 days), then file with HMCTS Money Claim Online.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips: "Court fees are recoverable if you win. Many cases settle before the hearing.",
  },

  // ─── LANDLORD & TENANT ───────────────────────────────────────────────────────
  {
    category: "landlord_tenant",
    stage: "initial",
    stage_order: 1,
    title: "Contact your landlord or letting agent",
    description:
      "Write to your landlord or letting agent setting out your complaint — whether it relates to deposit protection, repairs, rent increases, or tenancy issues. Keep a copy of everything.",
    action_required:
      "Send an email or letter to your landlord/agent describing the issue, what you want done, and a reasonable deadline (usually 14 days).",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Always put complaints in writing. If you phone, follow up with an email confirming what was discussed. Keep photos and dated records of any issues.",
  },
  {
    category: "landlord_tenant",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Send a formal complaint citing the relevant legislation",
    description:
      "If the landlord has not responded or resolved the issue within 14 days, send a formal complaint letter citing the relevant legislation (Landlord and Tenant Act 1985, Renters' Rights Act 2026, deposit protection rules). Set a further 14-day deadline.",
    action_required:
      "Send a formal complaint letter referencing the specific legal obligations being breached. Request a written response within 14 days.",
    wait_period_days: 14,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Reference the specific legislation: Section 11 Landlord and Tenant Act 1985 for repairs, deposit protection regulations for deposits, Renters' Rights Act 2026 for rent increases.",
  },
  {
    category: "landlord_tenant",
    stage: "final_response",
    stage_order: 3,
    title: "Contact the deposit scheme or request a deadlock letter",
    description:
      "For deposit disputes: contact the relevant deposit protection scheme (TDS, DPS, or MyDeposits) and apply for free ADR. For repairs: contact your council's Environmental Health team. For rent increases: apply to the First-tier Tribunal (Property Chamber).",
    action_required:
      "Submit your dispute to the relevant body. For deposits, apply through your deposit scheme's ADR process. For repairs, contact Environmental Health. For rent, apply to the Property Tribunal.",
    wait_period_days: 14,
    deadline_type: "from_complaint",
    regulatory_body: "Deposit Protection Schemes (TDS / DPS / MyDeposits)",
    regulatory_url: "https://www.gov.uk/tenancy-deposit-protection",
    template_available: true,
    tips:
      "Deposit ADR through the scheme is free. If the landlord failed to protect your deposit within 30 days, you may be entitled to 1x–3x the deposit amount as a penalty.",
  },
  {
    category: "landlord_tenant",
    stage: "ombudsman",
    stage_order: 4,
    title: "Housing Ombudsman or First-tier Tribunal (Property Chamber)",
    description:
      "For social housing: refer to the Housing Ombudsman Service. For private landlords: apply to the First-tier Tribunal (Property Chamber) for deposit, rent, or service charge disputes. For letting agent complaints: refer to The Property Ombudsman (TPO) or Property Redress Scheme.",
    action_required:
      "Submit your case to the appropriate body with all supporting evidence.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Housing Ombudsman / First-tier Tribunal (Property Chamber)",
    regulatory_url: "https://www.housing-ombudsman.org.uk/",
    template_available: true,
    tips:
      "The First-tier Tribunal can award compensation for unprotected deposits (1x–3x the deposit). The Housing Ombudsman handles social housing complaints and can order remedies.",
  },
  {
    category: "landlord_tenant",
    stage: "court",
    stage_order: 5,
    title: "County Court for damages or enforcement",
    description:
      "If the ombudsman or tribunal route is not available or has been exhausted, you can pursue a claim through the County Court for damages, injunctions, or enforcement of tribunal orders.",
    action_required:
      "Send a Letter Before Action giving 14 days to respond, then file a claim at HMCTS Money Claim Online.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips:
      "Small claims court handles claims up to £10,000 without needing a solicitor. Rent Repayment Orders can require landlords to repay up to 12 months' rent for certain offences.",
  },

  // ─── PARKING TICKETS & PRIVATE PCN ───────────────────────────────────────────
  {
    category: "parking_pcn",
    stage: "initial",
    stage_order: 1,
    title: "Challenge the parking charge informally",
    description:
      "Within 28 days of receiving a private Parking Charge Notice (PCN), you can make an informal challenge to the parking company. Many charges are reduced or cancelled at this stage.",
    action_required:
      "Write to the parking company within 28 days challenging the charge. State your grounds clearly (unclear signage, mitigating circumstances, wrong vehicle, etc.).",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Do NOT ignore a private parking charge — it will not just go away. However, a PCN from a private company is NOT a fine (it is an invoice). You have the right to appeal.",
  },
  {
    category: "parking_pcn",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Formal appeal to the parking operator",
    description:
      "If the informal challenge is rejected, submit a formal appeal to the parking company. Reference the BPA or IPC Code of Practice and the Protection of Freedoms Act 2012 (keeper liability provisions).",
    action_required:
      "Submit a formal written appeal citing the relevant code of practice. Include photographic evidence of signage, your ticket, and any mitigating circumstances.",
    wait_period_days: 28,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Most private parking companies are members of either the BPA (British Parking Association) or the IPC (International Parking Community). Check the PCN to see which. This determines your appeal route.",
  },
  {
    category: "parking_pcn",
    stage: "final_response",
    stage_order: 3,
    title: "Appeal to POPLA (BPA members) or IAS (IPC members)",
    description:
      "If the parking company rejects your appeal, you can escalate to the independent appeals service: POPLA for BPA members or IAS for IPC members. This is free and their decision is binding on the operator.",
    action_required:
      "Submit your appeal to POPLA (popla.co.uk) or IAS (theias.org) within 28 days of the operator's rejection. Include all evidence.",
    wait_period_days: 28,
    deadline_type: "from_response",
    regulatory_body: "POPLA / IAS (Independent Appeals Service)",
    regulatory_url: "https://www.popla.co.uk/",
    template_available: true,
    tips:
      "POPLA/IAS decisions are binding on the parking company — if they rule in your favour, the charge must be cancelled. If they rule against you, you can still choose to pay or let the company pursue through court.",
  },
  {
    category: "parking_pcn",
    stage: "court",
    stage_order: 5,
    title: "Defend in County Court if the company pursues",
    description:
      "If you lose at POPLA/IAS or choose not to appeal, the parking company may pursue the debt through the County Court. You can defend the claim and many cases are won by motorists.",
    action_required:
      "If you receive a County Court claim, file a defence within 14 days. Reference the Protection of Freedoms Act 2012 Schedule 4 (keeper liability), inadequate signage, and disproportionate charges.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips:
      "Many parking companies do not actually pursue court action. If they do, a well-evidenced defence often succeeds. The landmark case ParkingEye v Beavis [2015] set the precedent for what constitutes a reasonable charge.",
  },

  // ─── RETAIL & ONLINE SHOPPING ────────────────────────────────────────────────
  {
    category: "retail_shopping",
    stage: "initial",
    stage_order: 1,
    title: "Contact the retailer or seller",
    description:
      "Contact the retailer directly about your complaint. Under the Consumer Rights Act 2015, goods must be of satisfactory quality, fit for purpose, and as described. You have a 30-day short-term right to reject faulty goods for a full refund.",
    action_required:
      "Email or write to the retailer's customer service team. State the issue, what you want (refund, repair, or replacement), and cite your rights under the Consumer Rights Act 2015.",
    wait_period_days: 0,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Always complain to the retailer, not the manufacturer — it is the retailer who is legally responsible. Keep your receipt, order confirmation, and any photos of the fault.",
  },
  {
    category: "retail_shopping",
    stage: "formal_complaint",
    stage_order: 2,
    title: "Formal complaint under Consumer Rights Act 2015",
    description:
      "If the retailer has not resolved your complaint within 14 days, send a formal complaint citing specific sections of the Consumer Rights Act 2015. Within 30 days: short-term right to reject (s.22). After 30 days: right to repair/replacement (s.23). After failed repair: final right to reject (s.24).",
    action_required:
      "Send a formal complaint letter or email citing the specific CRA 2015 sections applicable to your situation. Set a 14-day deadline for resolution.",
    wait_period_days: 14,
    deadline_type: "from_complaint",
    regulatory_body: null,
    regulatory_url: null,
    template_available: true,
    tips:
      "Within the first 6 months, the burden of proof is on the retailer to show the goods were not faulty at delivery. After 6 months, the burden shifts to you.",
  },
  {
    category: "retail_shopping",
    stage: "final_response",
    stage_order: 3,
    title: "Section 75 claim or ADR",
    description:
      "If you paid by credit card (£100–£30,000), make a Section 75 claim to your card provider — they are jointly liable. Otherwise, check if the retailer belongs to an ADR scheme (e.g. Retail ADR). If not, proceed to Letter Before Action.",
    action_required:
      "For Section 75: write to your credit card provider with purchase details and evidence of the retailer's breach. For ADR: submit through the relevant scheme.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Retail ADR / Financial Ombudsman Service",
    regulatory_url: "https://www.retailadr.org.uk/",
    template_available: true,
    tips:
      "Section 75 claims are very powerful — your credit card company is equally liable as the retailer. They must investigate within 8 weeks. If rejected, escalate the S.75 claim to the Financial Ombudsman.",
  },
  {
    category: "retail_shopping",
    stage: "ombudsman",
    stage_order: 4,
    title: "ADR scheme or Financial Ombudsman",
    description:
      "If your Section 75 claim is rejected, refer to the Financial Ombudsman Service. If you did not pay by credit card, check if the retailer participates in Retail ADR or another ADR scheme.",
    action_required:
      "Submit your complaint to the Financial Ombudsman (for rejected S.75 claims) or the relevant ADR scheme with full evidence.",
    wait_period_days: 0,
    deadline_type: null,
    regulatory_body: "Financial Ombudsman Service / Retail ADR",
    regulatory_url: "https://www.financial-ombudsman.org.uk/",
    template_available: true,
    tips:
      "The FOS is free and handles Section 75 disputes. They can award up to £415,000. You have 6 months from the card provider's final response to refer to the FOS.",
  },
  {
    category: "retail_shopping",
    stage: "court",
    stage_order: 5,
    title: "Small Claims Court",
    description:
      "For claims up to £10,000 in England and Wales, file a small claims court claim. Send a Letter Before Action first giving 14 days to respond.",
    action_required:
      "Send a Letter Before Action, then file at HMCTS Money Claim Online if unresolved.",
    wait_period_days: 14,
    deadline_type: "from_response",
    regulatory_body: "His Majesty's Courts and Tribunals Service",
    regulatory_url: "https://www.gov.uk/make-court-claim-for-money",
    template_available: true,
    tips:
      "Small claims court does not require a solicitor. Court fees range from £35–£455 depending on the claim amount. You can recover these if you win.",
  },
];

/**
 * Seeds the escalation_rules table. Intended to be called from a Server Action
 * or Supabase MCP — requires service_role access since RLS blocks inserts from
 * authenticated users on this table.
 *
 * Usage (Server Action, called with service role client):
 * await seedEscalationRules(serviceRoleSupabaseClient);
 */
export async function seedEscalationRules(supabase: {
  from: (table: string) => {
    upsert: (
      data: EscalationRuleInsert[],
      options: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  };
}) {
  const { error } = await supabase
    .from("escalation_rules")
    .upsert(ESCALATION_RULES_SEED, {
      onConflict: "category,stage_order",
    });

  if (error) {
    throw new Error(`Failed to seed escalation rules: ${error.message}`);
  }

  return { seeded: ESCALATION_RULES_SEED.length };
}
