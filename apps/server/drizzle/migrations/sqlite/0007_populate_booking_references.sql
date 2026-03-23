-- Populate missing booking reference numbers with unique values
-- This migration generates reference numbers for existing bookings that don't have one

-- Note: Since SQLite doesn't have built-in UUID or sequential number generation,
-- we'll use a combination of the booking's creation timestamp and a random component
-- to generate unique reference numbers

-- Update bookings that have NULL reference_number
-- Generate format: DUC-{last 6 digits of unix timestamp + row_number}
UPDATE bookings
SET reference_number = (
  SELECT 'DUC-' || substr(printf('%06d', (
    -- Use rowid as a unique sequential number
    (SELECT COUNT(*) FROM bookings b2 WHERE b2.rowid <= bookings.rowid AND b2.reference_number IS NULL) +
    -- Add timestamp component for more randomness
    (created_at % 900000) +
    100000
  )), 1, 6)
)
WHERE reference_number IS NULL;

-- Verify all bookings now have reference numbers
SELECT
  COUNT(*) as total_bookings,
  SUM(CASE WHEN reference_number IS NULL THEN 1 ELSE 0 END) as missing_references
FROM bookings;
