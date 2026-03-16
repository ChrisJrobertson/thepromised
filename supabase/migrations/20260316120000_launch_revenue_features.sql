-- Launch revenue features:
-- 1) Premium consumer complaint packs
-- 2) B2B pilot offering

-- Allow temporary pack-based access in profile status checks.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (
    subscription_status IN (
      'active',
      'cancelled',
      'past_due',
      'trialing',
      'pack_temporary'
    )
  );

CREATE TABLE IF NOT EXISTS public.complaint_packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  pack_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'purchased',
  stripe_payment_id TEXT,
  amount_paid INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'gbp',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaint_packs_user_id ON public.complaint_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_complaint_packs_case_id ON public.complaint_packs(case_id);

ALTER TABLE public.complaint_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own packs" ON public.complaint_packs;
CREATE POLICY "Users can view own packs"
  ON public.complaint_packs
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage packs" ON public.complaint_packs;
CREATE POLICY "Service role can manage packs"
  ON public.complaint_packs
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP TRIGGER IF EXISTS complaint_packs_updated_at ON public.complaint_packs;
CREATE TRIGGER complaint_packs_updated_at
  BEFORE UPDATE ON public.complaint_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.b2b_pilots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_role TEXT,
  organisation_id UUID REFERENCES public.organisations(id),
  plan_type TEXT NOT NULL DEFAULT 'standard',
  monthly_fee INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'gbp',
  status TEXT NOT NULL DEFAULT 'enquiry',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  started_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_pilots_contact_email ON public.b2b_pilots(contact_email);
CREATE INDEX IF NOT EXISTS idx_b2b_pilots_organisation_id ON public.b2b_pilots(organisation_id);

ALTER TABLE public.b2b_pilots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage b2b pilots" ON public.b2b_pilots;
CREATE POLICY "Service role can manage b2b pilots"
  ON public.b2b_pilots
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP TRIGGER IF EXISTS b2b_pilots_updated_at ON public.b2b_pilots;
CREATE TRIGGER b2b_pilots_updated_at
  BEFORE UPDATE ON public.b2b_pilots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
