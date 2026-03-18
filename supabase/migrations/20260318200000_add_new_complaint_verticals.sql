-- RUN THIS MIGRATION: Supabase Dashboard → SQL Editor → paste and run
-- Adds escalation rules, journey templates, and organisations for 7 new complaint verticals:
--   landlord_tenant, parking, council_tax, motor_vehicle,
--   nhs_healthcare, home_improvements, subscriptions

-- =============================================================================
-- ESCALATION RULES
-- =============================================================================

-- ─── LANDLORD & TENANT ───────────────────────────────────────────────────────
INSERT INTO public.escalation_rules (category, stage, stage_order, title, description, action_required, wait_period_days, regulatory_body, regulatory_url, tips) VALUES

('landlord_tenant', 'initial', 1,
 'Contact Your Landlord or Letting Agent in Writing',
 'Put your complaint in writing (email or letter). State the problem, what you want done, and give a 14-day deadline. Your landlord has a legal duty under Section 11 of the Landlord and Tenant Act 1985 to keep the structure, exterior, and utilities in repair. The Homes (Fitness for Human Habitation) Act 2018 also requires rented homes to be fit to live in throughout the tenancy.',
 'Send written complaint to landlord/agent with 14-day deadline. Photograph all issues (damp, damage, broken fixtures). Note dates of all verbal conversations.',
 14, NULL, NULL,
 'Keep all written evidence. If texting or emailing, take screenshots. If your landlord lives abroad, the managing agent is responsible for day-to-day repairs.'),

('landlord_tenant', 'formal_complaint', 2,
 'Send a Formal Complaint Letter',
 'If your landlord has not responded or fixed the issue, send a formal complaint letter citing the specific legislation. For social housing tenants, your landlord must have a formal complaints procedure — ask for it in writing. Reference the Landlord and Tenant Act 1985 (s.11) for repairs, or the Homes (Fitness for Human Habitation) Act 2018 for wider habitability issues.',
 'Send formal complaint letter citing relevant legislation. Request written response within 14 days. If social housing, request a copy of the landlord''s complaints procedure.',
 14, NULL, NULL,
 'For deposit disputes: check your tenancy agreement for the deposit scheme used (DPS, MyDeposits, or TDS). Landlords must protect deposits within 30 days. Failure allows you to claim 1–3x the deposit amount.'),

('landlord_tenant', 'escalation', 3,
 'Report to Local Council Environmental Health',
 'If your landlord still has not acted, contact your local council Environmental Health department. They can inspect under the Housing Health and Safety Rating System (HHSRS) and issue improvement notices or emergency prohibition orders. For deposit disputes, raise a formal dispute through the relevant deposit protection scheme. Social housing tenants should escalate to the Housing Ombudsman.',
 'Contact local council Environmental Health. For deposit disputes: raise with your deposit scheme. For social housing: escalate to the Housing Ombudsman.',
 28, 'Local Council Environmental Health / Housing Ombudsman', 'https://www.housing-ombudsman.org.uk/',
 'Environmental Health inspections are free and the council can take enforcement action on your behalf. They are particularly effective for damp, mould, heating failures, and pest infestations.'),

('landlord_tenant', 'ombudsman', 4,
 'Escalate to the Housing Ombudsman or Property Tribunal',
 'Social housing tenants can escalate to the Housing Ombudsman, which is independent and free. Private tenants can apply to the First-tier Tribunal (Property Chamber) for a rent repayment order, repairs order, or determination of rights. If your deposit was not protected or not returned, the tribunal can award up to 3x the deposit amount.',
 'File complaint with the Housing Ombudsman (social housing) OR apply to the First-tier Tribunal Property Chamber (private tenants). For unprotected deposits, claim up to 3x deposit via tribunal.',
 56, 'Housing Ombudsman / First-tier Tribunal (Property Chamber)', 'https://www.gov.uk/courts-tribunals/first-tier-tribunal-property-chamber',
 'The Property Chamber is free for most applications. You do not need a solicitor. For rent repayment orders, you can claim back up to 12 months'' rent if your landlord is convicted of certain offences.'),

('landlord_tenant', 'court', 5,
 'County Court Claim',
 'For matters not covered by the ombudsman or tribunal (e.g. breach of tenancy, personal injury from disrepair, or where the tribunal process has been exhausted), you can bring a claim in the County Court. Legal aid may be available for housing disrepair claims. Use the small claims track for claims under £10,000.',
 'File County Court claim. Check legal aid eligibility for housing disrepair at gov.uk/check-legal-aid. Small claims track for claims under £10,000.',
 NULL, 'County Court', 'https://www.gov.uk/make-court-claim-for-money',
 'The Pre-Action Protocol for Housing Conditions Claims requires you to attempt informal resolution before going to court. The protocol covers most disrepair claims.');

-- ─── PARKING ─────────────────────────────────────────────────────────────────
INSERT INTO public.escalation_rules (category, stage, stage_order, title, description, action_required, wait_period_days, regulatory_body, regulatory_url, tips) VALUES

('parking', 'initial', 1,
 'Check the Ticket and Gather Evidence',
 'Determine whether this is a council Penalty Charge Notice (PCN) or a private Parking Charge Notice. Council tickets are issued by local authorities and carry legal weight. Private tickets are issued by companies (ParkingEye, APCOA, NCP etc.) on private land — they are contractual, not criminal. Check for errors: wrong registration plate, incorrect date/time, unclear signage, broken payment machines. Photograph everything before moving the vehicle.',
 'Photograph all signage (including the back), your parking position, any broken meters or machines. Note whether the operator is a BPA or IPC member. Check for factual errors on the ticket.',
 14, NULL, NULL,
 'Do NOT pay a private ticket while you are appealing — payment is treated as accepting liability and waives your right to contest.'),

('parking', 'formal_complaint', 2,
 'Appeal to the Operator (Informal Appeal)',
 'For council PCNs: submit an informal challenge to the council within 14 days (21 days if ticket was posted). Common grounds: incorrect information on the ticket, broken meter, unclear signage, loading/unloading, valid permit. For private PCNs: write to the parking company with your grounds for appeal. You have 28 days in most cases. The company cannot increase the charge while you appeal.',
 'Submit informal appeal to the council or parking company within the deadline. Include all photographic evidence and any relevant documentation.',
 28, NULL, NULL,
 'Common successful grounds: signage was obscured or absent, grace period was not given (BPA code requires 10 minutes), meter was broken, you had a genuine medical emergency, or ANPR misread the plate.'),

('parking', 'escalation', 3,
 'Appeal to an Independent Body',
 'Council PCNs rejected: submit formal representations within 28 days using the Notice to Owner form, then appeal to the Traffic Penalty Tribunal (England/Wales) or Parking and Bus Lane Tribunal (Scotland/London). Private PCNs rejected: appeal to POPLA (free, for BPA members) or IAS (for IPC members). The operator cannot pursue payment while your independent appeal is active.',
 'Council: submit formal representations then appeal to Traffic Penalty Tribunal. Private: appeal to POPLA (BPA operator) or IAS (IPC operator). Both are free.',
 28, 'POPLA / IAS / Traffic Penalty Tribunal', 'https://www.popla.co.uk/',
 'POPLA has a 37% success rate for appellants. Traffic Penalty Tribunal appeals succeed 50–70% of the time. Submit all evidence online — you do not need to attend in person.'),

('parking', 'ombudsman', 4,
 'Challenge Enforcement or Debt Action',
 'If the tribunal or POPLA/IAS rules against you and you choose not to pay: councils can register the debt and use bailiffs. Private companies may threaten court — only a small minority follow through. If a private company takes you to court, you can defend on the grounds that the charge is disproportionate (Beavis v ParkingEye [2015] UKSC 67 set the benchmark at £85). Report aggressive operators to the BPA or IPC.',
 'Accept the outcome and pay if unsuccessful, OR defend a court claim on grounds the charge is extravagant. Report aggressive private operators to BPA or IPC.',
 NULL, 'Traffic Penalty Tribunal / County Court', 'https://www.trafficpenaltytribunal.gov.uk/',
 'In Beavis v ParkingEye [2015] the Supreme Court confirmed that standardised private parking charges can be lawful if they are a genuine pre-estimate of loss or a legitimate deterrent. Charges over £100 are harder to defend.');

-- ─── COUNCIL TAX ─────────────────────────────────────────────────────────────
INSERT INTO public.escalation_rules (category, stage, stage_order, title, description, action_required, wait_period_days, regulatory_body, regulatory_url, tips) VALUES

('council_tax', 'initial', 1,
 'Contact Your Local Council',
 'Write to your council''s council tax department. Common issues include: incorrect banding, wrong liability (you are not the responsible person), missing single person discount (25%), student exemption not applied, empty property dispute, or hardship. For banding disputes, note that the Valuation Office Agency (VOA) sets bands, not the council — you may need to contact both.',
 'Write to council tax department with evidence. For single person discount: provide proof of sole occupancy. For student exemption: provide your enrolment letter. For banding: check comparable properties at gov.uk/council-tax-bands.',
 14, NULL, NULL,
 'Every council must have a council tax reduction scheme for those on low incomes. You can apply regardless of whether you are disputing the band.'),

('council_tax', 'formal_complaint', 2,
 'Challenge Your Band or Escalate Through Complaints',
 'For banding disputes: contact the VOA directly to request a review at gov.uk/challenge-council-tax-band. You can challenge your band at any time if your property''s band is wrong compared to similar properties. For liability, discount, or exemption disputes: use the council''s formal complaints procedure. For hardship: apply to the council tax reduction scheme.',
 'For banding: contact VOA to request a review with evidence of comparable properties. For other disputes: use council formal complaints procedure.',
 28, 'Valuation Office Agency', 'https://www.gov.uk/challenge-council-tax-band',
 'Warning: if you challenge your band and the VOA reviews your property, they can also increase the band if they find evidence it should be higher. Check comparable properties carefully first.'),

('council_tax', 'escalation', 3,
 'Appeal to the Valuation Tribunal',
 'If the VOA refuses to change your band, or the council rejects your challenge, you can appeal to the Valuation Tribunal for England (or Welsh equivalent). This is free and you do not need a solicitor. The tribunal can change your band, order the council to apply a discount, or dismiss the appeal. Appeals are heard by an independent panel.',
 'File an appeal with the Valuation Tribunal for England. Prepare evidence of comparable properties and their bands. You have 2 months from the VOA''s decision to appeal.',
 56, 'Valuation Tribunal for England', 'https://www.valuationtribunal.gov.uk/',
 'You can submit evidence online and may not need to attend a hearing in person. The tribunal considers appeals on banding, completion notices, and council tax liability.'),

('council_tax', 'court', 4,
 'Magistrates'' Court / Judicial Review',
 'If the council is pursuing unpaid council tax, they will apply for a liability order at the Magistrates'' Court. Once a liability order is granted, the council can use bailiffs, deduct from wages or benefits, or in extreme cases seek imprisonment. If you believe the council or tribunal has acted unlawfully, you can seek judicial review — but this is expensive and rare for council tax matters.',
 'If facing enforcement, contact StepChange (0800 138 1111) or Citizens Advice immediately for free debt advice. Do not ignore a liability order summons.',
 NULL, 'Magistrates'' Court / High Court', NULL,
 'Council tax debt is a priority debt — unlike most civil debts, councils can apply for imprisonment in extreme non-payment cases. Get debt advice early.');

-- ─── MOTOR VEHICLE ───────────────────────────────────────────────────────────
INSERT INTO public.escalation_rules (category, stage, stage_order, title, description, action_required, wait_period_days, regulatory_body, regulatory_url, tips) VALUES

('motor_vehicle', 'initial', 1,
 'Contact the Dealer or Seller',
 'Under the Consumer Rights Act 2015, goods must be of satisfactory quality, fit for purpose, and as described. Within 30 days of purchase: you have the short-term right to reject for a full refund. Between 30 days and 6 months: the dealer must repair or replace; if the first repair fails you can reject. After 6 months: the burden shifts to you to prove the fault existed at purchase. Write to the dealer describing the fault, referencing the CRA 2015, and state your desired remedy.',
 'Write to dealer citing Consumer Rights Act 2015. If within 30 days, exercise the short-term right to reject for a full refund. Include photos, video, and an independent mechanic''s assessment.',
 14, NULL, NULL,
 'Get an independent inspection from a non-selling mechanic before you communicate with the dealer — this is your strongest evidence. The AA and RAC both offer inspection services.'),

('motor_vehicle', 'formal_complaint', 2,
 'Formal Complaint and Section 75 Claim',
 'If the dealer refuses to act: send a formal complaint letter giving a final 14-day deadline. If you paid any amount (£100–£30,000) by credit card, you also have a Section 75 claim — the credit card company is jointly liable under the Consumer Credit Act 1974. If on finance (HP or PCP), complain to the finance company — they are the legal owner. Finance disputes go to the Financial Ombudsman after 8 weeks.',
 'Send formal complaint letter. File Section 75 claim with your credit card provider if applicable. If on finance, complain to the finance company in writing.',
 14, NULL, NULL,
 'Section 75 applies even if you only paid a deposit by credit card. The full claim can be made against the card company even if the rest was paid by other means.'),

('motor_vehicle', 'escalation', 3,
 'The Motor Ombudsman or Trading Standards',
 'If the dealer is accredited by The Motor Ombudsman, you can raise a free dispute there. Check at TheMotorOmbudsman.org. If not accredited, contact Citizens Advice who will refer to Trading Standards. For finance disputes, escalate to the Financial Ombudsman Service after 8 weeks. The FOS can award up to £415,000 for car finance complaints.',
 'Check if dealer is Motor Ombudsman accredited at themotorombudsman.org. If yes, file dispute. If no, report to Citizens Advice/Trading Standards. Finance disputes: Financial Ombudsman after 8 weeks.',
 56, 'The Motor Ombudsman / Financial Ombudsman Service', 'https://www.themotorombudsman.org/',
 'The FCA ruled in 2024 that many car finance commission arrangements were unlawful. If you took out motor finance before January 2021, you may have a discretionary commission arrangement (DCA) claim worth thousands.'),

('motor_vehicle', 'court', 4,
 'County Court (Small Claims or Fast Track)',
 'Get an independent engineer''s report before filing. Claims up to £10,000 use the small claims track (no solicitor needed, fees proportional to claim). Higher value vehicle claims go through the fast track (£10,000–£25,000) or multi-track (£25,000+). Most dealers will settle once they receive court papers — actual litigation is rare. Follow the Pre-Action Protocol before filing.',
 'Obtain independent engineer''s report. File County Court claim following the Pre-Action Protocol. Small claims track for claims under £10,000.',
 NULL, 'County Court', 'https://www.gov.uk/make-court-claim-for-money',
 'The Pre-Action Protocol for Construction Disputes applies to vehicle defect cases. Courts expect parties to exchange evidence and attempt settlement before proceedings commence.');

-- ─── NHS & HEALTHCARE ────────────────────────────────────────────────────────
INSERT INTO public.escalation_rules (category, stage, stage_order, title, description, action_required, wait_period_days, regulatory_body, regulatory_url, tips) VALUES

('nhs_healthcare', 'initial', 1,
 'Contact PALS (Patient Advice and Liaison Service)',
 'Every NHS trust has a PALS team that can help resolve issues quickly and informally. Contact PALS first — they can mediate, explain your options, and often resolve problems without a formal complaint. For GP, dentist, optician, or pharmacy complaints, contact the practice manager directly. You have 12 months from the event (or from when you became aware) to make a formal complaint.',
 'Contact PALS at the relevant hospital/trust, or the practice manager for primary care. Describe what happened and what outcome you want.',
 14, 'PALS', NULL,
 'Keep a diary of events — dates, who you spoke to, what was said. This will be essential for any formal complaint. If you need help making a complaint, NHS Complaints Advocacy services are free and available in every area.'),

('nhs_healthcare', 'formal_complaint', 2,
 'Make a Formal NHS Complaint',
 'If PALS cannot resolve the issue, make a formal written complaint. You can complain to the NHS organisation (hospital, GP practice, trust) or to NHS England for primary care. The organisation must acknowledge your complaint within 3 working days and should respond fully within 6 months. Request a meeting with the clinical team if you want to understand what happened.',
 'Submit formal written complaint to the NHS organisation or NHS England. State what happened, when, who was involved, the impact, and what you want. Keep copies.',
 NULL, 'NHS Organisation / NHS England', 'https://www.england.nhs.uk/contact-us/complaint/',
 'If you or someone you care for has died or been seriously harmed, the NHS must carry out a Serious Incident investigation. Ask the trust for a copy of any investigation report.'),

('nhs_healthcare', 'escalation', 3,
 'Escalate to the Parliamentary and Health Service Ombudsman (PHSO)',
 'If you are unsatisfied with the NHS response to your formal complaint, escalate to the PHSO — the independent final stage for NHS complaints in England. The PHSO is free. They can investigate whether the NHS acted fairly and recommend remedies including apologies, service changes, and financial redress. They typically investigate complaints within 12–18 months.',
 'File complaint with the PHSO. Include all previous correspondence and the NHS organisation''s final response. Allow several months for investigation.',
 NULL, 'Parliamentary and Health Service Ombudsman (PHSO)', 'https://www.ombudsman.org.uk/',
 'The PHSO upholds around 40% of NHS complaints. Complaints about poor care, delayed diagnosis, and failures in communication are the most commonly upheld.'),

('nhs_healthcare', 'court', 4,
 'Clinical Negligence Claim',
 'If you believe clinical negligence caused you or a family member harm, you may have a legal claim for compensation. This is separate from the complaints process. You must prove: (1) the care fell below a reasonable standard (Bolam test, as updated by Montgomery v Lanarkshire [2015]), and (2) this caused the harm. The time limit is 3 years from the event or from when you became aware. Legal aid is available for clinical negligence in some cases.',
 'Seek a specialist clinical negligence solicitor (most offer free initial consultations). Check legal aid eligibility. 3-year limitation period applies.',
 NULL, 'County Court / High Court (Clinical Negligence)', NULL,
 'The NHS Resolution scheme handles most clinical negligence claims without court proceedings. The NHS Litigation Authority settles the majority of claims before trial. Having a specialist solicitor is essential.'),

('nhs_healthcare', 'ombudsman', 5,
 'Regulatory Body Complaint (CQC / GMC / NMC)',
 'If you have concerns about the safety of an individual clinical professional (doctor, nurse, midwife), you can report to their regulatory body. The GMC regulates doctors, the NMC regulates nurses and midwives, and the GDC regulates dentists. The CQC regulates care providers and can take enforcement action against services with systemic failures.',
 'Report concerns about individual professionals to the relevant regulatory body: GMC (doctors), NMC (nurses/midwives), GDC (dentists), GOC (optometrists). Report service failures to the CQC.',
 NULL, 'GMC / NMC / GDC / CQC', 'https://www.gmc-uk.org/',
 'Regulatory body complaints focus on professional fitness to practise, not on obtaining compensation. They run parallel to complaints and negligence processes.');

-- ─── HOME IMPROVEMENTS ───────────────────────────────────────────────────────
INSERT INTO public.escalation_rules (category, stage, stage_order, title, description, action_required, wait_period_days, regulatory_body, regulatory_url, tips) VALUES

('home_improvements', 'initial', 1,
 'Contact the Builder or Tradesperson',
 'Write to the builder describing the problem. Under the Consumer Rights Act 2015, services must be performed with reasonable care and skill, within a reasonable time, and at a reasonable price. If the work is substandard, the trader must either redo it to a satisfactory standard or give you a price reduction. Take dated photographs of all defective work. Get an independent written assessment from another qualified tradesperson or surveyor.',
 'Send written complaint to builder with dated photos of defective work and 14-day deadline to rectify. Obtain an independent written assessment of the defects.',
 14, NULL, NULL,
 'The independent assessment is your most important evidence. Get quotes from two other tradespeople for the cost of rectifying the work — these form the basis of any financial claim.'),

('home_improvements', 'formal_complaint', 2,
 'Formal Letter Before Action and Trade Body Complaint',
 'Send a formal letter before action — a legal requirement before court action. State what was agreed, what went wrong, what remedy you require, and that you will take legal action if not resolved within 14 days. If the builder is a trade body member (Federation of Master Builders, TrustMark, NICEIC, Gas Safe Register), file a complaint with that body too.',
 'Send formal letter before action with 14-day deadline. Check if builder belongs to FMB, TrustMark, NICEIC, Gas Safe, or similar and file complaint with the relevant body.',
 14, 'Federation of Master Builders / TrustMark / NICEIC / Gas Safe Register', 'https://www.trustmark.org.uk/',
 'If the work involved gas (boilers, gas pipes), it must have been carried out by a Gas Safe registered engineer. If not, report to Gas Safe Register — this is a legal requirement, not just a code of practice.'),

('home_improvements', 'escalation', 3,
 'Report to Trading Standards or Use ADR',
 'Contact Citizens Advice who will refer to Trading Standards if the trader has broken the law (misrepresentation, fraud, unsafe work). TrustMark registered traders have a dispute resolution process and an insurance-backed guarantee scheme. For unsafe electrical work by a non-registered installer, report to local building control. Gas Safe Register investigates illegal gas work and can prosecute installers.',
 'Report to Citizens Advice/Trading Standards. Use TrustMark ADR or FMB arbitration if applicable. Report unsafe gas work to Gas Safe Register. Report unsafe electrical work to building control.',
 28, 'Trading Standards / TrustMark / Gas Safe Register', 'https://www.gassaferegister.co.uk/',
 'TrustMark dispute resolution is free for consumers. Many TrustMark members also have deposit protection, so if your builder goes bust mid-project you can recover your deposit.'),

('home_improvements', 'court', 4,
 'County Court Claim',
 'File a County Court claim with the independent assessment and rectification quotes as evidence. Claims up to £10,000 use the small claims track. For larger construction disputes, the fast track or multi-track applies — consider instructing a solicitor. Courts expect parties to follow the Pre-Action Protocol for Construction and Engineering Disputes.',
 'File County Court claim. Include independent surveyor report and rectification quotes. Small claims track for claims under £10,000.',
 NULL, 'County Court', 'https://www.gov.uk/make-court-claim-for-money',
 'Most builders settle once they receive court papers. The threat of a county court judgment (CCJ) that affects their credit rating is a significant deterrent for traders.');

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────
INSERT INTO public.escalation_rules (category, stage, stage_order, title, description, action_required, wait_period_days, regulatory_body, regulatory_url, tips) VALUES

('subscriptions', 'initial', 1,
 'Request Cancellation in Writing',
 'Email the company requesting immediate cancellation and keeping a paper trail. Under the Consumer Contracts Regulations 2013, you have a 14-day cooling-off period for online or distance purchases. Cancellation must be as easy as sign-up under the Digital Markets, Competition and Consumers Act 2024. Screenshot every step of the cancellation process — if it is deliberately difficult, this is itself an unfair commercial practice.',
 'Email the company requesting immediate cancellation. Screenshot every step. Note the date you requested cancellation. Save the confirmation email if one arrives.',
 14, NULL, NULL,
 'If there is no obvious cancellation route, try emailing the complaints team directly: most large companies have a complaints@companyname.com or use their registered address. Screenshot all evidence of your attempts.'),

('subscriptions', 'formal_complaint', 2,
 'Formal Complaint and Direct Payment Cancellation',
 'If the company ignores your cancellation or continues charging: send a formal complaint letter demanding cancellation and refund of all charges from your cancellation date. Cancel the direct debit directly with your bank (the Direct Debit Guarantee gives you the right to do this at any time). Request a chargeback from your credit or debit card provider for any charges taken after your cancellation date.',
 'Send formal complaint letter. Cancel direct debit with your bank immediately. Request chargeback for post-cancellation charges from your card provider.',
 14, NULL, NULL,
 'The Direct Debit Guarantee is an absolute right — your bank cannot refuse. Tell your bank the reason is ''unauthorised payment after cancellation''. This often prompts the company to settle.'),

('subscriptions', 'escalation', 3,
 'Report to CMA or Trading Standards',
 'Report to Citizens Advice (who refer to Trading Standards). The Competition and Markets Authority (CMA) has new enforcement powers under the Digital Markets, Competition and Consumers Act 2024 — fines up to 10% of global turnover for subscription trap practices. For regulated financial products (insurance, investment platforms), escalate to the Financial Ombudsman Service after 8 weeks.',
 'Report to Citizens Advice/Trading Standards. For financial products, file with the Financial Ombudsman Service. Report subscription trap behaviour to the CMA via gov.uk.',
 28, 'CMA / Trading Standards / Financial Ombudsman Service', 'https://www.citizensadvice.org.uk/consumer/',
 'The CMA takes collective action against entire industries, not individual cases, but reports from consumers are what trigger investigations. The more reports, the greater the chance of enforcement action.'),

('subscriptions', 'court', 4,
 'County Court Claim for Refund',
 'If the company has taken money after you cancelled and refuses to refund it, file a County Court claim. Your evidence is the cancellation email/screenshot plus bank statements showing subsequent charges. Most subscription disputes are under £10,000 (small claims track). Many companies settle immediately on receiving court papers rather than defending.',
 'File County Court small claims track claim for refund. Include cancellation evidence and bank statements showing continued charges after cancellation.',
 NULL, 'County Court', 'https://www.gov.uk/make-court-claim-for-money',
 'The court fee for a claim under £300 is £35; for up to £1,000 it is £80. You can claim court fees back if you win.');

-- =============================================================================
-- JOURNEY TEMPLATES
-- =============================================================================

-- ─── LANDLORD: Deposit Dispute ────────────────────────────────────────────────
INSERT INTO public.journey_templates (id, category, title, description, sector, is_active, steps)
VALUES (
  'deposit-dispute',
  'landlord_tenant',
  'Get Your Tenancy Deposit Back',
  'Step-by-step guide to recovering your tenancy deposit when your landlord won''t return it or has made unfair deductions.',
  'housing',
  true,
  $steps$
[
  {"step_id": "gather-evidence", "order": 1, "title": "Gather your evidence", "description": "Before contacting your landlord, collect everything: your tenancy agreement, check-in inventory, check-out inventory, photos you took at move-in and move-out, deposit protection certificate, and any emails or texts about the deposit.", "action_type": "checklist", "action_config": {"items": ["Find the deposit protection certificate (DPS, MyDeposits, or TDS)", "Gather check-in and check-out inventories", "Collect photos from move-in and move-out", "Save all emails/texts about the deposit", "Calculate the exact amount disputed"], "tip": "Your landlord must protect your deposit within 30 days of receiving it and provide you with the prescribed information about the scheme. If they did not, you can claim 1–3x the deposit amount regardless of any deductions."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "initial-letter"},
  {"step_id": "initial-letter", "order": 2, "title": "Write formally to your landlord", "description": "Send a written request for the return of your deposit within 14 days, referencing the deposit protection scheme rules and any deductions you dispute.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "deposit_dispute_initial"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 14, "wait_message": "Give your landlord 14 days to return the deposit or respond in writing.", "next_step": "assess-response"},
  {"step_id": "assess-response", "order": 3, "title": "What happened?", "description": "Did your landlord respond within 14 days?", "action_type": "branch", "action_config": {"question": "What is the current situation?", "options": [{"label": "Full deposit returned", "next_step": "resolved"}, {"label": "Partial return or unfair deductions", "next_step": "dispute-scheme"}, {"label": "No response at all", "next_step": "dispute-scheme"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "dispute-scheme"},
  {"step_id": "dispute-scheme", "order": 4, "title": "Raise a dispute with the deposit scheme", "description": "Contact your deposit protection scheme (DPS, MyDeposits, or TDS) to raise a formal dispute. They will mediate between you and your landlord. The scheme's adjudicator will review the evidence from both sides and make a binding decision. This process is free.", "action_type": "escalate", "action_config": {"letter_type": "escalation", "auto_generate": true, "prompt_context": "deposit_dispute_scheme", "escalation_target": "Deposit Protection Scheme (DPS/MyDeposits/TDS)", "escalation_url": "https://www.depositprotection.com/"}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "wait_message": "Deposit scheme disputes typically take 4–8 weeks. Both sides submit evidence online.", "next_step": "assess-scheme-result"},
  {"step_id": "assess-scheme-result", "order": 5, "title": "Was your deposit protected?", "description": "If your landlord did not protect your deposit in an approved scheme within 30 days, you have a separate and very powerful claim.", "action_type": "branch", "action_config": {"question": "Was your deposit protected in an approved scheme?", "options": [{"label": "Yes — scheme dispute resolved satisfactorily", "next_step": "resolved"}, {"label": "Yes — scheme ruled against me", "next_step": "letter-before-action"}, {"label": "No — deposit was NOT protected", "next_step": "unprotected-claim"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "letter-before-action"},
  {"step_id": "unprotected-claim", "order": 6, "title": "Claim 1–3x deposit for non-protection", "description": "If your landlord did not protect your deposit in an approved scheme, you can claim between 1 and 3 times the deposit amount via the County Court. This is in addition to the return of the deposit itself. This is a strong claim and many landlords settle immediately.", "action_type": "send_letter", "action_config": {"letter_type": "letter_before_action", "auto_generate": true, "prompt_context": "deposit_unprotected_lba"}, "completion_criteria": {"type": "letter_sent", "letter_type": "letter_before_action"}, "wait_after_days": 14, "wait_message": "14 days for landlord to respond before county court claim.", "next_step": "resolved"},
  {"step_id": "letter-before-action", "order": 7, "title": "Send a letter before action", "description": "If the deposit scheme dispute failed, send a formal letter before action giving the landlord a final 14-day deadline before you file a county court claim.", "action_type": "send_letter", "action_config": {"letter_type": "letter_before_action", "auto_generate": true, "prompt_context": "deposit_lba"}, "completion_criteria": {"type": "letter_sent", "letter_type": "letter_before_action"}, "wait_after_days": 14, "wait_message": "Final 14 days before county court action.", "next_step": "resolved"},
  {"step_id": "resolved", "order": 99, "title": "Case resolved", "description": "Record the outcome of your deposit dispute to help future tenants.", "action_type": "resolve", "action_config": {"trigger_outcome_form": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": null}
]
$steps$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category = EXCLUDED.category, sector = EXCLUDED.sector,
  steps = EXCLUDED.steps, is_active = EXCLUDED.is_active;

-- ─── PARKING: Private Parking Ticket ─────────────────────────────────────────
INSERT INTO public.journey_templates (id, category, title, description, sector, is_active, steps)
VALUES (
  'private-parking-appeal',
  'parking',
  'Appeal a Private Parking Ticket',
  'Challenge a Parking Charge Notice from a private company (supermarket, hospital, retail park). Covers appeals to the operator, POPLA, and IAS.',
  'parking',
  true,
  $steps$
[
  {"step_id": "check-ticket", "order": 1, "title": "Check your ticket and gather evidence", "description": "Before doing anything: Is this a private Parking Charge Notice (PCN) issued by a company, or a council Penalty Charge Notice? Private tickets are contractual — you are NOT legally obliged to give the driver's details. Check for errors: wrong plate, incorrect time, unclear or missing signage.", "action_type": "checklist", "action_config": {"items": ["Photograph all signage (front and back)", "Photograph your parking position", "Photograph any broken meters or payment machines", "Note whether the operator is BPA or IPC member", "Check for factual errors on the ticket"], "tip": "Do NOT pay while appealing. Payment is treated as accepting liability. Do NOT ignore the ticket either — ignore and the charge may increase."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "appeal-operator"},
  {"step_id": "appeal-operator", "order": 2, "title": "Appeal to the operator", "description": "Write to the parking company within the deadline stated on the ticket (usually 28 days). State your grounds clearly and include all photographic evidence. Common successful grounds: unclear signage, grace period not given, broken meter, medical emergency, genuine permit holder.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "parking_private_appeal"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 28, "wait_message": "The operator must respond within 28 days. They cannot increase the charge while you appeal.", "next_step": "assess-operator-response"},
  {"step_id": "assess-operator-response", "order": 3, "title": "Operator response", "description": "What was the outcome of your operator appeal?", "action_type": "branch", "action_config": {"question": "What happened with the operator appeal?", "options": [{"label": "Ticket cancelled — resolved", "next_step": "resolved"}, {"label": "Rejected — operator is BPA member", "next_step": "appeal-popla"}, {"label": "Rejected — operator is IPC member", "next_step": "appeal-ias"}, {"label": "No response within 28 days", "next_step": "appeal-popla"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "appeal-popla"},
  {"step_id": "appeal-popla", "order": 4, "title": "Appeal to POPLA (BPA operators)", "description": "Submit your free appeal to POPLA — the independent appeals service for BPA-member parking companies. The operator cannot pursue payment while your POPLA appeal is active. POPLA consider whether the ticket was issued correctly, whether the signage was adequate, and whether you had a legitimate reason for parking.", "action_type": "escalate", "action_config": {"escalation_target": "POPLA", "escalation_url": "https://www.popla.co.uk/", "escalation_method": "Online form at popla.co.uk"}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "wait_message": "POPLA typically decides within 60 days.", "next_step": "resolved"},
  {"step_id": "appeal-ias", "order": 5, "title": "Appeal to IAS (IPC operators)", "description": "Submit your appeal to the Independent Appeals Service (IAS) — the scheme for IPC-member operators. Appeals within 21 days are free; after that there is a £15 fee (refunded if you win). The operator cannot pursue payment while your IAS appeal is active.", "action_type": "escalate", "action_config": {"escalation_target": "IAS (Independent Appeals Service)", "escalation_url": "https://www.theias.org/", "escalation_method": "Online form at theias.org"}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "wait_message": "IAS typically decides within 60 days.", "next_step": "resolved"},
  {"step_id": "resolved", "order": 99, "title": "Case resolved", "description": "Record the outcome of your parking appeal.", "action_type": "resolve", "action_config": {"trigger_outcome_form": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": null}
]
$steps$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category = EXCLUDED.category, sector = EXCLUDED.sector,
  steps = EXCLUDED.steps, is_active = EXCLUDED.is_active;

-- ─── COUNCIL TAX: Band Challenge ─────────────────────────────────────────────
INSERT INTO public.journey_templates (id, category, title, description, sector, is_active, steps)
VALUES (
  'council-tax-band',
  'council_tax',
  'Challenge Your Council Tax Band',
  'If your property is in a higher council tax band than similar homes nearby, you can challenge it and potentially save hundreds of pounds per year.',
  'government',
  true,
  $steps$
[
  {"step_id": "research-band", "order": 1, "title": "Research comparable properties", "description": "Use the VOA's online tool to find the council tax bands of similar properties nearby. Look for homes of similar size, type, and construction on your street or within a few streets. If several are in a lower band, you have grounds for a challenge.", "action_type": "checklist", "action_config": {"items": ["Search comparable properties at gov.uk/council-tax-bands", "Note at least 3–5 similar properties in a lower band", "Check your property's description on the VOA's list", "Confirm you're challenging the right address", "Note the date your band was set (usually 1 April 1991 value)"], "tip": "Warning: the VOA can increase your band as well as decrease it. If you are not sure your band is too high after checking comparables, consider taking advice before challenging."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "contact-voa"},
  {"step_id": "contact-voa", "order": 2, "title": "Request a VOA band review", "description": "Contact the Valuation Office Agency (VOA) to request a review of your council tax band. The VOA sets bands — not your council. You can challenge your band at any time if you believe it is wrong.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "council_tax_band_voa"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 56, "wait_message": "VOA reviews can take several months. They may visit your property or write to your neighbours.", "next_step": "assess-voa-decision"},
  {"step_id": "assess-voa-decision", "order": 3, "title": "VOA decision", "description": "What did the VOA decide?", "action_type": "branch", "action_config": {"question": "What did the VOA decide?", "options": [{"label": "Band reduced — resolved", "next_step": "resolved"}, {"label": "Band unchanged or increased", "next_step": "appeal-tribunal"}, {"label": "Still waiting for VOA decision", "next_step": "assess-voa-decision"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "appeal-tribunal"},
  {"step_id": "appeal-tribunal", "order": 4, "title": "Appeal to the Valuation Tribunal", "description": "If the VOA refuses to change your band, appeal to the Valuation Tribunal for England (or Welsh equivalent). This is free and you do not need a solicitor. You have 2 months from the VOA's decision to appeal. The tribunal hears evidence from both sides and can change your band, confirm it, or increase it.", "action_type": "escalate", "action_config": {"escalation_target": "Valuation Tribunal for England", "escalation_url": "https://www.valuationtribunal.gov.uk/", "escalation_method": "Online application form at valuationtribunal.gov.uk"}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "wait_message": "Tribunal hearings are typically listed 3–6 months after application.", "next_step": "resolved"},
  {"step_id": "resolved", "order": 99, "title": "Case resolved", "description": "Record the outcome. If your band was reduced, your council will automatically recalculate your bill and refund any overpayment.", "action_type": "resolve", "action_config": {"trigger_outcome_form": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": null}
]
$steps$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category = EXCLUDED.category, sector = EXCLUDED.sector,
  steps = EXCLUDED.steps, is_active = EXCLUDED.is_active;

-- ─── MOTOR VEHICLE: Faulty Used Car ──────────────────────────────────────────
INSERT INTO public.journey_templates (id, category, title, description, sector, is_active, steps)
VALUES (
  'faulty-used-car',
  'motor_vehicle',
  'Reject or Get a Faulty Car Fixed',
  'Step-by-step guide when the used car you bought develops faults. Covers Consumer Rights Act rights, rejection, repair, Section 75, and court.',
  'retail',
  true,
  $steps$
[
  {"step_id": "assess-timing", "order": 1, "title": "When did the fault appear?", "description": "Your rights under the Consumer Rights Act 2015 depend on when the fault appeared. Within 30 days: absolute right to reject for a full refund. 30 days to 6 months: right to repair — if repair fails, you can reject. After 6 months: you must prove the fault was present at purchase.", "action_type": "branch", "action_config": {"question": "When did the fault first appear?", "options": [{"label": "Within 30 days of purchase", "next_step": "30-day-rejection"}, {"label": "30 days to 6 months", "next_step": "repair-request"}, {"label": "After 6 months", "next_step": "gather-evidence"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "gather-evidence"},
  {"step_id": "gather-evidence", "order": 2, "title": "Get an independent inspection", "description": "Before contacting the dealer, obtain a written assessment from an independent mechanic (not the selling dealer). This is your strongest evidence. The AA and RAC both offer vehicle inspection services. Take photos and video of the fault.", "action_type": "checklist", "action_config": {"items": ["Book independent mechanic inspection (AA/RAC or local specialist)", "Get a written report describing the fault", "Take photos and video of the fault", "Keep all receipts and service records", "Note exact date fault first appeared"], "tip": "Do not have the car repaired before contacting the dealer — this could complicate your claim. Drive it safely to a mechanic for assessment only."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "30-day-rejection"},
  {"step_id": "30-day-rejection", "order": 3, "title": "Exercise short-term right to reject", "description": "Within 30 days of purchase, write to the dealer immediately exercising your short-term right to reject under the Consumer Rights Act 2015 Section 22. You are entitled to a full refund.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "motor_vehicle_30day_reject"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 14, "wait_message": "The dealer has 14 days to refund you once you exercise the right to reject.", "next_step": "assess-dealer-response"},
  {"step_id": "repair-request", "order": 4, "title": "Request repair or replacement", "description": "Between 30 days and 6 months, the dealer must be given one opportunity to repair the fault. Write to them requesting repair or replacement under the Consumer Rights Act 2015.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "motor_vehicle_repair_request"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 21, "wait_message": "The repair must be done within a reasonable time and without significant inconvenience.", "next_step": "assess-dealer-response"},
  {"step_id": "assess-dealer-response", "order": 5, "title": "Dealer response", "description": "How did the dealer respond?", "action_type": "branch", "action_config": {"question": "What happened with the dealer?", "options": [{"label": "Refunded in full", "next_step": "resolved"}, {"label": "Repair attempted but fault persists", "next_step": "escalate-s75"}, {"label": "Dealer refused outright", "next_step": "escalate-s75"}, {"label": "No response from dealer", "next_step": "escalate-s75"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "escalate-s75"},
  {"step_id": "escalate-s75", "order": 6, "title": "Section 75 claim (credit card) or Motor Ombudsman", "description": "If you paid by credit card, the card company is jointly liable under Section 75 of the Consumer Credit Act 1974 — file a claim with them. Check if the dealer is Motor Ombudsman accredited at themotorombudsman.org — if so, file a free dispute. If not, contact Citizens Advice/Trading Standards.", "action_type": "send_letter", "action_config": {"letter_type": "section_75_claim", "auto_generate": true, "prompt_context": "motor_vehicle_s75"}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "letter-before-action"},
  {"step_id": "letter-before-action", "order": 7, "title": "Letter before action", "description": "Send a formal letter before action to the dealer as the final step before court proceedings.", "action_type": "send_letter", "action_config": {"letter_type": "letter_before_action", "auto_generate": true, "prompt_context": "motor_vehicle_lba"}, "completion_criteria": {"type": "letter_sent", "letter_type": "letter_before_action"}, "wait_after_days": 14, "next_step": "resolved"},
  {"step_id": "resolved", "order": 99, "title": "Case resolved", "description": "Record the outcome of your motor vehicle dispute.", "action_type": "resolve", "action_config": {"trigger_outcome_form": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": null}
]
$steps$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category = EXCLUDED.category, sector = EXCLUDED.sector,
  steps = EXCLUDED.steps, is_active = EXCLUDED.is_active;

-- ─── NHS: Formal Complaint ────────────────────────────────────────────────────
INSERT INTO public.journey_templates (id, category, title, description, sector, is_active, steps)
VALUES (
  'nhs-complaint',
  'nhs_healthcare',
  'Make an NHS Complaint',
  'Guide to complaining about NHS care — GP and hospital issues to clinical negligence. Covers PALS, formal complaints, and the Parliamentary and Health Service Ombudsman.',
  'healthcare',
  true,
  $steps$
[
  {"step_id": "contact-pals", "order": 1, "title": "Contact PALS first", "description": "Every NHS trust has a Patient Advice and Liaison Service (PALS) that can often resolve issues quickly and informally. Contact PALS first — they can explain your options and mediate with the clinical team. For GP, dentist, or pharmacy complaints, contact the practice manager directly.", "action_type": "checklist", "action_config": {"items": ["Find the PALS contact details for your hospital or trust", "Write down dates, names, and exactly what happened", "Note the impact on you or your family member", "Decide what outcome you want (apology, explanation, service change, compensation)", "Gather any medical records, letters, or correspondence"], "tip": "You have 12 months from the event (or from when you became aware) to make a formal complaint. Do not delay if you are approaching this limit."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 14, "wait_message": "Give PALS up to 14 days to try to resolve informally.", "next_step": "assess-pals"},
  {"step_id": "assess-pals", "order": 2, "title": "PALS outcome", "description": "Was PALS able to resolve your issue?", "action_type": "branch", "action_config": {"question": "Did PALS resolve the issue?", "options": [{"label": "Yes — issue resolved", "next_step": "resolved"}, {"label": "No — still not resolved", "next_step": "formal-complaint"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "formal-complaint"},
  {"step_id": "formal-complaint", "order": 3, "title": "Make a formal NHS complaint", "description": "Write a formal complaint to the NHS organisation (hospital, trust, or GP practice) or to NHS England for primary care. The organisation must acknowledge your complaint within 3 working days and should respond within 6 months.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "nhs_formal_complaint"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 42, "wait_message": "The NHS organisation should respond within 6 months. Chase if you don't hear within 8 weeks.", "next_step": "assess-nhs-response"},
  {"step_id": "assess-nhs-response", "order": 4, "title": "NHS response", "description": "Are you satisfied with the NHS response?", "action_type": "branch", "action_config": {"question": "What happened with the NHS response?", "options": [{"label": "Satisfied with the response", "next_step": "resolved"}, {"label": "Unsatisfied — want to escalate", "next_step": "phso-referral"}, {"label": "No response after 8 weeks", "next_step": "chase-response"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "phso-referral"},
  {"step_id": "chase-response", "order": 5, "title": "Chase for a response", "description": "Send a follow-up letter asking for an update and requesting a response within 14 days.", "action_type": "send_letter", "action_config": {"letter_type": "follow_up", "auto_generate": true, "prompt_context": "nhs_chase_response"}, "completion_criteria": {"type": "letter_sent", "letter_type": "follow_up"}, "wait_after_days": 14, "next_step": "assess-nhs-response"},
  {"step_id": "phso-referral", "order": 6, "title": "Refer to the Parliamentary and Health Service Ombudsman", "description": "If the NHS response is inadequate, refer your complaint to the PHSO — the independent final stage for NHS complaints in England. This is free and the PHSO can recommend apologies, service changes, and financial compensation.", "action_type": "escalate", "action_config": {"letter_type": "ombudsman_referral", "auto_generate": true, "prompt_context": "nhs_phso_referral", "escalation_target": "Parliamentary and Health Service Ombudsman (PHSO)", "escalation_url": "https://www.ombudsman.org.uk/", "escalation_method": "Online complaint form at ombudsman.org.uk or by post"}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "wait_message": "PHSO investigations typically take 12–18 months.", "next_step": "resolved"},
  {"step_id": "resolved", "order": 99, "title": "Case resolved", "description": "Record the outcome of your NHS complaint.", "action_type": "resolve", "action_config": {"trigger_outcome_form": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": null}
]
$steps$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category = EXCLUDED.category, sector = EXCLUDED.sector,
  steps = EXCLUDED.steps, is_active = EXCLUDED.is_active;

-- ─── HOME IMPROVEMENTS: Substandard Work ─────────────────────────────────────
INSERT INTO public.journey_templates (id, category, title, description, sector, is_active, steps)
VALUES (
  'substandard-building-work',
  'home_improvements',
  'Get Substandard Building Work Fixed',
  'When a builder or tradesperson has done poor quality work. Covers your Consumer Rights Act rights, getting a resolution, trade body complaints, and court.',
  'retail',
  true,
  $steps$
[
  {"step_id": "document-problem", "order": 1, "title": "Document the defective work", "description": "Take dated photographs of every defect. Get an independent written assessment from another builder or surveyor. Keep your original quote, contract, and all receipts. Get two or three quotes for the cost of rectifying the work.", "action_type": "checklist", "action_config": {"items": ["Take dated photos and video of all defects", "Get independent written assessment from another tradesperson", "Obtain 2–3 quotes for rectification work", "Gather original quote, contract, and all receipts", "Check whether the builder is Gas Safe, NICEIC, FMB, or TrustMark registered"], "tip": "For gas work: if the installer was not Gas Safe registered, this is illegal regardless of the quality of the work. Report to Gas Safe Register. For electrical work: if not carried out by a registered electrician and not notified to building control, it may not comply with Building Regulations."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "formal-complaint"},
  {"step_id": "formal-complaint", "order": 2, "title": "Formal complaint to builder", "description": "Write to the builder describing the defects and requesting rectification within 14 days, citing the Consumer Rights Act 2015 — services must be performed with reasonable care and skill.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "home_improvements_initial"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 14, "wait_message": "Give the builder 14 days to respond and agree to fix the work.", "next_step": "assess-builder-response"},
  {"step_id": "assess-builder-response", "order": 3, "title": "Builder response", "description": "How did the builder respond?", "action_type": "branch", "action_config": {"question": "What happened?", "options": [{"label": "Builder agreed to fix and work is now satisfactory", "next_step": "resolved"}, {"label": "Builder refused or gave inadequate response", "next_step": "letter-before-action"}, {"label": "No response at all", "next_step": "letter-before-action"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "letter-before-action"},
  {"step_id": "letter-before-action", "order": 4, "title": "Letter before action", "description": "Send a formal letter before action giving a final 14-day deadline and stating you will file a county court claim. Include the independent assessment and rectification quotes.", "action_type": "send_letter", "action_config": {"letter_type": "letter_before_action", "auto_generate": true, "prompt_context": "home_improvements_lba"}, "completion_criteria": {"type": "letter_sent", "letter_type": "letter_before_action"}, "wait_after_days": 14, "next_step": "escalate"},
  {"step_id": "escalate", "order": 5, "title": "Trade body complaint and Trading Standards", "description": "Report to Citizens Advice/Trading Standards. If the builder is trade body registered (FMB, TrustMark, NICEIC, Gas Safe), file a complaint with that body — they can mediate and take disciplinary action. TrustMark registered traders have a dispute resolution process.", "action_type": "escalate", "action_config": {"escalation_target": "Trading Standards / Trade Body (FMB/TrustMark/NICEIC)", "escalation_url": "https://www.trustmark.org.uk/"}, "completion_criteria": {"type": "manual"}, "wait_after_days": 28, "next_step": "resolved"},
  {"step_id": "resolved", "order": 99, "title": "Case resolved", "description": "Record the outcome — work rectified, compensation awarded, or court claim filed.", "action_type": "resolve", "action_config": {"trigger_outcome_form": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": null}
]
$steps$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category = EXCLUDED.category, sector = EXCLUDED.sector,
  steps = EXCLUDED.steps, is_active = EXCLUDED.is_active;

-- ─── SUBSCRIPTIONS: Cancel and Refund ────────────────────────────────────────
INSERT INTO public.journey_templates (id, category, title, description, sector, is_active, steps)
VALUES (
  'cancel-subscription',
  'subscriptions',
  'Cancel a Subscription and Get a Refund',
  'When a company makes it hard to cancel or keeps charging you after cancellation. Covers Consumer Contracts Regulations rights, Direct Debit Guarantee, chargebacks, and court.',
  'retail',
  true,
  $steps$
[
  {"step_id": "gather-evidence", "order": 1, "title": "Document your cancellation attempts", "description": "Screenshot every step of your cancellation attempt, including any error messages, confusing buttons, or customer service chat. Save all cancellation confirmation emails. Note the exact date you first requested cancellation. Check your bank statements for charges after that date.", "action_type": "checklist", "action_config": {"items": ["Screenshot the entire cancellation process", "Save cancellation confirmation email if you received one", "Note the exact date and time you requested cancellation", "Download 3 months of bank/card statements showing continued charges", "Check whether you are paying by direct debit or card"], "tip": "Under the DMCC Act 2024, cancellation must be as easy as sign-up. If you signed up online in one click, you must be able to cancel online in one click. Deliberately difficult cancellation flows may be an unfair commercial practice."}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "request-cancellation"},
  {"step_id": "request-cancellation", "order": 2, "title": "Request cancellation and refund in writing", "description": "Email the company requesting immediate cancellation and a refund of all charges taken after your cancellation date. This creates a paper trail and starts the clock.", "action_type": "send_letter", "action_config": {"letter_type": "initial_complaint", "auto_generate": true, "prompt_context": "subscription_cancellation_request"}, "completion_criteria": {"type": "letter_sent", "letter_type": "initial_complaint"}, "wait_after_days": 14, "wait_message": "Give the company 14 days to process your cancellation and refund.", "next_step": "cancel-payment"},
  {"step_id": "cancel-payment", "order": 3, "title": "Cancel the payment at source", "description": "Cancel the direct debit directly with your bank — the Direct Debit Guarantee gives you the right to do this at any time and your bank must comply. For card payments, request a chargeback for any charges taken after your cancellation date.", "action_type": "info", "action_config": {"tip": "Call your bank and say: 'I want to cancel a direct debit to [company] immediately under the Direct Debit Guarantee. The company is charging me after I cancelled.' For chargebacks: say 'I want to dispute unauthorised charges — I cancelled this subscription on [date] and have evidence of cancellation.'"}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "assess-response"},
  {"step_id": "assess-response", "order": 4, "title": "Outcome", "description": "What happened?", "action_type": "branch", "action_config": {"question": "What is the current situation?", "options": [{"label": "Subscription cancelled and refunded", "next_step": "resolved"}, {"label": "Company still refusing or no response", "next_step": "formal-escalation"}]}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": "formal-escalation"},
  {"step_id": "formal-escalation", "order": 5, "title": "Formal complaint and Trading Standards", "description": "Send a formal complaint letter warning of Trading Standards report and court action. Report to Citizens Advice/Trading Standards. If this is a regulated financial product, file with the Financial Ombudsman Service.", "action_type": "send_letter", "action_config": {"letter_type": "escalation", "auto_generate": true, "prompt_context": "subscription_escalation"}, "completion_criteria": {"type": "letter_sent", "letter_type": "escalation"}, "wait_after_days": 14, "next_step": "court"},
  {"step_id": "court", "order": 6, "title": "County Court claim for refund", "description": "File a county court claim for the total amount charged after your cancellation date. Use the small claims track. Your evidence — the cancellation screenshot and bank statements — makes this a straightforward claim. Most companies settle on receiving court papers.", "action_type": "send_letter", "action_config": {"letter_type": "letter_before_action", "auto_generate": true, "prompt_context": "subscription_lba"}, "completion_criteria": {"type": "letter_sent", "letter_type": "letter_before_action"}, "wait_after_days": 14, "next_step": "resolved"},
  {"step_id": "resolved", "order": 99, "title": "Case resolved", "description": "Record the outcome of your subscription dispute.", "action_type": "resolve", "action_config": {"trigger_outcome_form": true}, "completion_criteria": {"type": "manual"}, "wait_after_days": 0, "next_step": null}
]
$steps$::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category = EXCLUDED.category, sector = EXCLUDED.sector,
  steps = EXCLUDED.steps, is_active = EXCLUDED.is_active;

-- =============================================================================
-- ORGANISATIONS FOR NEW VERTICALS
-- =============================================================================

-- Parking Companies
INSERT INTO public.organisations (name, category, complaint_email, website, is_verified)
SELECT 'ParkingEye', 'parking', 'appeals@parkingeye.co.uk', 'https://www.parkingeye.co.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'ParkingEye');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'APCOA Parking', 'parking', 'https://www.apcoa.co.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'APCOA Parking');

INSERT INTO public.organisations (name, category, complaint_email, website, is_verified)
SELECT 'NCP', 'parking', 'customerservices@ncp.co.uk', 'https://www.ncp.co.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'NCP');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Euro Car Parks', 'parking', 'https://www.eurocarparks.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Euro Car Parks');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Smart Parking', 'parking', 'https://www.smartparking.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Smart Parking');

-- NHS / Healthcare
INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'NHS England', 'nhs_healthcare', 'https://www.england.nhs.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'NHS England');

INSERT INTO public.organisations (name, category, complaint_email, website, is_verified)
SELECT 'Parliamentary and Health Service Ombudsman', 'nhs_healthcare', 'phso.enquiries@ombudsman.org.uk', 'https://www.ombudsman.org.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Parliamentary and Health Service Ombudsman');

-- Subscription Services
INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Amazon Prime', 'subscriptions', 'https://www.amazon.co.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Amazon Prime');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Sky', 'subscriptions', 'https://www.sky.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Sky' AND category = 'subscriptions');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Netflix', 'subscriptions', 'https://www.netflix.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Netflix');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Spotify', 'subscriptions', 'https://www.spotify.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Spotify');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Adobe', 'subscriptions', 'https://www.adobe.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Adobe');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Apple (App Store / iCloud)', 'subscriptions', 'https://www.apple.com/uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Apple (App Store / iCloud)');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Google (Play Store / YouTube Premium)', 'subscriptions', 'https://www.google.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Google (Play Store / YouTube Premium)');

-- Motor Vehicle
INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'The Motor Ombudsman', 'motor_vehicle', 'https://www.themotorombudsman.org', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'The Motor Ombudsman');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Arnold Clark', 'motor_vehicle', 'https://www.arnoldclark.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Arnold Clark');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Cazoo', 'motor_vehicle', 'https://www.cazoo.co.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Cazoo');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Motorpoint', 'motor_vehicle', 'https://www.motorpoint.co.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Motorpoint');

-- Home Improvements (Trade Bodies)
INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Federation of Master Builders', 'home_improvements', 'https://www.fmb.org.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Federation of Master Builders');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'TrustMark', 'home_improvements', 'https://www.trustmark.org.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'TrustMark');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Gas Safe Register', 'home_improvements', 'https://www.gassaferegister.co.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Gas Safe Register');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'NICEIC', 'home_improvements', 'https://www.niceic.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'NICEIC');

-- Landlord / Tenant
INSERT INTO public.organisations (name, category, complaint_email, website, is_verified)
SELECT 'Housing Ombudsman', 'landlord_tenant', 'info@housing-ombudsman.org.uk', 'https://www.housing-ombudsman.org.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Housing Ombudsman');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Deposit Protection Service (DPS)', 'landlord_tenant', 'https://www.depositprotection.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Deposit Protection Service (DPS)');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'MyDeposits', 'landlord_tenant', 'https://www.mydeposits.co.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'MyDeposits');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Tenancy Deposit Scheme (TDS)', 'landlord_tenant', 'https://www.tenancydepositscheme.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Tenancy Deposit Scheme (TDS)');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Foxtons', 'landlord_tenant', 'https://www.foxtons.co.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Foxtons');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Savills Lettings', 'landlord_tenant', 'https://www.savills.co.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Savills Lettings');

-- Council Tax Bodies
INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Valuation Office Agency', 'council_tax', 'https://www.gov.uk/government/organisations/valuation-office-agency', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Valuation Office Agency');

INSERT INTO public.organisations (name, category, website, is_verified)
SELECT 'Valuation Tribunal for England', 'council_tax', 'https://www.valuationtribunal.gov.uk', true
WHERE NOT EXISTS (SELECT 1 FROM public.organisations WHERE name = 'Valuation Tribunal for England');
