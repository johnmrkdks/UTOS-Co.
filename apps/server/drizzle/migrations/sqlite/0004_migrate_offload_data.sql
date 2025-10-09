-- Step 1: Migrate existing offload booking data to the new normalized table
-- This must run BEFORE dropping the columns

-- Insert offload data into the new table (only for bookings that have offload data)
INSERT INTO offload_booking_details (id, booking_id, offloader_name, job_type, vehicle_type, created_at, updated_at)
SELECT
    lower(hex(randomblob(16))) as id,
    b.id as booking_id,
    b.offloader_name,
    b.job_type,
    b.vehicle_type,
    b.created_at,
    b.updated_at
FROM bookings b
WHERE b.offloader_name IS NOT NULL
  AND b.job_type IS NOT NULL
  AND b.vehicle_type IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM offload_booking_details obd WHERE obd.booking_id = b.id
  );

-- Step 2: Drop the old columns from bookings table
-- Note: SQLite doesn't support DROP COLUMN directly in older versions
-- We'll let drizzle-kit push handle this with table recreation
