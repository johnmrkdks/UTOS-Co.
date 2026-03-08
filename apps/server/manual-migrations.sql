-- Manual migration script for Cloudflare D1
-- Run in Cloudflare Dashboard D1 Console for best control (run each block separately; skip any that error with "already exists").
-- Or: wrangler d1 execute <db-name> --remote --file=manual-migrations.sql

-- 0006: Add booking_reference_prefix to system_settings
ALTER TABLE system_settings ADD COLUMN booking_reference_prefix TEXT NOT NULL DEFAULT 'DUC';
UPDATE system_settings SET booking_reference_prefix = 'DUC' WHERE id = 1;
INSERT OR IGNORE INTO system_settings (id, timezone, booking_reference_prefix)
VALUES (1, 'Australia/Sydney', 'DUC');

-- 0007: Populate missing booking references (only updates rows where reference_number IS NULL)
UPDATE bookings
SET reference_number = (
  SELECT 'DUC-' || substr(printf('%06d', (
    (SELECT COUNT(*) FROM bookings b2 WHERE b2.rowid <= bookings.rowid AND b2.reference_number IS NULL) +
    (created_at % 900000) + 100000
  )), 1, 6)
)
WHERE reference_number IS NULL;

-- 0008: No-op (distance types already fixed)

-- 0009: Add commission_rate to drivers
ALTER TABLE drivers ADD COLUMN commission_rate integer DEFAULT 50;

-- 0010: Invoice sent logs table
CREATE TABLE IF NOT EXISTS invoice_sent_logs (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('driver', 'company')),
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  period_start INTEGER NOT NULL,
  period_end INTEGER NOT NULL,
  sent_by_user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 0011: Add share_token to bookings (for public tracking links)
ALTER TABLE bookings ADD COLUMN share_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_share_token ON bookings(share_token) WHERE share_token IS NOT NULL;
