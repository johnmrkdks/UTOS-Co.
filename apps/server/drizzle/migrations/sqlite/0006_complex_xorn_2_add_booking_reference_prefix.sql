-- Add booking_reference_prefix column to system_settings table
ALTER TABLE system_settings ADD COLUMN booking_reference_prefix TEXT NOT NULL DEFAULT 'DUC';

-- Update existing row with default prefix (if system_settings table has data)
UPDATE system_settings SET booking_reference_prefix = 'DUC' WHERE id = 1;

-- If no settings exist, insert default settings
INSERT OR IGNORE INTO system_settings (id, timezone, booking_reference_prefix)
VALUES (1, 'Australia/Sydney', 'DUC');
