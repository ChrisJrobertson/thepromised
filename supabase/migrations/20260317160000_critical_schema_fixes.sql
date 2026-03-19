-- RUN THIS MIGRATION: Go to Supabase Dashboard → SQL Editor → paste and run
-- Or use: supabase db push (if using Supabase CLI)
--
-- Fixes four critical issues identified in the TheyPromised schema audit:
--   C1: complaint_packs RLS — {public} policy exposes all packs to all authenticated users
--   C2: cases.organisation_id FK — ON DELETE CASCADE must be SET NULL to protect user data
--   C3: profiles.notification_preferences default — '{}' causes all reminder emails to fail
--   C4: b2b_pilots + b2b_outreach_emails RLS — {public} policies expose admin data

-- ============================================================
-- C1: Fix complaint_packs RLS
-- "Service role can manage packs" and "Users can view own packs" were both
-- scoped to PUBLIC, allowing any authenticated user to read/modify all packs.
-- Service role bypasses RLS entirely. Replace with properly scoped policies.
-- ============================================================

DROP POLICY IF EXISTS "Service role can manage packs" ON public.complaint_packs;
DROP POLICY IF EXISTS "Users can view own packs" ON public.complaint_packs;

-- Authenticated users: SELECT and INSERT own rows only.
-- UPDATE/DELETE managed exclusively via Stripe webhooks (service_role bypasses RLS).
DROP POLICY IF EXISTS "complaint_packs_select_own" ON public.complaint_packs;
CREATE POLICY "complaint_packs_select_own"
  ON public.complaint_packs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "complaint_packs_insert_own" ON public.complaint_packs;
CREATE POLICY "complaint_packs_insert_own"
  ON public.complaint_packs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- C2: Fix cases.organisation_id FK — CASCADE → SET NULL
-- Previously: deleting an organisation row would CASCADE-delete all linked cases.
-- Fix: nullify organisation_id on linked cases instead, preserving user data.
-- ============================================================

ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_organisation_id_fkey;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_organisation_id_fkey
  FOREIGN KEY (organisation_id)
  REFERENCES public.organisations(id)
  ON DELETE SET NULL;

-- ============================================================
-- C3: Fix profiles.notification_preferences default
-- Column default was '{}' (empty object). Cron job reads individual keys
-- (email_reminders, email_escalation_alerts, etc.) — with {}, these are
-- undefined (falsy), so no reminder or escalation emails are sent.
-- Fix the default and backfill all existing rows with the empty object.
-- ============================================================

ALTER TABLE public.profiles
  ALTER COLUMN notification_preferences
  SET DEFAULT '{"email_reminders": true, "email_escalation_alerts": true, "email_promise_alerts": true, "weekly_summary": false, "product_updates": true}'::jsonb;

-- Backfill existing rows that have the empty default {}.
-- We preserve any row that already has real preferences (not just {}).
UPDATE public.profiles
SET notification_preferences = '{"email_reminders": true, "email_escalation_alerts": true, "email_promise_alerts": true, "weekly_summary": false, "product_updates": true}'::jsonb
WHERE notification_preferences = '{}'::jsonb
   OR notification_preferences IS NULL;

-- ============================================================
-- C4: Fix b2b_pilots and b2b_outreach_emails RLS
-- Same {public} role issue as C1 — admin data exposed to all authenticated users.
-- Drop the overly-permissive policies; service_role bypasses RLS so no replacement needed.
-- ============================================================

DROP POLICY IF EXISTS "Service role can manage b2b pilots" ON public.b2b_pilots;
DROP POLICY IF EXISTS "Service role can manage b2b outreach emails" ON public.b2b_outreach_emails;

-- Re-add as service_role scoped (so the intent is documented, even though
-- service_role bypasses RLS — belt-and-suspenders).
CREATE POLICY "service_role_manage_b2b_pilots"
  ON public.b2b_pilots
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_manage_b2b_outreach_emails"
  ON public.b2b_outreach_emails
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
