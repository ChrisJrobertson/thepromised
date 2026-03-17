-- Only alter organisation_id if it exists (remote may have been created without it)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'organisation_id'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN organisation_id DROP NOT NULL;
    ALTER TABLE public.profiles ALTER COLUMN organisation_id SET DEFAULT NULL;
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_suggestions_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_letters_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_credits_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_credits_reset_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_active;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS name;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
