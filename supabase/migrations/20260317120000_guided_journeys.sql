-- Guided Journeys — structured, step-by-step complaint walkthroughs.
-- A journey_template defines the steps for a given complaint category.
-- A user_journey tracks an individual user's progress through a template.

CREATE TABLE IF NOT EXISTS journey_templates (
  id           TEXT PRIMARY KEY,
  category     TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  sector       TEXT NOT NULL,
  steps        JSONB NOT NULL DEFAULT '[]',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS journey_templates_sector_idx ON journey_templates (sector);
CREATE INDEX IF NOT EXISTS journey_templates_category_idx ON journey_templates (category);

CREATE TABLE IF NOT EXISTS user_journeys (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id             UUID REFERENCES cases(id) ON DELETE SET NULL,
  template_id         TEXT NOT NULL REFERENCES journey_templates(id),
  current_step_index  INT NOT NULL DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'completed', 'abandoned')),
  completed_steps     JSONB NOT NULL DEFAULT '[]',
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS user_journeys_user_id_idx ON user_journeys (user_id);
CREATE INDEX IF NOT EXISTS user_journeys_case_id_idx ON user_journeys (case_id);

-- RLS
ALTER TABLE journey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;

-- Templates are public (all authenticated users can read them).
CREATE POLICY "Authenticated users can read journey templates"
  ON journey_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Users can only see their own journeys.
CREATE POLICY "Users can view own journeys"
  ON user_journeys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journeys"
  ON user_journeys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys"
  ON user_journeys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_user_journeys_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_journeys_updated_at
  BEFORE UPDATE ON user_journeys
  FOR EACH ROW EXECUTE FUNCTION update_user_journeys_updated_at();
