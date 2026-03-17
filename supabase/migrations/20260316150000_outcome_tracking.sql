-- Outcome tracking when a case is resolved/closed
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS outcome_satisfaction TEXT CHECK (outcome_satisfaction IN ('yes', 'partially', 'no')),
  ADD COLUMN IF NOT EXISTS outcome_resolution_type TEXT CHECK (outcome_resolution_type IN ('refund', 'compensation', 'apology', 'replacement', 'service_fix', 'nothing', 'other')),
  ADD COLUMN IF NOT EXISTS outcome_amount_pence INTEGER,
  ADD COLUMN IF NOT EXISTS outcome_notes TEXT,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

COMMENT ON COLUMN cases.outcome_amount_pence IS 'Amount received in pence (store as integer to avoid floating-point issues).';
COMMENT ON COLUMN cases.resolved_at IS 'When the user recorded the outcome (may differ from status change).';

-- Aggregated outcome stats by company (min 5 resolved for privacy)
CREATE OR REPLACE VIEW outcome_stats_by_company AS
SELECT
  COALESCE(o.name, c.custom_organisation_name) AS company_name,
  COUNT(*) AS total_resolved,
  COUNT(*) FILTER (WHERE c.outcome_satisfaction = 'yes') AS fully_satisfied,
  COUNT(*) FILTER (WHERE c.outcome_satisfaction = 'partially') AS partially_satisfied,
  COUNT(*) FILTER (WHERE c.outcome_satisfaction = 'no') AS not_satisfied,
  COUNT(*) FILTER (WHERE c.outcome_resolution_type = 'refund') AS refunds,
  COUNT(*) FILTER (WHERE c.outcome_resolution_type = 'compensation') AS compensations,
  ROUND(AVG(c.outcome_amount_pence) FILTER (WHERE c.outcome_amount_pence > 0))::INTEGER AS avg_amount_pence,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.outcome_amount_pence) FILTER (WHERE c.outcome_amount_pence > 0))::INTEGER AS median_amount_pence
FROM cases c
LEFT JOIN organisations o ON c.organisation_id = o.id
WHERE c.outcome_satisfaction IS NOT NULL
GROUP BY COALESCE(o.name, c.custom_organisation_name)
HAVING COUNT(*) >= 5;

GRANT SELECT ON outcome_stats_by_company TO authenticated;
GRANT SELECT ON outcome_stats_by_company TO anon;
