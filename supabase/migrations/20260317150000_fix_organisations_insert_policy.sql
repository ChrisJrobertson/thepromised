-- RUN THIS MIGRATION: Go to Supabase Dashboard → SQL Editor → paste and run
-- Or use: supabase db push (if using Supabase CLI)
--
-- Context: The createCase server action inserts a new organisation inline when a
-- user provides one that does not already exist. The authenticated RLS role must
-- be allowed to INSERT into organisations for this to work.
-- Previously only service_role could insert (left over from the legacy PI schema).

DROP POLICY IF EXISTS "organisations_insert_authenticated" ON public.organisations;
CREATE POLICY "organisations_insert_authenticated"
  ON public.organisations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
