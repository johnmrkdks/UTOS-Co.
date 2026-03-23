-- Missing columns for guest booking + email tracking
-- Run in Cloudflare D1 Console (downunderchauffeurs-db). Run each statement separately.
-- Skip any that fail with "duplicate column name".

-- 0012 (manual): toll_preference
ALTER TABLE bookings ADD COLUMN toll_preference TEXT DEFAULT 'toll';

-- 0013: is_guest_booking (required for guest checkout)
ALTER TABLE bookings ADD COLUMN is_guest_booking INTEGER DEFAULT 0;

-- 0015: Email tracking columns
ALTER TABLE bookings ADD COLUMN confirmation_email_sent_at INTEGER;
ALTER TABLE bookings ADD COLUMN driver_assignment_email_sent_at INTEGER;
ALTER TABLE bookings ADD COLUMN driver_assignment_email_sent_to_driver_id TEXT;
ALTER TABLE bookings ADD COLUMN completion_summary_email_sent_at INTEGER;

-- 0014: Make user_id nullable (REQUIRED for guest checkout - guest has no user_id)
-- Run this ONLY if guest checkout still fails after the above (constraint on user_id).
-- BACKUP first. Run the full block below as one execution.
/*
PRAGMA foreign_keys = OFF;
CREATE TABLE bookings_new (
  id TEXT PRIMARY KEY NOT NULL, reference_number TEXT, share_token TEXT, booking_type TEXT NOT NULL,
  car_id TEXT, user_id TEXT, driver_id TEXT, package_id TEXT, driver_assigned_at INTEGER,
  origin_address TEXT NOT NULL, origin_latitude REAL, origin_longitude REAL,
  destination_address TEXT NOT NULL, destination_latitude REAL, destination_longitude REAL,
  scheduled_pickup_time INTEGER NOT NULL, timezone TEXT, estimated_duration INTEGER,
  actual_pickup_time INTEGER, actual_dropoff_time INTEGER, estimated_distance REAL, actual_distance REAL,
  quoted_amount REAL NOT NULL, final_amount REAL, base_fare REAL, distance_fare REAL, time_fare REAL, extra_charges REAL DEFAULT 0,
  customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL, customer_email TEXT,
  passenger_count INTEGER DEFAULT 1 NOT NULL, luggage_count INTEGER DEFAULT 0, special_requests TEXT, additional_notes TEXT,
  toll_preference TEXT DEFAULT 'toll', status TEXT DEFAULT 'pending' NOT NULL, payment_status TEXT,
  is_archived INTEGER, is_guest_booking INTEGER DEFAULT 0,
  confirmed_at INTEGER, driver_en_route_at INTEGER, service_started_at INTEGER, service_completed_at INTEGER,
  confirmation_email_sent_at INTEGER, driver_assignment_email_sent_at INTEGER, driver_assignment_email_sent_to_driver_id TEXT, completion_summary_email_sent_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()), updated_at INTEGER DEFAULT (unixepoch())
);
INSERT INTO bookings_new SELECT
  id, reference_number, share_token, booking_type, car_id, CASE WHEN is_guest_booking = 1 THEN NULL ELSE user_id END,
  driver_id, package_id, driver_assigned_at, origin_address, origin_latitude, origin_longitude,
  destination_address, destination_latitude, destination_longitude, scheduled_pickup_time, timezone,
  estimated_duration, actual_pickup_time, actual_dropoff_time, estimated_distance, actual_distance,
  quoted_amount, final_amount, base_fare, distance_fare, time_fare, extra_charges,
  customer_name, customer_phone, customer_email, passenger_count, luggage_count, special_requests, additional_notes,
  toll_preference, status, payment_status, is_archived, is_guest_booking, confirmed_at, driver_en_route_at, service_started_at, service_completed_at,
  confirmation_email_sent_at, driver_assignment_email_sent_at, driver_assignment_email_sent_to_driver_id, completion_summary_email_sent_at,
  created_at, updated_at
FROM bookings;
DROP TABLE bookings;
ALTER TABLE bookings_new RENAME TO bookings;
PRAGMA foreign_keys = ON;
*/
