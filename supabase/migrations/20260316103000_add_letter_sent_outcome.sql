DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'interactions_outcome_check'
      AND conrelid = 'public.interactions'::regclass
  ) THEN
    ALTER TABLE public.interactions DROP CONSTRAINT interactions_outcome_check;
  END IF;

  ALTER TABLE public.interactions
    ADD CONSTRAINT interactions_outcome_check
    CHECK (
      outcome IN (
        'resolved',
        'escalated',
        'promised_callback',
        'promised_action',
        'no_resolution',
        'transferred',
        'disconnected',
        'letter_sent',
        'other'
      )
    );
END $$;
