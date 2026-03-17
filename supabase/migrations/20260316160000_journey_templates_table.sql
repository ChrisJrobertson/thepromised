-- Journey templates table (schema aligned with upstream 20260317120000_guided_journeys.sql).
-- Creates the table only if the upstream migration has not already done so.
-- Templates are defined in src/lib/journeys/templates.ts and seeded separately.

CREATE TABLE IF NOT EXISTS journey_templates (
  id           TEXT PRIMARY KEY,
  category     TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  sector       TEXT NOT NULL DEFAULT '',
  steps        JSONB NOT NULL DEFAULT '[]',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE journey_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'journey_templates'
      AND policyname = 'Authenticated users can read journey templates'
  ) THEN
    CREATE POLICY "Authenticated users can read journey templates"
      ON journey_templates FOR SELECT
      TO authenticated
      USING (is_active = true);
  END IF;
END
$$;
