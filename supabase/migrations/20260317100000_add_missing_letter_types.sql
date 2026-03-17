-- Fix the letters.letter_type CHECK constraint to include all 11 valid types.
-- The initial migration only included 8 types; adr_referral, section_75_claim,
-- and letter_before_action exist in the application code but would fail on insert.

ALTER TABLE letters DROP CONSTRAINT IF EXISTS letters_letter_type_check;

ALTER TABLE letters ADD CONSTRAINT letters_letter_type_check CHECK (
  letter_type IN (
    'initial_complaint',
    'follow_up',
    'escalation',
    'final_response_request',
    'ombudsman_referral',
    'subject_access_request',
    'formal_notice',
    'custom',
    'adr_referral',
    'section_75_claim',
    'letter_before_action'
  )
);
