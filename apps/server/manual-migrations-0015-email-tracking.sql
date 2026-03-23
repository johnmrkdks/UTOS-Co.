-- 0015: Add email tracking columns and support awaiting_pricing_review status
-- Run after 0014. Adds columns to prevent duplicate emails.
-- Status 'awaiting_pricing_review' is a new enum value - no schema change needed (stored as text).
-- SKIP any statement that errors with "duplicate column name".
ALTER TABLE bookings ADD COLUMN confirmation_email_sent_at INTEGER;
ALTER TABLE bookings ADD COLUMN driver_assignment_email_sent_at INTEGER;
ALTER TABLE bookings ADD COLUMN driver_assignment_email_sent_to_driver_id TEXT;
ALTER TABLE bookings ADD COLUMN completion_summary_email_sent_at INTEGER;
