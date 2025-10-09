-- Add offload booking specific fields to bookings table
ALTER TABLE bookings ADD COLUMN offloader_name TEXT;
ALTER TABLE bookings ADD COLUMN job_type TEXT;
ALTER TABLE bookings ADD COLUMN vehicle_type TEXT;
