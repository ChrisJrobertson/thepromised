/** Dissolved company / fraudulent trading — mirrors `journey_templates` row `dissolved-company`. */
export const DISSOLVED_COMPANY_JOURNEY = {
  id: "dissolved-company",
  category: "fraud",
  title: "Dissolved Company / Fraudulent Trading",
  description:
    "Step-by-step guide for consumers who have paid a company that was being dissolved or has been dissolved. Covers evidence preservation, fraud reporting, bank reimbursement claims, and company restoration for legal action.",
  sector: "fraud",
  is_active: true,
  steps: [
    {
      id: "assess-situation",
      title: "Check the company status",
      description:
        "Before taking any action, confirm the company status on Companies House and preserve your evidence.",
      type: "checklist",
      action_config: {
        checklist_items: [
          "Search for the company on Companies House (find-and-update.company-information.service.gov.uk) and note its current status",
          "Screenshot the company filing history, especially any First Gazette Notice and Final Gazette Notice - note the exact dates",
          "Compare the Gazette notice dates against the date you paid and the date work started or goods were ordered",
          "Gather your invoice, payment confirmation, bank transfer receipt, and any correspondence (emails, messages, WhatsApp)",
          "Photograph or document the current state of any work done or goods received",
          "Save copies of the company website, social media, and any advertising material (these may disappear)",
        ],
        checklist_tip:
          "The key question is: was the First Gazette Notice published BEFORE or AFTER you paid? If before, the directors knew the company was being dissolved when they took your money. Screenshot the Gazette notice with its publication date - this is your strongest piece of evidence.",
      },
      next_step_id: "timeline-check",
    },
    {
      id: "timeline-check",
      title: "When did you pay relative to the dissolution?",
      description: "The timeline determines your legal position and which routes are strongest.",
      type: "branch",
      action_config: {
        branch_question:
          "When was the First Gazette Notice published relative to when you paid?",
        branch_options: [
          {
            label:
              "Before I paid - the company was already being dissolved when they took my money",
            next_step_id: "fraud-route",
          },
          {
            label: "After I paid - the company applied to dissolve after taking my money",
            next_step_id: "post-payment-dissolution",
          },
          {
            label: "The company is already fully dissolved",
            next_step_id: "fraud-route",
          },
          {
            label: "I am not sure - I need help checking",
            next_step_id: "how-to-check-timeline",
          },
        ],
      },
    },
    {
      id: "how-to-check-timeline",
      title: "How to check the dissolution timeline",
      description: "Here is how to compare your payment date against the dissolution timeline.",
      type: "info",
      action_config: {
        checklist_tip:
          "On the Companies House page for the company, click Filing History. Look for entries titled First Gazette notice for voluntary strike-off or similar. The date on this filing is the key date. Compare it to the date on your bank transfer, invoice, or payment receipt. If the Gazette notice date is EARLIER than your payment date, the directors knew the company was being dissolved when they took your money. If you still cannot find this information, call Companies House on 0303 1234 500.",
      },
      next_step_id: "timeline-check",
    },
    {
      id: "fraud-route",
      title: "Report to Action Fraud",
      description:
        "The directors took payment through a company they knew was being dissolved. This is potentially fraud. Reporting to Action Fraud generates a crime reference number which strengthens all your other claims.",
      type: "checklist",
      action_config: {
        checklist_items: [
          "Go to actionfraud.police.uk and file an online report (or call 0300 123 2040)",
          "Select fraud type: advance fee fraud or consumer fraud (whichever best matches your situation)",
          "Include: the company name and Companies House number, the director names (listed on Companies House), the amount paid, dates of payment and work, the Gazette notice dates, and all evidence of correspondence",
          "Save your crime reference number - you will need this for your bank claim and Trading Standards report",
          "If the amount is significant or the directors are still operating under a new company name, mention this in the report",
        ],
        checklist_tip:
          "Action Fraud reports are triaged by the National Fraud Intelligence Bureau. Individual cases may not be investigated, but your report contributes to intelligence and the crime reference number is critical for your bank APP fraud claim.",
      },
      next_step_id: "report-trading-standards",
    },
    {
      id: "post-payment-dissolution",
      title: "Company dissolved after you paid",
      description:
        "The company applied to dissolve after taking your money. This is less clear-cut than pre-payment dissolution, but you still have strong routes.",
      type: "info",
      action_config: {
        checklist_tip:
          "Under s.1003 Companies Act 2006, directors must notify all creditors before applying to strike off. If you had an outstanding contract or were owed work/goods, you are a creditor and should have been notified. If you were not notified, this is a breach of their statutory duty. You can: (1) object to the strike-off if it has not yet completed, (2) apply to restore the company if it has been dissolved, or (3) pursue the directors personally. The fraud angle is weaker here but not absent - if they took payment knowing they intended to dissolve the company, that is still potentially fraudulent.",
      },
      next_step_id: "dissolution-status-check",
    },
    {
      id: "dissolution-status-check",
      title: "Has the company been fully dissolved yet?",
      description: "Your next step depends on whether the strike-off has completed.",
      type: "branch",
      action_config: {
        branch_question: "What is the company status on Companies House right now?",
        branch_options: [
          {
            label: "Active - Proposal to Strike Off (not yet dissolved)",
            next_step_id: "object-to-strikeoff",
          },
          { label: "Dissolved", next_step_id: "report-trading-standards" },
        ],
      },
    },
    {
      id: "object-to-strikeoff",
      title: "Object to the strike-off",
      description:
        "The company has not been dissolved yet. You can object to the strike-off, which suspends the dissolution process and keeps the company on the register so you can pursue your claim.",
      type: "action_draft_letter",
      action_config: {
        letter_type: "initial_complaint",
        prompt_context: "dissolved_company_object_strikeoff",
        wait_message:
          "Companies House should acknowledge your objection. The strike-off process will be suspended while the objection is active. This buys you time to pursue your claim against the company.",
      },
      legal_basis:
        "s.1003 Companies Act 2006 (duty to notify creditors); interested parties may object to voluntary strike-off before dissolution completes.",
      next_step_id: "report-trading-standards",
    },
    {
      id: "report-trading-standards",
      title: "Report to Trading Standards",
      description:
        "Trading Standards investigates businesses that break consumer protection law. Even if they do not take action on your individual case, the report creates an official record.",
      type: "checklist",
      action_config: {
        checklist_items: [
          "Call Citizens Advice consumer service on 0808 223 1133 and explain that you have been affected by a company that traded while being dissolved",
          "They will log a report with Trading Standards and may refer you for additional support",
          "Provide: the company name, Companies House number, director names, your crime reference number from Action Fraud (if you have one), and a summary of what happened",
          "Ask for a reference number for the Trading Standards report",
        ],
        checklist_tip:
          "Trading Standards can prosecute directors for unfair commercial practices under the Consumer Protection from Unfair Trading Regulations 2008. Your report helps build a case even if they cannot resolve your individual complaint.",
      },
      next_step_id: "payment-method-check",
    },
    {
      id: "payment-method-check",
      title: "How did you pay?",
      description: "Your money recovery route depends on how you paid.",
      type: "branch",
      action_config: {
        branch_question: "How did you pay the company?",
        branch_options: [
          { label: "Bank transfer", next_step_id: "bank-app-fraud" },
          { label: "Credit card", next_step_id: "credit-card-route" },
          { label: "Debit card", next_step_id: "debit-card-route" },
          { label: "Cash or other method", next_step_id: "no-card-protection" },
        ],
      },
    },
    {
      id: "bank-app-fraud",
      title: "Claim APP fraud reimbursement from your bank",
      description:
        "Since October 2024, banks must reimburse victims of authorised push payment (APP) fraud in most cases. If the company was dissolved when they invoiced you, your payment was induced by fraudulent misrepresentation.",
      type: "action_draft_letter",
      action_config: {
        letter_type: "initial_complaint",
        prompt_context: "dissolved_company_app_fraud",
        wait_message:
          "Your bank should acknowledge your claim within a few days. They must investigate and respond. Keep your Action Fraud crime reference number to hand as the bank may request it.",
      },
      legal_basis:
        "Payment Systems Regulator mandatory APP fraud reimbursement framework (from 7 October 2024); fraudulent misrepresentation inducing the transfer.",
      next_step_id: "bank-response-check",
    },
    {
      id: "credit-card-route",
      title: "File a Section 75 claim with your credit card provider",
      description:
        "Under Section 75 of the Consumer Credit Act 1974, your credit card provider is jointly liable for any breach of contract by the company. The company ceasing to exist while under contract to you is a clear breach.",
      type: "action_draft_letter",
      action_config: {
        letter_type: "section_75_claim",
        prompt_context: "dissolved_company_section75",
        wait_message:
          "Your credit card provider must investigate your Section 75 claim. If the individual item or service value was between £100 and £30,000, you have strong statutory protection.",
      },
      legal_basis: "Consumer Credit Act 1974, section 75 (joint liability for breach of contract).",
      next_step_id: "bank-response-check",
    },
    {
      id: "debit-card-route",
      title: "Request a chargeback through your bank",
      description:
        "Chargeback is not a legal right but a voluntary scheme operated by Visa and Mastercard. Your bank can attempt to reclaim the payment. You must act within 120 days of the transaction.",
      type: "action_draft_letter",
      action_config: {
        letter_type: "initial_complaint",
        prompt_context: "dissolved_company_chargeback",
        wait_message:
          "Your bank will process the chargeback request through the card scheme. The retailer (or their bank) can dispute it. If the company is dissolved, they are unlikely to dispute.",
      },
      next_step_id: "bank-response-check",
    },
    {
      id: "no-card-protection",
      title: "No card payment protection available",
      description:
        "You paid by cash or another method without card protection. Your main routes are pursuing the directors personally or applying to restore the company.",
      type: "info",
      action_config: {
        checklist_tip:
          "Without card payment protection, your strongest routes are: (1) pursuing the directors personally for fraudulent or wrongful trading, (2) applying to court to restore the company under s.1029 Companies Act 2006 so you can pursue a claim against it, or (3) small claims court against the directors as individuals if you have evidence they personally received or benefited from your payment. Make sure you have filed your Action Fraud report and Trading Standards complaint as these support any legal action.",
      },
      next_step_id: "consider-restoration",
    },
    {
      id: "bank-response-check",
      title: "Has your bank or card provider responded?",
      description: "Check whether your bank has responded to your claim.",
      type: "branch",
      action_config: {
        branch_question: "What has happened with your bank/card provider claim?",
        branch_options: [
          {
            label: "They have refunded my money",
            next_step_id: "assess-remaining-loss",
          },
          { label: "They have refused my claim", next_step_id: "escalate-to-fos" },
          {
            label: "They have not responded (8 weeks have passed)",
            next_step_id: "escalate-to-fos",
          },
          {
            label: "They have offered a partial refund",
            next_step_id: "escalate-to-fos",
          },
        ],
      },
    },
    {
      id: "escalate-to-fos",
      title: "Escalate to the Financial Ombudsman Service",
      description:
        "Your bank or card provider has refused or failed to respond to your claim. You can now escalate to the Financial Ombudsman Service (FOS). FOS is free and independent.",
      type: "action_draft_letter",
      action_config: {
        letter_type: "ombudsman_referral",
        prompt_context: "dissolved_company_fos_escalation",
        wait_message:
          "FOS will acknowledge your complaint and assign a case handler. They will request information from both you and the bank. This process can take several months but you do not need a solicitor.",
      },
      legal_basis:
        "Financial Ombudsman Service — compulsory jurisdiction over most regulated payment and lending complaints after internal dispute resolution.",
      next_step_id: "fos-response-check",
    },
    {
      id: "fos-response-check",
      title: "FOS outcome",
      description: "Check the outcome of your Financial Ombudsman complaint.",
      type: "branch",
      action_config: {
        branch_question: "What was the FOS outcome?",
        branch_options: [
          {
            label: "FOS ruled in my favour - bank must reimburse me",
            next_step_id: "assess-remaining-loss",
          },
          {
            label: "FOS ruled against me",
            next_step_id: "consider-restoration",
          },
          {
            label: "Still waiting for a decision",
            next_step_id: "fos-response-check",
          },
        ],
      },
    },
    {
      id: "assess-remaining-loss",
      title: "Have you recovered all your money?",
      description: "Check whether the bank refund or FOS award covers your full loss.",
      type: "branch",
      action_config: {
        branch_question: "Has your full loss been recovered?",
        branch_options: [
          { label: "Yes - I have been fully reimbursed", next_step_id: "resolved" },
          {
            label: "No - I am still out of pocket for some of the loss",
            next_step_id: "consider-restoration",
          },
        ],
      },
    },
    {
      id: "consider-restoration",
      title: "Consider applying to restore the company",
      description:
        "If the company has been dissolved and you have not recovered your money through other routes, you can apply to court to restore the company to the Companies House register under s.1029 Companies Act 2006. This allows you to pursue a claim against it.",
      type: "info",
      action_config: {
        checklist_tip:
          "Applying to restore a company requires a court application. The court fee is approximately £280 (check current fees at gov.uk). You must show you had a claim against the company at the time of dissolution. Once restored, the company is treated as if it was never dissolved and you can issue legal proceedings against it. Alternatively, you can pursue the directors personally - if they traded through a company they knew was being dissolved, they may have lost the protection of limited liability. For claims under £10,000 you can use the small claims court against the directors as individuals. For either route, consider whether the directors have assets to pay any judgment. A solicitor offering a free initial consultation can help you assess whether this is worth pursuing.",
      },
      legal_basis: "s.1029 Companies Act 2006 (application to restore a company to the register).",
      next_step_id: "pursue-directors",
    },
    {
      id: "pursue-directors",
      title: "Send a Letter Before Action to the directors",
      description:
        "Before issuing court proceedings, you must send a formal Letter Before Action to the directors personally. This gives them a final opportunity to settle and is required by the court pre-action protocol.",
      type: "action_draft_letter",
      action_config: {
        letter_type: "letter_before_action",
        prompt_context: "dissolved_company_lba_directors",
        wait_message:
          "The directors have 14 days to respond to the Letter Before Action. If they do not respond or refuse to settle, you can issue proceedings in the small claims court (for claims up to £10,000) or county court.",
      },
      legal_basis:
        "Practice Direction on Pre-Action Conduct; potential personal liability (e.g. misrepresentation, s.993 Companies Act 2006, s.246ZB Insolvency Act 1986).",
      next_step_id: "directors-response-check",
    },
    {
      id: "directors-response-check",
      title: "Have the directors responded?",
      description: "Check whether the directors have responded to your Letter Before Action.",
      type: "branch",
      action_config: {
        branch_question: "What happened after sending the Letter Before Action?",
        branch_options: [
          {
            label: "They have paid or offered a satisfactory settlement",
            next_step_id: "resolved",
          },
          {
            label: "They have refused or not responded",
            next_step_id: "court-info",
          },
          {
            label: "They have offered a partial settlement",
            next_step_id: "court-info",
          },
        ],
      },
    },
    {
      id: "court-info",
      title: "Consider court proceedings",
      description: "The directors have not settled. You can now issue court proceedings.",
      type: "info",
      action_config: {
        checklist_tip:
          "For claims up to £10,000, you can use the small claims court via Money Claims Online (moneyclaims.service.gov.uk). Court fees are on a sliding scale based on the claim amount (for example, approximately £115 for claims between £1,001 and £1,500, or £455 for claims between £5,001 and £10,000). You do not need a solicitor for small claims. Name the directors as defendants (their home addresses are on the Companies House filing for the dissolved company under Officer Appointments). In your Particulars of Claim, cite: breach of contract, fraudulent misrepresentation (the directors represented they were trading as a valid company when the company was being dissolved), and breach of duty under s.1003 Companies Act 2006 (failure to notify creditors). Attach your evidence: Companies House screenshots, Gazette notices, invoice, payment proof, correspondence, Action Fraud reference, and the Letter Before Action.",
        letter_before_action: true,
      },
      next_step_id: "resolved",
    },
    {
      id: "resolved",
      title: "Case resolved",
      description:
        "Your case has been resolved. Please record the outcome so we can help others in similar situations.",
      type: "complete",
      action_config: { suggest_outcome_link: true },
    },
  ],
};
