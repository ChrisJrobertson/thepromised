-- Schema fixes:
-- 1. Expand letter_type CHECK constraint to include journey system types
-- 2. Add notification_preferences column to profiles
-- 3. Add share_token / is_shared columns to cases

-- ── 1. Fix letter_type CHECK constraint ──────────────────────────────────────
-- The journey system uses adr_referral, section_75_claim, and letter_before_action
-- which were not in the original constraint, causing the API to fall back to "custom".
ALTER TABLE public.letters DROP CONSTRAINT IF EXISTS letters_letter_type_check;

ALTER TABLE public.letters
  ADD CONSTRAINT letters_letter_type_check
  CHECK (letter_type IN (
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
  ));

-- ── 2. Add notification_preferences to profiles ───────────────────────────────
-- The cron and settings/notifications page both reference this column.
-- Default empty object means "all notifications enabled" (cron treats missing keys as on).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{}';

COMMENT ON COLUMN public.profiles.notification_preferences IS
  'User notification preferences. Keys: email_reminders (bool), email_escalation_alerts (bool), email_promise_broken (bool)';

-- ── 3. Add share_token / is_shared to cases ───────────────────────────────────
-- These columns are used by the shareable case links feature and referenced in
-- the TypeScript types and API, but were never added via a migration.
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS share_token text;

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS is_shared boolean DEFAULT false;

-- Unique constraint so tokens cannot collide
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cases_share_token_key'
      AND conrelid = 'public.cases'::regclass
  ) THEN
    ALTER TABLE public.cases ADD CONSTRAINT cases_share_token_key UNIQUE (share_token);
  END IF;
END $$;

-- Index for fast token lookups on the public shared page
CREATE INDEX IF NOT EXISTS idx_cases_share_token
  ON public.cases (share_token)
  WHERE share_token IS NOT NULL;
