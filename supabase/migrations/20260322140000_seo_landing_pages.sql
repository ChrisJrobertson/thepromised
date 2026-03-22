-- SEO landing pages: organisation complaint guides + consumer guides (public read when published)

CREATE TABLE public.seo_organisation_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  sector TEXT NOT NULL,
  hero_heading TEXT NOT NULL,
  hero_subheading TEXT NOT NULL,
  your_rights JSONB NOT NULL DEFAULT '[]',
  escalation_steps JSONB NOT NULL DEFAULT '[]',
  faq_items JSONB NOT NULL DEFAULT '[]',
  common_issues JSONB NOT NULL DEFAULT '[]',
  ombudsman_name TEXT,
  ombudsman_slug TEXT,
  regulator_name TEXT,
  primary_legislation TEXT[],
  complaint_deadline_days INT,
  related_guide_slugs TEXT[] DEFAULT '{}',
  related_org_slugs TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.seo_guide_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  category TEXT NOT NULL,
  sector TEXT,
  hero_heading TEXT NOT NULL,
  hero_subheading TEXT NOT NULL,
  introduction TEXT NOT NULL,
  content_sections JSONB NOT NULL DEFAULT '[]',
  eligibility_criteria JSONB DEFAULT '[]',
  step_by_step JSONB NOT NULL DEFAULT '[]',
  faq_items JSONB NOT NULL DEFAULT '[]',
  primary_legislation TEXT[],
  key_deadlines JSONB DEFAULT '[]',
  related_org_slugs TEXT[] DEFAULT '{}',
  related_guide_slugs TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_org_pages_sector ON public.seo_organisation_pages(sector);
CREATE INDEX idx_seo_org_pages_status ON public.seo_organisation_pages(status);
CREATE INDEX idx_seo_guide_pages_status ON public.seo_guide_pages(status);

ALTER TABLE public.seo_organisation_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_guide_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published org pages"
  ON public.seo_organisation_pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read published guide pages"
  ON public.seo_guide_pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Service role full access org pages"
  ON public.seo_organisation_pages FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access guide pages"
  ON public.seo_guide_pages FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS seo_org_pages_updated_at ON public.seo_organisation_pages;
CREATE TRIGGER seo_org_pages_updated_at
  BEFORE UPDATE ON public.seo_organisation_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS seo_guide_pages_updated_at ON public.seo_guide_pages;
CREATE TRIGGER seo_guide_pages_updated_at
  BEFORE UPDATE ON public.seo_guide_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
