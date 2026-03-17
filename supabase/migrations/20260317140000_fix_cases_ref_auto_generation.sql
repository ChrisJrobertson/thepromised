-- RUN THIS MIGRATION: Go to Supabase Dashboard → SQL Editor → paste and run
-- Or use: supabase db push (if using Supabase CLI)
--
-- Context: The production cases table was originally created for a different
-- application (legacy PI/case-management schema). TheyPromised columns were
-- added on top via ALTER TABLE. This migration:
--   1. Auto-generates cases.ref as TP-XXXXX so the NOT NULL constraint is satisfied
--   2. Makes organisation_id nullable (TheyPromised supports custom org names)
--   3. Fixes status/priority CHECK constraints (old schema used uppercase values)
--   4. Fixes column defaults to match TheyPromised values

-- ============================================================
-- 1. Sequence + function + trigger for ref auto-generation
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS cases_ref_seq START 1;

CREATE OR REPLACE FUNCTION generate_case_ref()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ref IS NULL OR NEW.ref = '' THEN
    NEW.ref := 'TP-' || LPAD(nextval('cases_ref_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_generate_case_ref ON public.cases;
CREATE TRIGGER trigger_generate_case_ref
  BEFORE INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION generate_case_ref();

-- Backfill any existing rows that somehow have a NULL or empty ref (safety net).
UPDATE public.cases
SET ref = 'TP-' || LPAD(nextval('cases_ref_seq')::text, 5, '0')
WHERE ref IS NULL OR ref = '';

-- ============================================================
-- 2. Simplify the ref unique constraint
-- ============================================================

-- Drop the old composite (organisation_id, ref) unique constraint from the
-- legacy schema. With auto-generated refs, a plain unique index on ref is
-- sufficient and cleaner.
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_organisation_id_ref_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename  = 'cases'
      AND indexname  = 'idx_cases_ref_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_cases_ref_unique ON public.cases (ref);
  END IF;
END $$;

-- ============================================================
-- 3. Make organisation_id nullable
-- ============================================================

-- TheyPromised supports cases with a custom organisation name (no DB org row).
ALTER TABLE public.cases ALTER COLUMN organisation_id DROP NOT NULL;

-- ============================================================
-- 4. Align status values and constraint with TheyPromised
--    Drop old constraint FIRST so the UPDATE does not violate it.
-- ============================================================

ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_status_check;

-- Migrate old-schema uppercase status values to TheyPromised lowercase.
UPDATE public.cases SET status = 'open'      WHERE status IN ('OPEN', 'IN_PROGRESS');
UPDATE public.cases SET status = 'escalated' WHERE status = 'REVIEW';
UPDATE public.cases SET status = 'closed'    WHERE status IN ('CLOSED', 'ARCHIVED');

ALTER TABLE public.cases ADD CONSTRAINT cases_status_check
  CHECK (status IN ('open', 'escalated', 'resolved', 'closed'));

ALTER TABLE public.cases ALTER COLUMN status SET DEFAULT 'open';

-- ============================================================
-- 5. Align priority values and constraint with TheyPromised
--    Drop old constraint FIRST so the UPDATE does not violate it.
-- ============================================================

ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_priority_check;

-- Migrate old-schema uppercase priority values to TheyPromised lowercase.
UPDATE public.cases SET priority = 'low'    WHERE priority = 'LOW';
UPDATE public.cases SET priority = 'medium' WHERE priority = 'MEDIUM';
UPDATE public.cases SET priority = 'high'   WHERE priority = 'HIGH';
UPDATE public.cases SET priority = 'urgent' WHERE priority = 'CRITICAL';

ALTER TABLE public.cases ADD CONSTRAINT cases_priority_check
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE public.cases ALTER COLUMN priority SET DEFAULT 'medium';
