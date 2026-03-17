-- Monthly AI usage for free-tier limits (calendar month reset)
CREATE TABLE IF NOT EXISTS monthly_ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year TEXT NOT NULL,
  suggestions_used INTEGER DEFAULT 0,
  letters_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month_year)
);

ALTER TABLE monthly_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON monthly_ai_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON monthly_ai_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON monthly_ai_usage FOR UPDATE
  USING (auth.uid() = user_id);

COMMENT ON TABLE monthly_ai_usage IS 'Tracks free-tier AI usage per calendar month (suggestions_used, letters_used). Resets each month.';
