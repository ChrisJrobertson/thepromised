-- ============================================================================
-- Migration: Add 3 new complaint categories (landlord_tenant, parking_pcn, retail_shopping)
-- ============================================================================

-- 1. Extend category CHECK constraints on organisations and cases tables
-- Drop and re-create the check constraint on organisations.category
ALTER TABLE public.organisations DROP CONSTRAINT IF EXISTS organisations_category_check;
ALTER TABLE public.organisations ADD CONSTRAINT organisations_category_check
  CHECK (category IN (
    'energy', 'water', 'broadband_phone', 'financial_services',
    'insurance', 'government_hmrc', 'government_dwp', 'government_council',
    'nhs', 'housing', 'retail', 'transport', 'education', 'employment',
    'landlord_tenant', 'parking_pcn', 'retail_shopping', 'other'
  ));

-- cases.category has no explicit CHECK in the original schema, but add one for safety
-- (If already exists, drop it first)
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_category_check;

-- 2. Insert escalation rules for the 3 new categories
-- ── LANDLORD & TENANT ────────────────────────────────────────────────────────
INSERT INTO public.escalation_rules (category, stage, stage_order, title, description, action_required, wait_period_days, deadline_type, regulatory_body, regulatory_url, template_available, tips)
VALUES
  ('landlord_tenant', 'initial', 1,
   'Contact your landlord or letting agent',
   'Write to your landlord or letting agent setting out your complaint — whether it relates to deposit protection, repairs, rent increases, or tenancy issues. Keep a copy of everything.',
   'Send an email or letter to your landlord/agent describing the issue, what you want done, and a reasonable deadline (usually 14 days).',
   0, 'from_complaint', NULL, NULL, true,
   'Always put complaints in writing. If you phone, follow up with an email confirming what was discussed. Keep photos and dated records of any issues.'),

  ('landlord_tenant', 'formal_complaint', 2,
   'Send a formal complaint citing the relevant legislation',
   'If the landlord has not responded or resolved the issue within 14 days, send a formal complaint letter citing the relevant legislation (Landlord and Tenant Act 1985, Renters'' Rights Act 2026, deposit protection rules). Set a further 14-day deadline.',
   'Send a formal complaint letter referencing the specific legal obligations being breached. Request a written response within 14 days.',
   14, 'from_complaint', NULL, NULL, true,
   'Reference the specific legislation: Section 11 Landlord and Tenant Act 1985 for repairs, deposit protection regulations for deposits, Renters'' Rights Act 2026 for rent increases.'),

  ('landlord_tenant', 'final_response', 3,
   'Contact the deposit scheme or request a deadlock letter',
   'For deposit disputes: contact the relevant deposit protection scheme (TDS, DPS, or MyDeposits) and apply for free ADR. For repairs: contact your council''s Environmental Health team. For rent increases: apply to the First-tier Tribunal (Property Chamber).',
   'Submit your dispute to the relevant body. For deposits, apply through your deposit scheme''s ADR process. For repairs, contact Environmental Health. For rent, apply to the Property Tribunal.',
   14, 'from_complaint',
   'Deposit Protection Schemes (TDS / DPS / MyDeposits)',
   'https://www.gov.uk/tenancy-deposit-protection',
   true,
   'Deposit ADR through the scheme is free. If the landlord failed to protect your deposit within 30 days, you may be entitled to 1x–3x the deposit amount as a penalty.'),

  ('landlord_tenant', 'ombudsman', 4,
   'Housing Ombudsman or First-tier Tribunal (Property Chamber)',
   'For social housing: refer to the Housing Ombudsman Service. For private landlords: apply to the First-tier Tribunal (Property Chamber) for deposit, rent, or service charge disputes. For letting agent complaints: refer to The Property Ombudsman (TPO) or Property Redress Scheme.',
   'Submit your case to the appropriate body with all supporting evidence.',
   0, NULL,
   'Housing Ombudsman / First-tier Tribunal (Property Chamber)',
   'https://www.housing-ombudsman.org.uk/',
   true,
   'The First-tier Tribunal can award compensation for unprotected deposits (1x–3x the deposit). The Housing Ombudsman handles social housing complaints and can order remedies.'),

  ('landlord_tenant', 'court', 5,
   'County Court for damages or enforcement',
   'If the ombudsman or tribunal route is not available or has been exhausted, you can pursue a claim through the County Court for damages, injunctions, or enforcement of tribunal orders.',
   'Send a Letter Before Action giving 14 days to respond, then file a claim at HMCTS Money Claim Online.',
   14, 'from_response',
   'His Majesty''s Courts and Tribunals Service',
   'https://www.gov.uk/make-court-claim-for-money',
   true,
   'Small claims court handles claims up to £10,000 without needing a solicitor. Rent Repayment Orders can require landlords to repay up to 12 months'' rent for certain offences.'),

-- ── PARKING TICKETS & PRIVATE PCN ────────────────────────────────────────────
  ('parking_pcn', 'initial', 1,
   'Challenge the parking charge informally',
   'Within 28 days of receiving a private Parking Charge Notice (PCN), you can make an informal challenge to the parking company. Many charges are reduced or cancelled at this stage.',
   'Write to the parking company within 28 days challenging the charge. State your grounds clearly (unclear signage, mitigating circumstances, wrong vehicle, etc.).',
   0, 'from_complaint', NULL, NULL, true,
   'Do NOT ignore a private parking charge — it will not just go away. However, a PCN from a private company is NOT a fine (it is an invoice). You have the right to appeal.'),

  ('parking_pcn', 'formal_complaint', 2,
   'Formal appeal to the parking operator',
   'If the informal challenge is rejected, submit a formal appeal to the parking company. Reference the BPA or IPC Code of Practice and the Protection of Freedoms Act 2012 (keeper liability provisions).',
   'Submit a formal written appeal citing the relevant code of practice. Include photographic evidence of signage, your ticket, and any mitigating circumstances.',
   28, 'from_complaint', NULL, NULL, true,
   'Most private parking companies are members of either the BPA (British Parking Association) or the IPC (International Parking Community). Check the PCN to see which. This determines your appeal route.'),

  ('parking_pcn', 'final_response', 3,
   'Appeal to POPLA (BPA members) or IAS (IPC members)',
   'If the parking company rejects your appeal, you can escalate to the independent appeals service: POPLA for BPA members or IAS for IPC members. This is free and their decision is binding on the operator.',
   'Submit your appeal to POPLA (popla.co.uk) or IAS (theias.org) within 28 days of the operator''s rejection. Include all evidence.',
   28, 'from_response',
   'POPLA / IAS (Independent Appeals Service)',
   'https://www.popla.co.uk/',
   true,
   'POPLA/IAS decisions are binding on the parking company — if they rule in your favour, the charge must be cancelled. If they rule against you, you can still choose to pay or let the company pursue through court.'),

  ('parking_pcn', 'court', 5,
   'Defend in County Court if the company pursues',
   'If you lose at POPLA/IAS or choose not to appeal, the parking company may pursue the debt through the County Court. You can defend the claim and many cases are won by motorists.',
   'If you receive a County Court claim, file a defence within 14 days. Reference the Protection of Freedoms Act 2012 Schedule 4 (keeper liability), inadequate signage, and disproportionate charges.',
   14, 'from_response',
   'His Majesty''s Courts and Tribunals Service',
   'https://www.gov.uk/make-court-claim-for-money',
   true,
   'Many parking companies do not actually pursue court action. If they do, a well-evidenced defence often succeeds. The landmark case ParkingEye v Beavis [2015] set the precedent for what constitutes a reasonable charge.'),

-- ── RETAIL & ONLINE SHOPPING ─────────────────────────────────────────────────
  ('retail_shopping', 'initial', 1,
   'Contact the retailer or seller',
   'Contact the retailer directly about your complaint. Under the Consumer Rights Act 2015, goods must be of satisfactory quality, fit for purpose, and as described. You have a 30-day short-term right to reject faulty goods for a full refund.',
   'Email or write to the retailer''s customer service team. State the issue, what you want (refund, repair, or replacement), and cite your rights under the Consumer Rights Act 2015.',
   0, 'from_complaint', NULL, NULL, true,
   'Always complain to the retailer, not the manufacturer — it is the retailer who is legally responsible. Keep your receipt, order confirmation, and any photos of the fault.'),

  ('retail_shopping', 'formal_complaint', 2,
   'Formal complaint under Consumer Rights Act 2015',
   'If the retailer has not resolved your complaint within 14 days, send a formal complaint citing specific sections of the Consumer Rights Act 2015. Within 30 days: short-term right to reject (s.22). After 30 days: right to repair/replacement (s.23). After failed repair: final right to reject (s.24).',
   'Send a formal complaint letter or email citing the specific CRA 2015 sections applicable to your situation. Set a 14-day deadline for resolution.',
   14, 'from_complaint', NULL, NULL, true,
   'Within the first 6 months, the burden of proof is on the retailer to show the goods were not faulty at delivery. After 6 months, the burden shifts to you.'),

  ('retail_shopping', 'final_response', 3,
   'Section 75 claim or ADR',
   'If you paid by credit card (£100–£30,000), make a Section 75 claim to your card provider — they are jointly liable. Otherwise, check if the retailer belongs to an ADR scheme (e.g. Retail ADR). If not, proceed to Letter Before Action.',
   'For Section 75: write to your credit card provider with purchase details and evidence of the retailer''s breach. For ADR: submit through the relevant scheme.',
   0, NULL,
   'Retail ADR / Financial Ombudsman Service',
   'https://www.retailadr.org.uk/',
   true,
   'Section 75 claims are very powerful — your credit card company is equally liable as the retailer. They must investigate within 8 weeks. If rejected, escalate the S.75 claim to the Financial Ombudsman.'),

  ('retail_shopping', 'ombudsman', 4,
   'ADR scheme or Financial Ombudsman',
   'If your Section 75 claim is rejected, refer to the Financial Ombudsman Service. If you did not pay by credit card, check if the retailer participates in Retail ADR or another ADR scheme.',
   'Submit your complaint to the Financial Ombudsman (for rejected S.75 claims) or the relevant ADR scheme with full evidence.',
   0, NULL,
   'Financial Ombudsman Service / Retail ADR',
   'https://www.financial-ombudsman.org.uk/',
   true,
   'The FOS is free and handles Section 75 disputes. They can award up to £415,000. You have 6 months from the card provider''s final response to refer to the FOS.'),

  ('retail_shopping', 'court', 5,
   'Small Claims Court',
   'For claims up to £10,000 in England and Wales, file a small claims court claim. Send a Letter Before Action first giving 14 days to respond.',
   'Send a Letter Before Action, then file at HMCTS Money Claim Online if unresolved.',
   14, 'from_response',
   'His Majesty''s Courts and Tribunals Service',
   'https://www.gov.uk/make-court-claim-for-money',
   true,
   'Small claims court does not require a solicitor. Court fees range from £35–£455 depending on the claim amount. You can recover these if you win.');

-- 3. Insert new organisations for the new categories
INSERT INTO public.organisations (name, category, website, complaint_phone, complaint_email, complaint_address, ombudsman_name, ombudsman_url, escalation_wait_weeks, is_verified, notes)
VALUES
  -- Landlord & Tenant
  ('TDS (Tenancy Deposit Scheme)', 'landlord_tenant', 'https://www.tenancydepositscheme.com', '0300 037 1000', NULL, NULL,
   'TDS ADR (free through scheme)', 'https://www.tenancydepositscheme.com/raise-a-dispute/', NULL, true,
   'Deposit protection scheme. If your deposit is protected with TDS, you can apply for free ADR through them.'),
  ('DPS (Deposit Protection Service)', 'landlord_tenant', 'https://www.depositprotection.com', '0330 303 0030', NULL, NULL,
   'DPS ADR (free through scheme)', 'https://www.depositprotection.com/disputes/', NULL, true,
   'Deposit protection scheme. Free ADR for disputes over protected deposits.'),
  ('MyDeposits', 'landlord_tenant', 'https://www.mydeposits.co.uk', '0333 321 9401', NULL, NULL,
   'MyDeposits ADR (free through scheme)', 'https://www.mydeposits.co.uk/tenants/disputes/', NULL, true,
   'Deposit protection scheme. Free dispute resolution for protected deposits.'),
  ('Housing Ombudsman Service', 'landlord_tenant', 'https://www.housing-ombudsman.org.uk', '0300 111 3000', 'info@housing-ombudsman.org.uk', NULL,
   'Housing Ombudsman Service', 'https://www.housing-ombudsman.org.uk/', NULL, true,
   'Handles complaints about social housing landlords (housing associations, councils). Residents can refer directly since April 2023.'),
  ('First-tier Tribunal (Property Chamber)', 'landlord_tenant', 'https://www.gov.uk/courts-tribunals/first-tier-tribunal-property-chamber', NULL, NULL, NULL,
   'First-tier Tribunal (Property Chamber)', 'https://www.gov.uk/courts-tribunals/first-tier-tribunal-property-chamber', NULL, true,
   'Handles deposit disputes, rent increases, service charges, and leasehold disputes for private tenants.'),

  -- Parking
  ('ParkingEye', 'parking_pcn', 'https://www.parkingeye.co.uk', NULL, 'appeals@parkingeye.co.uk', 'ParkingEye Ltd, Lostock Office Park, Lynstock Way, Bolton BL6 4SG',
   'POPLA', 'https://www.popla.co.uk/', NULL, true,
   'BPA member. Appeals go to POPLA. One of the UK''s largest private parking operators.'),
  ('APCOA Parking', 'parking_pcn', 'https://www.apcoa.co.uk', NULL, 'appeals@apcoa.co.uk', NULL,
   'IAS', 'https://www.theias.org/', NULL, true,
   'IPC member. Appeals go to IAS (Independent Appeals Service).'),
  ('Euro Car Parks', 'parking_pcn', 'https://www.eurocarparks.com', NULL, 'appeals@eurocarparks.com', NULL,
   'IAS', 'https://www.theias.org/', NULL, true,
   'IPC member. Appeals go to IAS.'),
  ('NCP', 'parking_pcn', 'https://www.ncp.co.uk', '0345 050 7080', NULL, NULL,
   'POPLA', 'https://www.popla.co.uk/', NULL, true,
   'BPA member. Appeals go to POPLA.'),
  ('POPLA', 'parking_pcn', 'https://www.popla.co.uk', NULL, NULL, NULL,
   'POPLA (is the appeals service)', 'https://www.popla.co.uk/', NULL, true,
   'Independent appeals service for BPA member parking companies. Free to use. Decisions binding on the operator.'),
  ('IAS (Independent Appeals Service)', 'parking_pcn', 'https://www.theias.org', NULL, NULL, NULL,
   'IAS (is the appeals service)', 'https://www.theias.org/', NULL, true,
   'Independent appeals service for IPC member parking companies. Free to use.'),

  -- Retail & Online Shopping
  ('Amazon UK', 'retail_shopping', 'https://www.amazon.co.uk', '0800 279 7234', NULL, 'Amazon UK Services Ltd, 1 Principal Place, London EC2A 2FA',
   'Retail ADR / Small Claims Court', 'https://www.retailadr.org.uk/', NULL, true, NULL),
  ('eBay UK', 'retail_shopping', 'https://www.ebay.co.uk', NULL, NULL, 'eBay (UK) Limited, Hotham House, 1 Heron Square, Richmond TW9 1EJ',
   'Retail ADR / Small Claims Court', 'https://www.retailadr.org.uk/', NULL, true, NULL),
  ('Argos', 'retail_shopping', 'https://www.argos.co.uk', '0345 165 7910', NULL, NULL,
   'Retail ADR / Small Claims Court', 'https://www.retailadr.org.uk/', NULL, true, NULL),
  ('John Lewis', 'retail_shopping', 'https://www.johnlewis.com', '0330 123 3550', NULL, NULL,
   'Retail ADR / Small Claims Court', 'https://www.retailadr.org.uk/', NULL, true, NULL),
  ('Currys', 'retail_shopping', 'https://www.currys.co.uk', '0344 561 1234', 'customerservices@currys.co.uk', NULL,
   'Retail ADR / Small Claims Court', 'https://www.retailadr.org.uk/', NULL, true, NULL),
  ('ASOS', 'retail_shopping', 'https://www.asos.com', NULL, 'customercare@asos.com', NULL,
   'Retail ADR / Small Claims Court', 'https://www.retailadr.org.uk/', NULL, true, NULL),
  ('Retail ADR', 'retail_shopping', 'https://www.retailadr.org.uk', NULL, NULL, NULL,
   'Retail ADR (is the ADR scheme)', 'https://www.retailadr.org.uk/', NULL, true,
   'Alternative Dispute Resolution scheme for retail complaints. Free to consumers. Check if the retailer is a member before submitting.')
ON CONFLICT (name) DO NOTHING;

-- 4. Insert guided journey templates for the 3 new categories
-- ── Landlord Deposit Dispute journey ─────────────────────────────────────────
INSERT INTO journey_templates (id, category, title, description, sector, is_active, steps) VALUES (
  'landlord-deposit-dispute',
  'landlord_deposit_dispute',
  'Landlord Deposit Dispute',
  'Step-by-step guide to recovering your tenancy deposit when your landlord has not returned it or has made unfair deductions.',
  'housing',
  true,
  $steps$
[
  {"step_id": "gather-evidence", "order": 1, "title": "Gather your deposit evidence", "description": "Before contacting your landlord, collect all the evidence you need to support your claim. The stronger your evidence, the more likely you are to recover your deposit.", "action_type": "checklist", "action_config": {"items": ["Find your tenancy agreement — check the deposit amount and any clauses about deductions", "Locate your check-in inventory and check-out inventory (or take dated photos of the property now if you are still in it)", "Find the deposit protection certificate and prescribed information (your landlord must have given you these within 30 days of receiving the deposit)", "Check which scheme your deposit is protected with (TDS, DPS, or MyDeposits)", "Gather receipts for any cleaning or repairs you carried out", "Save all correspondence with your landlord about the deposit"], "tip": "If your landlord did not protect your deposit within 30 days or did not give you the prescribed information, you may be entitled to compensation of 1x–3x the deposit amount via the County Court."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "send-demand-letter"},
  {"step_id": "send-demand-letter", "order": 2, "title": "Send a deposit return demand letter", "description": "Write to your landlord formally requesting the return of your deposit. Give them 14 days to respond. This letter cites the relevant deposit protection rules and serves as evidence that you attempted to resolve the matter before escalating.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "landlord_deposit_demand"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 14, "wait_message": "Give your landlord 14 days to return the deposit or respond to your letter.", "next_step": "assess-response"},
  {"step_id": "assess-response", "order": 3, "title": "What did your landlord say?", "description": "Has your landlord returned your deposit or responded to your demand?", "action_type": "branch", "action_config": {"question": "How did your landlord respond?", "options": [{"label": "Deposit returned in full — resolved", "next_step": "resolved"}, {"label": "Partial return — unfair deductions", "next_step": "contact-scheme"}, {"label": "No response or refused", "next_step": "contact-scheme"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "contact-scheme"},
  {"step_id": "contact-scheme", "order": 4, "title": "Apply for free ADR through your deposit scheme", "description": "Contact the deposit protection scheme (TDS, DPS, or MyDeposits) and apply for their free Alternative Dispute Resolution (ADR) service. Both you and the landlord submit evidence and the scheme makes a binding decision.", "action_type": "escalate", "action_config": {"letter_type": "adr_referral", "auto_generate": true, "prompt_context": "landlord_deposit_adr", "export_pdf": true, "escalation_target": "Your deposit protection scheme (TDS / DPS / MyDeposits)", "escalation_url": "https://www.gov.uk/tenancy-deposit-protection", "escalation_method": "Online form through your deposit scheme"}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "wait_message": "The deposit scheme will contact both parties. ADR typically takes 4–6 weeks.", "next_step": "assess-adr"},
  {"step_id": "assess-adr", "order": 5, "title": "ADR outcome — what happened?", "description": "The deposit scheme has made a decision. Was it in your favour?", "action_type": "branch", "action_config": {"question": "What was the ADR outcome?", "options": [{"label": "Full or satisfactory award — resolved", "next_step": "resolved"}, {"label": "Unsatisfactory outcome — I want to go further", "next_step": "tribunal"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "tribunal"},
  {"step_id": "tribunal", "order": 6, "title": "Apply to the First-tier Tribunal (Property Chamber)", "description": "If ADR fails or if your deposit was never protected (making you eligible for 1x–3x penalty), apply to the First-tier Tribunal. This is especially relevant if the landlord failed to protect your deposit within 30 days.", "action_type": "info", "action_config": {"tip": "Under Section 214 of the Housing Act 2004, if a landlord fails to protect a deposit or provide prescribed information, the court must order them to pay between 1x and 3x the deposit amount. The tribunal application fee is modest and you do not need a solicitor."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "resolved"},
  {"step_id": "resolved", "order": 99, "title": "Case resolved", "description": "Record your outcome — how much was returned and what route worked. This helps other tenants know what to expect.", "action_type": "resolve", "action_config": {"trigger_outcome_form": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": null}
]
$steps$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  sector = EXCLUDED.sector,
  steps = EXCLUDED.steps,
  is_active = EXCLUDED.is_active;

-- ── Parking PCN Appeal journey ───────────────────────────────────────────────
INSERT INTO journey_templates (id, category, title, description, sector, is_active, steps) VALUES (
  'parking-pcn-appeal',
  'parking_pcn_appeal',
  'Parking PCN Appeal',
  'Step-by-step guide to appealing a private parking charge notice (PCN), from gathering evidence through to POPLA/IAS and defending in court if needed.',
  'transport',
  true,
  $steps$
[
  {"step_id": "gather-evidence", "order": 1, "title": "Gather your evidence", "description": "Collect all the evidence you need to challenge the parking charge. Good evidence is the key to a successful appeal.", "action_type": "checklist", "action_config": {"items": ["Photograph the parking signage at the location (all signs visible from where you parked)", "Keep a copy of the PCN (Parking Charge Notice) — note the date, time, location, and amount", "Check whether the parking company is a BPA or IPC member (this determines your appeal route)", "Note any mitigating circumstances (e.g. medical emergency, broken payment machine, returning within grace period)", "Check if the PCN was issued to you as the driver or the registered keeper (this affects liability under the Protection of Freedoms Act 2012)", "Photograph your parking ticket or payment receipt if you had one"], "tip": "The Protection of Freedoms Act 2012 Schedule 4 governs keeper liability. The parking company must follow strict procedures — if they have not, the charge may be unenforceable against the registered keeper."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "appeal-to-operator"},
  {"step_id": "appeal-to-operator", "order": 2, "title": "Appeal to the parking operator", "description": "Submit your formal appeal to the parking company within 28 days of receiving the PCN. Most companies have an online appeal form or accept written appeals.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "parking_pcn_operator_appeal"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 28, "wait_message": "The parking operator must respond within 28 days. Many appeals succeed at this stage.", "next_step": "assess-operator-response"},
  {"step_id": "assess-operator-response", "order": 3, "title": "What did the operator say?", "description": "Has the parking company accepted your appeal?", "action_type": "branch", "action_config": {"question": "How did the parking company respond?", "options": [{"label": "Appeal accepted — charge cancelled", "next_step": "resolved"}, {"label": "Appeal rejected", "next_step": "popla-or-ias"}, {"label": "No response within 28 days", "next_step": "popla-or-ias"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "popla-or-ias"},
  {"step_id": "popla-or-ias", "order": 4, "title": "Appeal to POPLA or IAS", "description": "You have 28 days from the operator's rejection to appeal to the independent appeals service. POPLA handles appeals for BPA member companies. IAS handles IPC member companies. This is free and their decision is binding on the operator.", "action_type": "send_letter", "action_config": {"letter_type": "adr_referral", "auto_generate": true, "prompt_context": "parking_pcn_popla_appeal", "export_pdf": true}, "completion_criteria": {"type": "letter_sent", "letter_type": "adr_referral"}, "wait_after_days": 28, "wait_message": "POPLA/IAS will review your case and issue a decision. This typically takes 2–4 weeks.", "next_step": "assess-popla-response"},
  {"step_id": "assess-popla-response", "order": 5, "title": "POPLA/IAS decision", "description": "What was the independent appeals service's decision?", "action_type": "branch", "action_config": {"question": "What was the POPLA/IAS decision?", "options": [{"label": "Appeal upheld — charge cancelled", "next_step": "resolved"}, {"label": "Appeal rejected — I want to pay and move on", "next_step": "resolved"}, {"label": "Appeal rejected — I want to defend in court if they pursue", "next_step": "court-defence"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "court-defence"},
  {"step_id": "court-defence", "order": 6, "title": "Prepare to defend in County Court", "description": "If you lose at POPLA/IAS and refuse to pay, the parking company may pursue the debt through the County Court. Many do not follow through. If they do, you can file a defence. Send a Letter Before Action in response to any threats of court proceedings.", "action_type": "send_letter", "action_config": {"letter_type": "letter_before_action", "auto_generate": true, "prompt_context": "parking_pcn_court_defence"}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "resolved"},
  {"step_id": "resolved", "order": 99, "title": "Case resolved", "description": "Record your outcome — whether the charge was cancelled, reduced, paid, or defended in court. This helps other motorists.", "action_type": "resolve", "action_config": {"trigger_outcome_form": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": null}
]
$steps$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  sector = EXCLUDED.sector,
  steps = EXCLUDED.steps,
  is_active = EXCLUDED.is_active;

-- ── Faulty Product Return journey ────────────────────────────────────────────
INSERT INTO journey_templates (id, category, title, description, sector, is_active, steps) VALUES (
  'faulty-product-return',
  'faulty_product_return',
  'Faulty Product Return',
  'Step-by-step guide to getting a refund, repair, or replacement for a faulty product under the Consumer Rights Act 2015, including Section 75 credit card claims.',
  'retail',
  true,
  $steps$
[
  {"step_id": "gather-evidence", "order": 1, "title": "Document the fault", "description": "Before contacting the retailer, gather all the evidence you need to prove the product is faulty.", "action_type": "checklist", "action_config": {"items": ["Photograph or video the fault clearly", "Find your receipt, order confirmation, or proof of purchase", "Note the purchase date and delivery date (this determines your rights)", "Check if you paid by credit card (for purchases £100–£30,000, you may have Section 75 rights)", "Keep the product — do not return it until the retailer agrees to accept it back", "Write down what the product should do vs what it actually does"], "tip": "Under the Consumer Rights Act 2015, goods must be of satisfactory quality (s.9), fit for purpose (s.10), and as described (s.11). Within 30 days you have an absolute right to a full refund for faulty goods."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "check-30-days"},
  {"step_id": "check-30-days", "order": 2, "title": "Is the product less than 30 days old?", "description": "Your rights depend on when you purchased the product.", "action_type": "branch", "action_config": {"question": "When did you purchase the product?", "options": [{"label": "Less than 30 days ago — I want a full refund", "next_step": "send-reject-letter"}, {"label": "More than 30 days ago", "next_step": "send-repair-letter"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "send-reject-letter"},
  {"step_id": "send-reject-letter", "order": 3, "title": "Exercise your short-term right to reject", "description": "Within 30 days you have an absolute right to a full refund — the retailer cannot insist on a repair first. This letter formally rejects the goods and requests a refund.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "retail_product_reject"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 14, "wait_message": "Give the retailer 14 days to process your refund.", "next_step": "assess-retailer-response"},
  {"step_id": "send-repair-letter", "order": 4, "title": "Request a repair or replacement", "description": "After 30 days, the retailer gets one chance to repair or replace. If the repair fails or takes too long, you can demand a refund under the final right to reject.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "retail_product_repair"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 14, "wait_message": "Give the retailer 14 days to arrange the repair or replacement.", "next_step": "assess-retailer-response"},
  {"step_id": "assess-retailer-response", "order": 5, "title": "Did the retailer resolve it?", "description": "Has the retailer provided a refund, repair, or replacement?", "action_type": "branch", "action_config": {"question": "How did the retailer respond?", "options": [{"label": "Refund or satisfactory resolution — resolved", "next_step": "resolved"}, {"label": "Refused or no response", "next_step": "check-credit-card"}, {"label": "Repair failed or took too long", "next_step": "check-credit-card"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "check-credit-card"},
  {"step_id": "check-credit-card", "order": 6, "title": "Did you pay by credit card?", "description": "If you paid by credit card for an item costing between £100 and £30,000, you have powerful Section 75 rights.", "action_type": "branch", "action_config": {"question": "How did you pay?", "options": [{"label": "Credit card (£100–£30,000 purchase) — make a Section 75 claim", "next_step": "send-s75-claim"}, {"label": "Debit card, cash, or other — proceed to Letter Before Action", "next_step": "send-lba"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "send-s75-claim"},
  {"step_id": "send-s75-claim", "order": 7, "title": "Submit a Section 75 claim", "description": "Your credit card provider is jointly and severally liable with the retailer. This letter formally makes a Section 75 claim under the Consumer Credit Act 1974.", "action_type": "send_letter", "action_config": {"letter_type": "section_75_claim", "auto_generate": true, "prompt_context": "retail_product_section75"}, "completion_criteria": {"type": "letter_sent", "letter_type": "section_75_claim"}, "wait_after_days": 56, "wait_message": "The card provider has 8 weeks to investigate and respond.", "next_step": "assess-s75-response"},
  {"step_id": "assess-s75-response", "order": 8, "title": "Section 75 outcome", "description": "Did your credit card provider uphold the claim?", "action_type": "branch", "action_config": {"question": "What happened with your Section 75 claim?", "options": [{"label": "Refund processed — resolved", "next_step": "resolved"}, {"label": "Claim rejected — escalate to Financial Ombudsman", "next_step": "send-fos-referral"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "send-fos-referral"},
  {"step_id": "send-fos-referral", "order": 9, "title": "Refer to the Financial Ombudsman", "description": "If your Section 75 claim was rejected, refer to the Financial Ombudsman Service. They handle disputes about credit card providers and can award up to £415,000.", "action_type": "send_letter", "action_config": {"letter_type": "ombudsman_referral", "auto_generate": true, "prompt_context": "retail_product_fos", "export_pdf": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "resolved"},
  {"step_id": "send-lba", "order": 10, "title": "Send a Letter Before Action", "description": "This formal pre-court letter gives the retailer 14 days to settle. It is required before filing a small claims court claim.", "action_type": "send_letter", "action_config": {"letter_type": "letter_before_action", "auto_generate": true, "prompt_context": "retail_product_lba"}, "completion_criteria": {"type": "letter_sent", "letter_type": "letter_before_action"}, "wait_after_days": 14, "wait_message": "Give 14 days to respond before filing at court.", "next_step": "resolved"},
  {"step_id": "resolved", "order": 99, "title": "Case resolved", "description": "Record your outcome — refund amount, repair success, or court result. This helps other consumers.", "action_type": "resolve", "action_config": {"trigger_outcome_form": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": null}
]
$steps$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  sector = EXCLUDED.sector,
  steps = EXCLUDED.steps,
  is_active = EXCLUDED.is_active;
