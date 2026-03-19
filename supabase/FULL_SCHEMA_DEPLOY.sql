-- =============================================================================
-- TheyPromised — Full Schema Deploy Script
-- Generated from verified production schema on 2026-03-17
-- Target: abdpadjifqeozygafzto.supabase.co
--
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard/project/abdpadjifqeozygafzto
--   2. SQL Editor → New Query
--   3. Paste this entire file and click Run
--   4. After success, run supabase/JOURNEY_TEMPLATES_SEED.sql in a second query
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Sequences ────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS cases_ref_seq START 1;

-- =============================================================================
-- TABLES
-- =============================================================================

-- ── profiles ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                  text NOT NULL,
  full_name              text,
  phone                  text,
  address_line_1         text,
  address_line_2         text,
  city                   text,
  postcode               text,
  stripe_customer_id     text UNIQUE,
  subscription_tier      text DEFAULT 'free',
  subscription_status    text DEFAULT 'active'
                         CONSTRAINT profiles_subscription_status_check
                         CHECK (subscription_status IN ('active','cancelled','past_due','trialing','pack_temporary')),
  subscription_id        text,
  cases_count            integer DEFAULT 0,
  ai_credits_used        integer DEFAULT 0,
  ai_credits_reset_at    timestamptz DEFAULT now(),
  ai_suggestions_used    integer DEFAULT 0,
  ai_letters_used        integer DEFAULT 0,
  is_admin               boolean DEFAULT false,
  last_export_at         timestamptz,
  pack_pro_expires_at    timestamptz,
  pack_access_case_id    uuid,
  pack_source_pack_id    uuid,
  notification_preferences jsonb DEFAULT '{"email_reminders":true,"email_escalation_alerts":true,"email_promise_alerts":true,"weekly_summary":false,"product_updates":true}'::jsonb,
  organisation_id        uuid,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- ── organisations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organisations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  category              text,
  complaint_email       text,
  complaint_phone       text,
  complaint_address     text,
  website               text,
  ombudsman_name        text,
  ombudsman_url         text,
  escalation_wait_weeks integer DEFAULT 8,
  notes                 text,
  is_verified           boolean DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ── cases ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cases (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref                      text NOT NULL,  -- Auto-generated TP-XXXXX by trigger
  user_id                  uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  organisation_id          uuid REFERENCES public.organisations(id) ON DELETE SET NULL,
  custom_organisation_name text,
  category                 text,
  title                    text NOT NULL,
  description              text,
  status                   text NOT NULL DEFAULT 'open'
                           CONSTRAINT cases_status_check
                           CHECK (status IN ('open','escalated','resolved','closed')),
  priority                 text NOT NULL DEFAULT 'medium'
                           CONSTRAINT cases_priority_check
                           CHECK (priority IN ('low','medium','high','urgent')),
  reference_number         text,
  desired_outcome          text,
  amount_in_dispute        numeric(10,2),
  escalation_stage         text DEFAULT 'initial',
  escalation_deadline      timestamptz,
  first_contact_date       timestamptz,
  last_interaction_date    timestamptz,
  resolved_date            timestamptz,
  resolution_summary       text,
  compensation_received    numeric(10,2),
  interaction_count        integer DEFAULT 0,
  share_token              text UNIQUE,
  is_shared                boolean DEFAULT false,
  response_deadline        timestamptz,
  response_received        boolean DEFAULT false,
  response_received_at     timestamptz,
  inbound_email_alias      text,
  outcome_satisfaction     text
                           CONSTRAINT cases_outcome_satisfaction_check
                           CHECK (outcome_satisfaction IN ('yes','partially','no')),
  outcome_resolution_type  text
                           CONSTRAINT cases_outcome_resolution_type_check
                           CHECK (outcome_resolution_type IN ('refund','compensation','apology','replacement','service_fix','nothing','other')),
  outcome_amount_pence     integer,
  outcome_notes            text,
  resolved_at              timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

-- ── interactions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interactions (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id          uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interaction_date timestamptz NOT NULL,
  channel          text NOT NULL
                   CONSTRAINT interactions_channel_check
                   CHECK (channel IN ('phone','email','letter','webchat','in_person','social_media','app','other')),
  direction        text NOT NULL
                   CONSTRAINT interactions_direction_check
                   CHECK (direction IN ('inbound','outbound')),
  contact_name     text,
  contact_department text,
  contact_role     text,
  reference_number text,
  duration_minutes integer,
  summary          text NOT NULL,
  promises_made    text,
  promise_deadline timestamptz,
  promise_fulfilled boolean,
  outcome          text
                   CONSTRAINT interactions_outcome_check
                   CHECK (outcome IN ('resolved','escalated','promised_callback','promised_action','no_resolution','transferred','disconnected','letter_sent','other')),
  next_steps       text,
  mood             text
                   CONSTRAINT interactions_mood_check
                   CHECK (mood IN ('helpful','neutral','unhelpful','hostile')),
  ai_summary       text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── evidence ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.evidence (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id      uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  interaction_id uuid REFERENCES public.interactions(id) ON DELETE SET NULL,
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name    text NOT NULL,
  file_type    text NOT NULL,
  file_size    integer NOT NULL,
  storage_path text NOT NULL,
  description  text,
  evidence_type text
                CONSTRAINT evidence_evidence_type_check
                CHECK (evidence_type IN ('screenshot','email','letter','photo','voice_memo','document','receipt','contract','other')),
  created_at   timestamptz DEFAULT now()
);

-- ── letters ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.letters (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id          uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  letter_type      text NOT NULL
                   CONSTRAINT letters_letter_type_check
                   CHECK (letter_type IN ('initial_complaint','follow_up','escalation','final_response_request','ombudsman_referral','subject_access_request','formal_notice','custom','adr_referral','section_75_claim','letter_before_action')),
  recipient_name   text,
  recipient_address text,
  subject          text NOT NULL,
  body             text NOT NULL,
  ai_generated     boolean DEFAULT false,
  sent_date        timestamptz,
  sent_via         text
                   CONSTRAINT letters_sent_via_check
                   CHECK (sent_via IN ('email','post','not_sent')),
  status           text DEFAULT 'draft'
                   CONSTRAINT letters_status_check
                   CHECK (status IN ('draft','sent','acknowledged')),
  sent_at          timestamptz,
  sent_to_email    text,
  resend_email_id  text,
  delivery_status  text DEFAULT 'draft',
  delivered_at     timestamptz,
  opened_at        timestamptz,
  bounced_at       timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── escalation_rules ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.escalation_rules (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category         text NOT NULL,
  stage            text NOT NULL,
  stage_order      integer NOT NULL,
  title            text NOT NULL,
  description      text NOT NULL,
  action_required  text NOT NULL,
  wait_period_days integer,
  deadline_type    text
                   CONSTRAINT escalation_rules_deadline_type_check
                   CHECK (deadline_type IN ('from_complaint','from_response','absolute')),
  regulatory_body  text,
  regulatory_url   text,
  template_available boolean DEFAULT false,
  tips             text,
  created_at       timestamptz DEFAULT now()
);

-- ── reminders ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reminders (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id       uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  interaction_id uuid REFERENCES public.interactions(id) ON DELETE SET NULL,
  reminder_type text NOT NULL
                CONSTRAINT reminders_reminder_type_check
                CHECK (reminder_type IN ('promise_deadline','escalation_window','follow_up','custom','response_approaching','response_due','response_overdue','notification')),
  title         text NOT NULL,
  description   text,
  due_date      timestamptz NOT NULL,
  is_sent       boolean DEFAULT false,
  is_dismissed  boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- ── exports ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exports (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id      uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name    text NOT NULL,
  storage_path text NOT NULL,
  export_type  text DEFAULT 'full_case'
               CONSTRAINT exports_export_type_check
               CHECK (export_type IN ('full_case','timeline_only','letters_only')),
  created_at   timestamptz DEFAULT now()
);

-- ── monthly_ai_usage ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.monthly_ai_usage (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year       text NOT NULL,
  suggestions_used integer DEFAULT 0,
  letters_used     integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- ── complaint_packs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.complaint_packs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id               uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  pack_type             text NOT NULL,
  status                text NOT NULL DEFAULT 'purchased'
                        CONSTRAINT complaint_packs_status_check
                        CHECK (status IN ('purchased','in_progress','fulfilled','refunded','cancelled')),
  stripe_payment_id     text,
  amount_paid           integer NOT NULL,
  currency              text NOT NULL DEFAULT 'gbp',
  purchased_at          timestamptz DEFAULT now(),
  completed_at          timestamptz,
  notes                 text,
  checkout_session_id   text,
  entitlement_expires_at timestamptz,
  entitlement_case_id   uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ── business_enquiries ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.business_enquiries (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name             text NOT NULL,
  contact_name             text NOT NULL,
  email                    text NOT NULL,
  role                     text,
  message                  text,
  website                  text,
  sector                   text,
  complaint_volume_estimate text,
  consent_to_contact       boolean DEFAULT false,
  source_ip                text,
  user_agent               text,
  created_at               timestamptz DEFAULT now()
);

-- ── b2b_pilots ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.b2b_pilots (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name          text NOT NULL,
  contact_name          text NOT NULL,
  contact_email         text NOT NULL,
  contact_role          text,
  organisation_id       uuid REFERENCES public.organisations(id),
  plan_type             text NOT NULL DEFAULT 'standard',
  monthly_fee           integer NOT NULL,
  currency              text NOT NULL DEFAULT 'gbp',
  status                text NOT NULL DEFAULT 'enquiry'
                        CONSTRAINT b2b_pilots_status_check
                        CHECK (status IN ('enquiry','contacted','pilot_started','active','churned')),
  stripe_customer_id    text,
  stripe_subscription_id text,
  started_at            timestamptz,
  notes                 text,
  business_enquiry_id   uuid REFERENCES public.business_enquiries(id) ON DELETE SET NULL,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ── b2b_outreach_emails ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.b2b_outreach_emails (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  uuid REFERENCES public.organisations(id) ON DELETE SET NULL,
  b2b_pilot_id     uuid REFERENCES public.b2b_pilots(id) ON DELETE SET NULL,
  recipient_email  text NOT NULL,
  resend_email_id  text,
  status           text NOT NULL DEFAULT 'sent',
  subject          text NOT NULL,
  sent_at          timestamptz DEFAULT now(),
  delivered_at     timestamptz,
  opened_at        timestamptz,
  bounced_at       timestamptz,
  complained_at    timestamptz,
  metadata         jsonb,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── journey_templates ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.journey_templates (
  id          text PRIMARY KEY,
  category    text NOT NULL DEFAULT '',
  title       text NOT NULL DEFAULT '',
  description text,
  sector      text NOT NULL DEFAULT '',
  steps       jsonb NOT NULL DEFAULT '[]',
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── user_journeys ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_journeys (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id            uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  template_id        text NOT NULL REFERENCES public.journey_templates(id),
  current_step_index int NOT NULL DEFAULT 0,
  status             text NOT NULL DEFAULT 'active'
                     CONSTRAINT user_journeys_status_check
                     CHECK (status IN ('active','completed','abandoned')),
  completed_steps    jsonb NOT NULL DEFAULT '[]',
  started_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  completed_at       timestamptz
);

-- Add deferred FK now that both tables exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pack_access_case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pack_source_pack_id uuid REFERENCES public.complaint_packs(id) ON DELETE SET NULL;

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_cases_user_id         ON public.cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_organisation    ON public.cases(organisation_id);
CREATE INDEX IF NOT EXISTS idx_cases_status          ON public.cases(organisation_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cases_ref_unique ON public.cases(ref);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cases_inbound_email_alias_unique ON public.cases(inbound_email_alias) WHERE inbound_email_alias IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cases_share_token     ON public.cases(share_token) WHERE share_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_interactions_case_id  ON public.interactions(case_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date     ON public.interactions(interaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_case_id      ON public.evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_letters_case_id       ON public.letters(case_id);

CREATE INDEX IF NOT EXISTS idx_reminders_user_due    ON public.reminders(user_id, due_date)
  WHERE NOT is_sent AND NOT is_dismissed;

CREATE INDEX IF NOT EXISTS idx_organisations_name    ON public.organisations(name);
CREATE INDEX IF NOT EXISTS idx_organisations_name_trgm ON public.organisations USING gin(name gin_trgm_ops);
CREATE UNIQUE INDEX IF NOT EXISTS idx_organisations_stripe_customer_id ON public.organisations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_organisations_stripe_subscription_id ON public.organisations(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_email        ON public.profiles(email);

CREATE UNIQUE INDEX IF NOT EXISTS idx_complaint_packs_checkout_session_unique ON public.complaint_packs(checkout_session_id) WHERE checkout_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_complaint_packs_payment_intent_unique   ON public.complaint_packs(stripe_payment_id) WHERE stripe_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_complaint_packs_user_id  ON public.complaint_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_complaint_packs_case_id  ON public.complaint_packs(case_id);

CREATE INDEX IF NOT EXISTS idx_b2b_pilots_contact_email   ON public.b2b_pilots(contact_email);
CREATE INDEX IF NOT EXISTS idx_b2b_pilots_organisation_id ON public.b2b_pilots(organisation_id);
CREATE INDEX IF NOT EXISTS idx_b2b_pilots_enquiry_id      ON public.b2b_pilots(business_enquiry_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_b2b_outreach_email_id_unique ON public.b2b_outreach_emails(resend_email_id) WHERE resend_email_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_b2b_outreach_org_id ON public.b2b_outreach_emails(organisation_id);

CREATE INDEX IF NOT EXISTS journey_templates_category_idx ON public.journey_templates(category);
CREATE INDEX IF NOT EXISTS journey_templates_sector_idx   ON public.journey_templates(sector);
CREATE INDEX IF NOT EXISTS user_journeys_user_id_idx      ON public.user_journeys(user_id);
CREATE INDEX IF NOT EXISTS user_journeys_case_id_idx      ON public.user_journeys(case_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Maintain cases_count on profiles
CREATE OR REPLACE FUNCTION public.update_case_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET cases_count = cases_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET cases_count = GREATEST(cases_count - 1, 0) WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Maintain interaction_count on cases
CREATE OR REPLACE FUNCTION public.update_interaction_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.cases
    SET interaction_count = interaction_count + 1,
        last_interaction_date = NEW.interaction_date
    WHERE id = NEW.case_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.cases
    SET interaction_count = GREATEST(interaction_count - 1, 0)
    WHERE id = OLD.case_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Auto-generate case ref (TP-00001 format)
CREATE OR REPLACE FUNCTION public.generate_case_ref()
RETURNS trigger AS $$
BEGIN
  IF NEW.ref IS NULL OR NEW.ref = '' THEN
    NEW.ref := 'TP-' || LPAD(nextval('cases_ref_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- current_organisation_id (legacy helper — keeps org-scoped policies working)
CREATE OR REPLACE FUNCTION public.current_organisation_id()
RETURNS uuid AS $$
  SELECT organisation_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public';

-- user_journeys updated_at
CREATE OR REPLACE FUNCTION public.update_user_journeys_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auth: auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Cases: ref auto-generation
DROP TRIGGER IF EXISTS trigger_generate_case_ref ON public.cases;
CREATE TRIGGER trigger_generate_case_ref
  BEFORE INSERT ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.generate_case_ref();

-- Cases: updated_at
DROP TRIGGER IF EXISTS cases_updated_at ON public.cases;
CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Cases: case_count
DROP TRIGGER IF EXISTS cases_count_trigger ON public.cases;
CREATE TRIGGER cases_count_trigger
  AFTER INSERT OR DELETE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_case_count();

-- Interactions: updated_at
DROP TRIGGER IF EXISTS interactions_updated_at ON public.interactions;
CREATE TRIGGER interactions_updated_at
  BEFORE UPDATE ON public.interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Interactions: interaction_count
DROP TRIGGER IF EXISTS interactions_count_trigger ON public.interactions;
CREATE TRIGGER interactions_count_trigger
  AFTER INSERT OR DELETE ON public.interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_interaction_count();

-- Letters: updated_at
DROP TRIGGER IF EXISTS letters_updated_at ON public.letters;
CREATE TRIGGER letters_updated_at
  BEFORE UPDATE ON public.letters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Profiles: updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Complaint packs: updated_at
DROP TRIGGER IF EXISTS complaint_packs_updated_at ON public.complaint_packs;
CREATE TRIGGER complaint_packs_updated_at
  BEFORE UPDATE ON public.complaint_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- B2B pilots: updated_at
DROP TRIGGER IF EXISTS b2b_pilots_updated_at ON public.b2b_pilots;
CREATE TRIGGER b2b_pilots_updated_at
  BEFORE UPDATE ON public.b2b_pilots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- B2B outreach: updated_at
DROP TRIGGER IF EXISTS b2b_outreach_emails_updated_at ON public.b2b_outreach_emails;
CREATE TRIGGER b2b_outreach_emails_updated_at
  BEFORE UPDATE ON public.b2b_outreach_emails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- User journeys: updated_at
DROP TRIGGER IF EXISTS user_journeys_updated_at ON public.user_journeys;
CREATE TRIGGER user_journeys_updated_at
  BEFORE UPDATE ON public.user_journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_user_journeys_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_rules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_ai_usage  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_packs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_pilots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journeys     ENABLE ROW LEVEL SECURITY;

-- ── profiles policies ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_delete_own"  ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated USING (id = auth.uid());

-- ── organisations policies ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "organisations_select_authenticated" ON public.organisations;
CREATE POLICY "organisations_select_authenticated" ON public.organisations
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "organisations_insert_authenticated" ON public.organisations;
CREATE POLICY "organisations_insert_authenticated" ON public.organisations
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "organisations_insert_service_role" ON public.organisations;
CREATE POLICY "organisations_insert_service_role" ON public.organisations
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "organisations_update_service_role" ON public.organisations;
CREATE POLICY "organisations_update_service_role" ON public.organisations
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "organisations_delete_service_role" ON public.organisations;
CREATE POLICY "organisations_delete_service_role" ON public.organisations
  FOR DELETE TO service_role USING (true);

-- ── cases policies ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cases_select_own"  ON public.cases;
CREATE POLICY "cases_select_own" ON public.cases
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "cases_insert_own"  ON public.cases;
CREATE POLICY "cases_insert_own" ON public.cases
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cases_update_own"  ON public.cases;
CREATE POLICY "cases_update_own" ON public.cases
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cases_delete_own"  ON public.cases;
CREATE POLICY "cases_delete_own" ON public.cases
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── interactions policies ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "interactions_select_own"  ON public.interactions;
CREATE POLICY "interactions_select_own" ON public.interactions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "interactions_insert_own"  ON public.interactions;
CREATE POLICY "interactions_insert_own" ON public.interactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "interactions_update_own"  ON public.interactions;
CREATE POLICY "interactions_update_own" ON public.interactions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "interactions_delete_own"  ON public.interactions;
CREATE POLICY "interactions_delete_own" ON public.interactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── evidence policies ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "evidence_select_own"  ON public.evidence;
CREATE POLICY "evidence_select_own" ON public.evidence
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "evidence_insert_own"  ON public.evidence;
CREATE POLICY "evidence_insert_own" ON public.evidence
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "evidence_update_own"  ON public.evidence;
CREATE POLICY "evidence_update_own" ON public.evidence
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "evidence_delete_own"  ON public.evidence;
CREATE POLICY "evidence_delete_own" ON public.evidence
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── letters policies ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "letters_select_own"  ON public.letters;
CREATE POLICY "letters_select_own" ON public.letters
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "letters_insert_own"  ON public.letters;
CREATE POLICY "letters_insert_own" ON public.letters
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "letters_update_own"  ON public.letters;
CREATE POLICY "letters_update_own" ON public.letters
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "letters_delete_own"  ON public.letters;
CREATE POLICY "letters_delete_own" ON public.letters
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── escalation_rules policies ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "escalation_rules_select_authenticated" ON public.escalation_rules;
CREATE POLICY "escalation_rules_select_authenticated" ON public.escalation_rules
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "escalation_rules_insert_service_role" ON public.escalation_rules;
CREATE POLICY "escalation_rules_insert_service_role" ON public.escalation_rules
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "escalation_rules_update_service_role" ON public.escalation_rules;
CREATE POLICY "escalation_rules_update_service_role" ON public.escalation_rules
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "escalation_rules_delete_service_role" ON public.escalation_rules;
CREATE POLICY "escalation_rules_delete_service_role" ON public.escalation_rules
  FOR DELETE TO service_role USING (true);

-- ── reminders policies ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "reminders_select_own"  ON public.reminders;
CREATE POLICY "reminders_select_own" ON public.reminders
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "reminders_insert_own"  ON public.reminders;
CREATE POLICY "reminders_insert_own" ON public.reminders
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "reminders_update_own"  ON public.reminders;
CREATE POLICY "reminders_update_own" ON public.reminders
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "reminders_delete_own"  ON public.reminders;
CREATE POLICY "reminders_delete_own" ON public.reminders
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── exports policies ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "exports_select_own"  ON public.exports;
CREATE POLICY "exports_select_own" ON public.exports
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "exports_insert_own"  ON public.exports;
CREATE POLICY "exports_insert_own" ON public.exports
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "exports_update_own"  ON public.exports;
CREATE POLICY "exports_update_own" ON public.exports
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "exports_delete_own"  ON public.exports;
CREATE POLICY "exports_delete_own" ON public.exports
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── monthly_ai_usage policies ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own usage" ON public.monthly_ai_usage;
CREATE POLICY "Users can view own usage" ON public.monthly_ai_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON public.monthly_ai_usage;
CREATE POLICY "Users can insert own usage" ON public.monthly_ai_usage
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON public.monthly_ai_usage;
CREATE POLICY "Users can update own usage" ON public.monthly_ai_usage
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ── complaint_packs policies ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "complaint_packs_select_own" ON public.complaint_packs;
CREATE POLICY "complaint_packs_select_own" ON public.complaint_packs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "complaint_packs_insert_own" ON public.complaint_packs;
CREATE POLICY "complaint_packs_insert_own" ON public.complaint_packs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ── business_enquiries policies ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can submit a business enquiry" ON public.business_enquiries;
CREATE POLICY "Anyone can submit a business enquiry" ON public.business_enquiries
  FOR INSERT WITH CHECK (true);

-- ── b2b_pilots policies ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "service_role_manage_b2b_pilots" ON public.b2b_pilots;
CREATE POLICY "service_role_manage_b2b_pilots" ON public.b2b_pilots
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── b2b_outreach_emails policies ──────────────────────────────────────────────
DROP POLICY IF EXISTS "service_role_manage_b2b_outreach_emails" ON public.b2b_outreach_emails;
CREATE POLICY "service_role_manage_b2b_outreach_emails" ON public.b2b_outreach_emails
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── journey_templates policies ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can read journey templates" ON public.journey_templates;
CREATE POLICY "Authenticated users can read journey templates" ON public.journey_templates
  FOR SELECT TO authenticated USING (is_active = true);

-- ── user_journeys policies ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own journeys"   ON public.user_journeys;
CREATE POLICY "Users can view own journeys" ON public.user_journeys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own journeys" ON public.user_journeys;
CREATE POLICY "Users can insert own journeys" ON public.user_journeys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own journeys" ON public.user_journeys;
CREATE POLICY "Users can update own journeys" ON public.user_journeys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own journeys" ON public.user_journeys;
CREATE POLICY "Users can delete own journeys" ON public.user_journeys
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =============================================================================
-- ANALYTICS VIEWS (service_role only)
-- =============================================================================

CREATE OR REPLACE VIEW public.v_company_stats AS
SELECT
  o.id AS organisation_id, o.name AS organisation_name, o.category,
  COUNT(DISTINCT c.id) AS total_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('open','escalated')) AS active_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'resolved') AS resolved_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.escalation_stage = 'ombudsman') AS escalated_to_ombudsman,
  ROUND(AVG(CASE WHEN c.status = 'resolved' AND c.updated_at IS NOT NULL AND c.first_contact_date IS NOT NULL
    THEN EXTRACT(DAY FROM c.updated_at - c.first_contact_date) END)::numeric, 1) AS avg_resolution_days,
  COUNT(i.id) AS total_interactions,
  ROUND(SUM(c.amount_in_dispute)::numeric, 2) AS total_amount_disputed
FROM organisations o
LEFT JOIN cases c ON c.organisation_id = o.id
LEFT JOIN interactions i ON i.case_id = c.id
GROUP BY o.id, o.name, o.category;

CREATE OR REPLACE VIEW public.v_platform_stats AS
SELECT
  COUNT(DISTINCT p.id) AS total_users,
  COUNT(DISTINCT c.id) AS total_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('open','escalated')) AS active_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'resolved') AS resolved_cases,
  COUNT(i.id) AS total_interactions,
  COUNT(DISTINCT p.id) FILTER (WHERE p.created_at > NOW() - INTERVAL '30 days') AS signups_last_30_days,
  COUNT(DISTINCT c.id) FILTER (WHERE c.created_at > NOW() - INTERVAL '7 days') AS cases_last_7_days
FROM profiles p
LEFT JOIN cases c ON c.user_id = p.id
LEFT JOIN interactions i ON i.case_id = c.id;

CREATE OR REPLACE VIEW public.outcome_stats_by_company AS
SELECT
  COALESCE(o.name, c.custom_organisation_name) AS company_name,
  COUNT(*) AS total_resolved,
  ROUND(AVG(c.outcome_amount_pence) FILTER (WHERE c.outcome_amount_pence > 0))::integer AS avg_amount_pence
FROM cases c
LEFT JOIN organisations o ON c.organisation_id = o.id
WHERE c.outcome_satisfaction IS NOT NULL
GROUP BY COALESCE(o.name, c.custom_organisation_name)
HAVING COUNT(*) >= 5;

REVOKE ALL ON TABLE public.v_company_stats  FROM anon, authenticated;
REVOKE ALL ON TABLE public.v_platform_stats FROM anon, authenticated;
GRANT SELECT ON TABLE public.v_company_stats  TO service_role;
GRANT SELECT ON TABLE public.v_platform_stats TO service_role;
GRANT SELECT ON TABLE public.outcome_stats_by_company TO authenticated, anon;

-- =============================================================================
-- STORAGE BUCKET
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('evidence', 'evidence', false, 10485760)
ON CONFLICT (id) DO UPDATE SET public = excluded.public, file_size_limit = excluded.file_size_limit;

DROP POLICY IF EXISTS "evidence_storage_select_own"  ON storage.objects;
CREATE POLICY "evidence_storage_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "evidence_storage_insert_own"  ON storage.objects;
CREATE POLICY "evidence_storage_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "evidence_storage_update_own"  ON storage.objects;
CREATE POLICY "evidence_storage_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "evidence_storage_delete_own"  ON storage.objects;
CREATE POLICY "evidence_storage_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);
