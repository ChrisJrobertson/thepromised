import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CaseInsert,
  EvidenceInsert,
  InteractionInsert,
  LetterInsert,
  ProfileInsert,
  SupabaseDatabase,
} from "@/types/database";

const TEST_USER_ID = "8c9b2d5a-9a8c-41ad-a2f6-76a48e9e3f11";

const CASE_IDS = {
  energy: "f5b3b9d8-55aa-4c05-8f4f-0aa40d071d01",
  broadband: "f5b3b9d8-55aa-4c05-8f4f-0aa40d071d02",
  bank: "f5b3b9d8-55aa-4c05-8f4f-0aa40d071d03",
} as const;

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

function isoDaysAhead(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export async function seedTestData(
  supabase: SupabaseClient<SupabaseDatabase>
) {
  const { data: organisations } = await supabase
    .from("organisations")
    .select("id, name")
    .in("name", ["British Gas", "BT", "HSBC"]);

  const organisationMap = new Map(
    (organisations ?? []).map((org) => [org.name, org.id])
  );

  const profile: ProfileInsert = {
    id: TEST_USER_ID,
    email: "test@thepromised.app",
    full_name: "Alex Thompson",
    postcode: "SW1A 1AA",
    subscription_tier: "pro",
    subscription_status: "active",
    cases_count: 3,
    ai_credits_used: 0,
  };

  const cases: CaseInsert[] = [
    {
      id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      organisation_id: organisationMap.get("British Gas") ?? null,
      custom_organisation_name: null,
      category: "energy",
      title: "Incorrect billing after smart meter installation",
      description:
        "Bills increased unexpectedly after smart meter installation. Meter readings appear incorrect.",
      status: "escalated",
      priority: "high",
      amount_in_dispute: 347.82,
      escalation_stage: "formal_complaint",
      first_contact_date: isoDaysAgo(45),
      escalation_deadline: isoDaysAhead(11),
      interaction_count: 7,
    },
    {
      id: CASE_IDS.broadband,
      user_id: TEST_USER_ID,
      organisation_id: organisationMap.get("BT") ?? null,
      custom_organisation_name: null,
      category: "broadband_phone",
      title: "Broadband speed consistently below guaranteed minimum",
      description:
        "Speeds have stayed below guaranteed minimum for two weeks despite troubleshooting.",
      status: "open",
      priority: "medium",
      amount_in_dispute: 0,
      escalation_stage: "initial",
      first_contact_date: isoDaysAgo(14),
      escalation_deadline: isoDaysAhead(42),
      interaction_count: 3,
    },
    {
      id: CASE_IDS.bank,
      user_id: TEST_USER_ID,
      organisation_id: organisationMap.get("HSBC") ?? null,
      custom_organisation_name: null,
      category: "financial_services",
      title: "Unauthorised transaction dispute",
      description:
        "Customer disputed unauthorised card transaction and sought reimbursement.",
      status: "resolved",
      priority: "high",
      amount_in_dispute: 189.99,
      escalation_stage: "ombudsman",
      first_contact_date: isoDaysAgo(60),
      resolved_date: isoDaysAgo(6),
      compensation_received: 189.99,
      interaction_count: 5,
    },
  ];

  const interactions: InteractionInsert[] = [
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-111111111101",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(45),
      channel: "phone",
      direction: "outbound",
      summary:
        "Reported incorrect billing and meter discrepancy. Agent promised a callback within 48 hours.",
      contact_name: "Sarah",
      contact_department: "Billing",
      promises_made: "Callback with corrected bill in 48 hours",
      promise_deadline: isoDaysAgo(43),
      promise_fulfilled: false,
      outcome: "promised_callback",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-111111111102",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(43),
      channel: "phone",
      direction: "outbound",
      summary:
        "No callback received. Called again and was transferred three times without resolution.",
      contact_department: "Customer Services",
      outcome: "transferred",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-111111111103",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(38),
      channel: "email",
      direction: "outbound",
      summary: "Sent formal written complaint by email.",
      reference_number: "BG-CASE-4471",
      outcome: "escalated",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-111111111104",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(36),
      channel: "letter",
      direction: "inbound",
      summary: "Received complaint acknowledgement letter with reference number.",
      reference_number: "BG-CASE-4471",
      outcome: "other",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-111111111105",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(29),
      channel: "phone",
      direction: "inbound",
      summary:
        "Offered £50 goodwill payment. Offer rejected due to higher disputed amount.",
      promises_made: "Manager will review and return with revised offer",
      promise_deadline: isoDaysAgo(24),
      promise_fulfilled: false,
      outcome: "promised_action",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-111111111106",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(21),
      channel: "email",
      direction: "outbound",
      summary:
        "Escalated complaint to complaints manager and requested final response.",
      outcome: "escalated",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-111111111107",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(3),
      channel: "webchat",
      direction: "outbound",
      summary: "Webchat follow-up confirms case still under review.",
      promises_made: "Written update within 3 working days",
      promise_deadline: isoDaysAhead(2),
      promise_fulfilled: null,
      outcome: "promised_action",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-222222222201",
      case_id: CASE_IDS.broadband,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(14),
      channel: "phone",
      direction: "outbound",
      summary:
        "Reported speeds below guaranteed minimum. Asked for engineer check.",
      outcome: "other",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-222222222202",
      case_id: CASE_IDS.broadband,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(9),
      channel: "webchat",
      direction: "inbound",
      summary: "BT support advised line reset and promised update in one week.",
      promises_made: "Provide update after network diagnostics",
      promise_deadline: isoDaysAhead(1),
      promise_fulfilled: null,
      outcome: "promised_callback",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-222222222203",
      case_id: CASE_IDS.broadband,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(4),
      channel: "email",
      direction: "outbound",
      summary: "Requested compensation details in writing.",
      outcome: "other",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-333333333301",
      case_id: CASE_IDS.bank,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(60),
      channel: "phone",
      direction: "outbound",
      summary: "Reported unauthorised card transaction and requested immediate freeze.",
      outcome: "other",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-333333333302",
      case_id: CASE_IDS.bank,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(54),
      channel: "email",
      direction: "outbound",
      summary: "Submitted supporting evidence and dispute form.",
      outcome: "other",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-333333333303",
      case_id: CASE_IDS.bank,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(41),
      channel: "letter",
      direction: "inbound",
      summary: "Bank final response rejected reimbursement request.",
      outcome: "no_resolution",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-333333333304",
      case_id: CASE_IDS.bank,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(24),
      channel: "email",
      direction: "outbound",
      summary: "Escalated complaint to Financial Ombudsman Service.",
      outcome: "escalated",
    },
    {
      id: "f1a0b1c2-d3e4-4f56-8a90-333333333305",
      case_id: CASE_IDS.bank,
      user_id: TEST_USER_ID,
      interaction_date: isoDaysAgo(6),
      channel: "email",
      direction: "inbound",
      summary: "Confirmed reimbursement and compensation paid in full.",
      outcome: "resolved",
    },
  ];

  const evidence: EvidenceInsert[] = [
    {
      id: "e100b1c2-d3e4-4f56-8a90-444444444401",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      interaction_id: "f1a0b1c2-d3e4-4f56-8a90-111111111103",
      file_name: "billing-screenshot.png",
      file_type: "image/png",
      file_size: 182000,
      storage_path: `${TEST_USER_ID}/${CASE_IDS.energy}/billing-screenshot.png`,
      evidence_type: "screenshot",
      description: "Screenshot showing incorrect smart meter charges",
    },
    {
      id: "e100b1c2-d3e4-4f56-8a90-444444444402",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      interaction_id: "f1a0b1c2-d3e4-4f56-8a90-111111111106",
      file_name: "formal-complaint-email.txt",
      file_type: "text/plain",
      file_size: 7600,
      storage_path: `${TEST_USER_ID}/${CASE_IDS.energy}/formal-complaint-email.txt`,
      evidence_type: "email",
    },
    {
      id: "e100b1c2-d3e4-4f56-8a90-444444444403",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      interaction_id: "f1a0b1c2-d3e4-4f56-8a90-111111111104",
      file_name: "acknowledgement-letter.pdf",
      file_type: "application/pdf",
      file_size: 245000,
      storage_path: `${TEST_USER_ID}/${CASE_IDS.energy}/acknowledgement-letter.pdf`,
      evidence_type: "letter",
    },
  ];

  const letters: LetterInsert[] = [
    {
      id: "l100b1c2-d3e4-4f56-8a90-555555555501",
      case_id: CASE_IDS.energy,
      user_id: TEST_USER_ID,
      letter_type: "initial_complaint",
      recipient_name: "British Gas Complaints",
      subject: "Formal complaint — incorrect billing after smart meter installation",
      body: "Please treat this as a formal complaint regarding incorrect billing.",
      status: "draft",
      sent_via: "not_sent",
      ai_generated: true,
    },
    {
      id: "l100b1c2-d3e4-4f56-8a90-555555555502",
      case_id: CASE_IDS.bank,
      user_id: TEST_USER_ID,
      letter_type: "escalation",
      recipient_name: "HSBC Complaints Team",
      subject: "Escalation — unauthorised transaction dispute",
      body: "I am escalating this dispute due to your final response.",
      status: "sent",
      sent_via: "email",
      sent_date: isoDaysAgo(23),
      ai_generated: false,
    },
    {
      id: "l100b1c2-d3e4-4f56-8a90-555555555503",
      case_id: CASE_IDS.bank,
      user_id: TEST_USER_ID,
      letter_type: "ombudsman_referral",
      recipient_name: "Financial Ombudsman Service",
      subject: "Referral request — unauthorised transaction",
      body: "Please review this dispute and attached timeline.",
      status: "sent",
      sent_via: "post",
      sent_date: isoDaysAgo(18),
      ai_generated: false,
    },
  ];

  await supabase.from("profiles").upsert(profile, { onConflict: "id" });
  await supabase.from("cases").upsert(cases, { onConflict: "id" });
  await supabase.from("interactions").upsert(interactions, { onConflict: "id" });
  await supabase.from("evidence").upsert(evidence, { onConflict: "id" });
  await supabase.from("letters").upsert(letters, { onConflict: "id" });

  return {
    user_id: TEST_USER_ID,
    cases_seeded: cases.length,
    interactions_seeded: interactions.length,
    evidence_seeded: evidence.length,
    letters_seeded: letters.length,
  };
}
