-- Final build: analytics views, admin controls, delivery tracking, B2B enquiries

-- Profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_export_at TIMESTAMPTZ;

-- Cases: response tracking + inbound alias
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMPTZ;

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS response_received BOOLEAN DEFAULT false;

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS response_received_at TIMESTAMPTZ;

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS inbound_email_alias TEXT;

-- Enforce uniqueness for aliases when present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_cases_inbound_email_alias_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_cases_inbound_email_alias_unique
      ON public.cases (inbound_email_alias)
      WHERE inbound_email_alias IS NOT NULL;
  END IF;
END $$;

-- Letters: delivery tracking
ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS sent_to_email TEXT;

ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS resend_email_id TEXT;

ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'draft';

ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;

ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ;

-- Business enquiries table
CREATE TABLE IF NOT EXISTS public.business_enquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.business_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a business enquiry" ON public.business_enquiries;
CREATE POLICY "Anyone can submit a business enquiry"
  ON public.business_enquiries FOR INSERT
  WITH CHECK (true);

-- Expand reminder_type check to include response and notification reminders.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reminders_reminder_type_check'
      AND conrelid = 'public.reminders'::regclass
  ) THEN
    ALTER TABLE public.reminders DROP CONSTRAINT reminders_reminder_type_check;
  END IF;

  ALTER TABLE public.reminders
    ADD CONSTRAINT reminders_reminder_type_check
    CHECK (
      reminder_type IN (
        'promise_deadline',
        'escalation_window',
        'follow_up',
        'custom',
        'response_approaching',
        'response_due',
        'response_overdue',
        'notification'
      )
    );
END $$;

-- Set Chris as admin
UPDATE public.profiles
SET is_admin = true
WHERE email = 'chrisjrobertson@outlook.com';

-- ============================================================
-- VIEW 1: Company complaint performance summary
-- ============================================================
CREATE OR REPLACE VIEW public.v_company_stats AS
SELECT
  o.id AS organisation_id,
  o.name AS organisation_name,
  o.category,

  -- Case volume
  COUNT(DISTINCT c.id) AS total_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('open', 'escalated')) AS active_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'resolved') AS resolved_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.escalation_stage = 'ombudsman') AS escalated_to_ombudsman,

  -- Resolution metrics
  ROUND(AVG(
    CASE WHEN c.status = 'resolved' AND c.updated_at IS NOT NULL AND c.first_contact_date IS NOT NULL
    THEN EXTRACT(DAY FROM c.updated_at - c.first_contact_date)
    END
  )::numeric, 1) AS avg_resolution_days,

  ROUND(AVG(
    CASE WHEN c.response_received AND c.response_received_at IS NOT NULL AND c.response_deadline IS NOT NULL
    THEN EXTRACT(DAY FROM c.response_received_at - (c.response_deadline - INTERVAL '14 days'))
    END
  )::numeric, 1) AS avg_response_days,

  -- Response rate
  COUNT(DISTINCT c.id) FILTER (WHERE c.response_deadline IS NOT NULL) AS letters_sent_count,
  COUNT(DISTINCT c.id) FILTER (WHERE c.response_received = true) AS responses_received_count,

  -- Promise tracking
  COUNT(i.id) FILTER (WHERE i.promises_made IS NOT NULL) AS total_promises,
  COUNT(i.id) FILTER (WHERE i.promises_made IS NOT NULL AND i.promise_fulfilled = true) AS promises_kept,
  COUNT(i.id) FILTER (WHERE i.promises_made IS NOT NULL AND i.promise_fulfilled = false AND i.promise_deadline < NOW()) AS promises_broken,

  -- Interaction metrics
  COUNT(i.id) AS total_interactions,
  ROUND(AVG(
    CASE WHEN i.mood = 'helpful' THEN 4
         WHEN i.mood = 'neutral' THEN 3
         WHEN i.mood = 'unhelpful' THEN 2
         WHEN i.mood = 'hostile' THEN 1
         ELSE NULL END
  )::numeric, 2) AS avg_helpfulness_score,

  -- Channel breakdown (as percentages)
  ROUND(100.0 * COUNT(i.id) FILTER (WHERE i.channel = 'phone') / NULLIF(COUNT(i.id), 0), 1) AS pct_phone,
  ROUND(100.0 * COUNT(i.id) FILTER (WHERE i.channel = 'email') / NULLIF(COUNT(i.id), 0), 1) AS pct_email,
  ROUND(100.0 * COUNT(i.id) FILTER (WHERE i.channel = 'webchat') / NULLIF(COUNT(i.id), 0), 1) AS pct_webchat,
  ROUND(100.0 * COUNT(i.id) FILTER (WHERE i.channel = 'letter') / NULLIF(COUNT(i.id), 0), 1) AS pct_letter,

  -- Financial
  ROUND(SUM(c.amount_in_dispute)::numeric, 2) AS total_amount_disputed,
  ROUND(AVG(c.amount_in_dispute)::numeric, 2) AS avg_amount_disputed,

  -- Mood breakdown
  COUNT(i.id) FILTER (WHERE i.mood = 'helpful') AS mood_helpful,
  COUNT(i.id) FILTER (WHERE i.mood = 'neutral') AS mood_neutral,
  COUNT(i.id) FILTER (WHERE i.mood = 'unhelpful') AS mood_unhelpful,
  COUNT(i.id) FILTER (WHERE i.mood = 'hostile') AS mood_hostile,

  -- Escalation rate
  ROUND(100.0 * COUNT(DISTINCT c.id) FILTER (WHERE c.escalation_stage = 'ombudsman') / NULLIF(COUNT(DISTINCT c.id), 0), 1) AS escalation_rate_pct

FROM organisations o
LEFT JOIN cases c ON c.organisation_id = o.id
LEFT JOIN interactions i ON i.case_id = c.id
GROUP BY o.id, o.name, o.category;

-- ============================================================
-- VIEW 2: Platform-wide summary stats
-- ============================================================
CREATE OR REPLACE VIEW public.v_platform_stats AS
SELECT
  COUNT(DISTINCT p.id) AS total_users,
  COUNT(DISTINCT p.id) FILTER (WHERE p.subscription_tier = 'free') AS free_users,
  COUNT(DISTINCT p.id) FILTER (WHERE p.subscription_tier = 'basic') AS basic_users,
  COUNT(DISTINCT p.id) FILTER (WHERE p.subscription_tier = 'pro') AS pro_users,
  COUNT(DISTINCT c.id) AS total_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('open', 'escalated')) AS active_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'resolved') AS resolved_cases,
  COUNT(i.id) AS total_interactions,
  COUNT(i.id) FILTER (WHERE i.promises_made IS NOT NULL) AS total_promises,
  COUNT(i.id) FILTER (WHERE i.promises_made IS NOT NULL AND i.promise_fulfilled = false AND i.promise_deadline < NOW()) AS total_broken_promises,
  COUNT(DISTINCT l.id) AS total_letters,
  COUNT(DISTINCT l.id) FILTER (WHERE l.delivery_status IN ('sent', 'delivered', 'opened')) AS total_letters_sent,
  ROUND(SUM(c.amount_in_dispute)::numeric, 2) AS total_amount_disputed,
  COUNT(DISTINCT c.organisation_id) AS companies_complained_about,

  -- Signups over time (last 30 days)
  COUNT(DISTINCT p.id) FILTER (WHERE p.created_at > NOW() - INTERVAL '30 days') AS signups_last_30_days,
  COUNT(DISTINCT p.id) FILTER (WHERE p.created_at > NOW() - INTERVAL '7 days') AS signups_last_7_days,
  COUNT(DISTINCT c.id) FILTER (WHERE c.created_at > NOW() - INTERVAL '7 days') AS cases_last_7_days,
  COUNT(i.id) FILTER (WHERE i.interaction_date > NOW() - INTERVAL '7 days') AS interactions_last_7_days

FROM profiles p
LEFT JOIN cases c ON c.user_id = p.id
LEFT JOIN interactions i ON i.case_id = c.id
LEFT JOIN letters l ON l.case_id = c.id;

-- ============================================================
-- VIEW 3: Monthly trends (for charts)
-- ============================================================
CREATE OR REPLACE VIEW public.v_monthly_trends AS
SELECT
  DATE_TRUNC('month', c.created_at)::date AS month,
  COUNT(DISTINCT c.id) AS new_cases,
  COUNT(DISTINCT c.user_id) AS active_users,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'resolved') AS resolved_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.escalation_stage = 'ombudsman') AS ombudsman_referrals,
  ROUND(SUM(c.amount_in_dispute)::numeric, 2) AS total_disputed
FROM cases c
WHERE c.created_at > NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', c.created_at)
ORDER BY month DESC;

-- ============================================================
-- VIEW 4: Category-level aggregation
-- ============================================================
CREATE OR REPLACE VIEW public.v_category_stats AS
SELECT
  o.category,
  COUNT(DISTINCT c.id) AS total_cases,
  COUNT(DISTINCT c.organisation_id) AS companies_count,
  ROUND(AVG(
    CASE WHEN c.status = 'resolved'
    THEN EXTRACT(DAY FROM c.updated_at - c.first_contact_date) END
  )::numeric, 1) AS avg_resolution_days,
  COUNT(i.id) FILTER (WHERE i.promises_made IS NOT NULL AND i.promise_fulfilled = false AND i.promise_deadline < NOW()) AS broken_promises,
  COUNT(i.id) FILTER (WHERE i.promises_made IS NOT NULL) AS total_promises,
  ROUND(100.0 * COUNT(DISTINCT c.id) FILTER (WHERE c.escalation_stage = 'ombudsman') / NULLIF(COUNT(DISTINCT c.id), 0), 1) AS escalation_rate_pct,
  ROUND(SUM(c.amount_in_dispute)::numeric, 2) AS total_disputed
FROM organisations o
JOIN cases c ON c.organisation_id = o.id
LEFT JOIN interactions i ON i.case_id = c.id
GROUP BY o.category
ORDER BY total_cases DESC;

-- ============================================================
-- VIEW 5: Top offenders ranking
-- ============================================================
CREATE OR REPLACE VIEW public.v_company_rankings AS
SELECT
  o.id AS organisation_id,
  o.name,
  o.category,
  COUNT(DISTINCT c.id) AS complaint_count,
  ROUND(
    100.0 * COUNT(i.id) FILTER (WHERE i.promises_made IS NOT NULL AND i.promise_fulfilled = false AND i.promise_deadline < NOW())
    / NULLIF(COUNT(i.id) FILTER (WHERE i.promises_made IS NOT NULL), 0)
  , 1) AS promise_broken_pct,
  ROUND(AVG(
    CASE WHEN i.mood = 'helpful' THEN 4
         WHEN i.mood = 'neutral' THEN 3
         WHEN i.mood = 'unhelpful' THEN 2
         WHEN i.mood = 'hostile' THEN 1
         ELSE NULL END
  )::numeric, 2) AS helpfulness_score,
  ROUND(100.0 * COUNT(DISTINCT c.id) FILTER (WHERE c.escalation_stage = 'ombudsman') / NULLIF(COUNT(DISTINCT c.id), 0), 1) AS escalation_rate_pct,
  ROUND(SUM(c.amount_in_dispute)::numeric, 2) AS total_disputed
FROM organisations o
JOIN cases c ON c.organisation_id = o.id
LEFT JOIN interactions i ON i.case_id = c.id
GROUP BY o.id, o.name, o.category
HAVING COUNT(DISTINCT c.id) >= 1
ORDER BY complaint_count DESC;

-- Lock analytics views down to service role only.
REVOKE ALL ON TABLE public.v_company_stats FROM anon, authenticated;
REVOKE ALL ON TABLE public.v_platform_stats FROM anon, authenticated;
REVOKE ALL ON TABLE public.v_monthly_trends FROM anon, authenticated;
REVOKE ALL ON TABLE public.v_category_stats FROM anon, authenticated;
REVOKE ALL ON TABLE public.v_company_rankings FROM anon, authenticated;

GRANT SELECT ON TABLE public.v_company_stats TO service_role;
GRANT SELECT ON TABLE public.v_platform_stats TO service_role;
GRANT SELECT ON TABLE public.v_monthly_trends TO service_role;
GRANT SELECT ON TABLE public.v_category_stats TO service_role;
GRANT SELECT ON TABLE public.v_company_rankings TO service_role;
