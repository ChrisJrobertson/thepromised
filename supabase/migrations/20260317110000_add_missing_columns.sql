-- Add share_token and is_shared to cases.
-- These columns are used by /api/cases/[id]/share but were added directly to
-- the production database without a migration file.
ALTER TABLE cases ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false;

-- Add notification_preferences to profiles.
-- This JSONB column is read by the daily cron and written by the
-- notifications settings page, but was missing from all migrations.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB
  NOT NULL DEFAULT '{"email_reminders": true, "email_escalation_alerts": true, "email_promise_alerts": true, "weekly_summary": false, "product_updates": true}'::jsonb;
