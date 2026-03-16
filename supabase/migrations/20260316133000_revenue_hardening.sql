-- Revenue hardening for packs + B2B.

-- 1) Pack idempotency and explicit entitlement expiry/scope
ALTER TABLE public.complaint_packs
  ADD COLUMN IF NOT EXISTS checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS entitlement_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS entitlement_case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_complaint_packs_checkout_session_unique
  ON public.complaint_packs (checkout_session_id)
  WHERE checkout_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_complaint_packs_payment_intent_unique
  ON public.complaint_packs (stripe_payment_id)
  WHERE stripe_payment_id IS NOT NULL;

ALTER TABLE public.complaint_packs
  DROP CONSTRAINT IF EXISTS complaint_packs_status_check;

ALTER TABLE public.complaint_packs
  ADD CONSTRAINT complaint_packs_status_check
  CHECK (status IN ('purchased', 'in_progress', 'fulfilled', 'refunded', 'cancelled'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pack_pro_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pack_access_case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pack_source_pack_id UUID REFERENCES public.complaint_packs(id) ON DELETE SET NULL;

-- 2) Enquiry quality + anti-spam metadata
ALTER TABLE public.business_enquiries
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS complaint_volume_estimate TEXT,
  ADD COLUMN IF NOT EXISTS consent_to_contact BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_ip TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 3) Link pilots to enquiries for robust conversion tracking
ALTER TABLE public.b2b_pilots
  ADD COLUMN IF NOT EXISTS business_enquiry_id UUID REFERENCES public.business_enquiries(id) ON DELETE SET NULL;

ALTER TABLE public.b2b_pilots
  DROP CONSTRAINT IF EXISTS b2b_pilots_status_check;

ALTER TABLE public.b2b_pilots
  ADD CONSTRAINT b2b_pilots_status_check
  CHECK (status IN ('enquiry', 'contacted', 'pilot_started', 'active', 'churned'));

CREATE INDEX IF NOT EXISTS idx_b2b_pilots_enquiry_id
  ON public.b2b_pilots (business_enquiry_id);

-- 4) Outbound B2B scorecard email tracking
CREATE TABLE IF NOT EXISTS public.b2b_outreach_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL,
  b2b_pilot_id UUID REFERENCES public.b2b_pilots(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  resend_email_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_b2b_outreach_email_id_unique
  ON public.b2b_outreach_emails (resend_email_id)
  WHERE resend_email_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_b2b_outreach_org_id
  ON public.b2b_outreach_emails (organisation_id);

ALTER TABLE public.b2b_outreach_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage b2b outreach emails" ON public.b2b_outreach_emails;
CREATE POLICY "Service role can manage b2b outreach emails"
  ON public.b2b_outreach_emails
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP TRIGGER IF EXISTS b2b_outreach_emails_updated_at ON public.b2b_outreach_emails;
CREATE TRIGGER b2b_outreach_emails_updated_at
  BEFORE UPDATE ON public.b2b_outreach_emails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
