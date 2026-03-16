-- Guided journey progress tracking per case
CREATE TABLE IF NOT EXISTS public.case_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  journey_template_id text NOT NULL,
  current_step_id text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  step_history jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- One active journey per case (abandoned/completed allow a new one)
  UNIQUE (case_id)
);

ALTER TABLE public.case_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journeys" ON public.case_journeys
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own journeys" ON public.case_journeys
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own journeys" ON public.case_journeys
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own journeys" ON public.case_journeys
  FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER set_case_journeys_updated_at
  BEFORE UPDATE ON public.case_journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_case_journeys_case_id ON public.case_journeys(case_id);
CREATE INDEX idx_case_journeys_user_id ON public.case_journeys(user_id);
CREATE INDEX idx_case_journeys_status ON public.case_journeys(status);
