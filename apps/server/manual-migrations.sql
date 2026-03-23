-- Manual migration script for Cloudflare D1
-- D1 does not support ADD COLUMN IF NOT EXISTS. Run each block separately in the D1 Console.
-- If a block errors with "duplicate column name" or "already exists", skip it and run the next.
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

-- 0012: Add toll_preference to bookings (toll | no_toll)
ALTER TABLE bookings ADD COLUMN toll_preference TEXT DEFAULT 'toll';

-- 0013: Add is_guest_booking for guest bookings (no user record - guest bookings have null user_id)
-- SKIP if you get "duplicate column name: is_guest_booking" (column already exists)
ALTER TABLE bookings ADD COLUMN is_guest_booking INTEGER DEFAULT 0;

-- 0014: Make user_id nullable for guest bookings (no placeholder user)
-- If 0013 already ran, use manual-migrations-0014-only.sql instead to avoid re-running 0013
-- Run this after 0013. Recreates bookings table with nullable user_id.
-- For existing guest bookings (is_guest_booking=1), sets user_id to NULL.
-- Removes guest_booking_user if it was created by an older 0013.
PRAGMA foreign_keys = OFF;
CREATE TABLE bookings_new (
	id TEXT PRIMARY KEY NOT NULL,
	reference_number TEXT,
	share_token TEXT,
	booking_type TEXT NOT NULL,
	car_id TEXT,
	user_id TEXT REFERENCES users(id),
	driver_id TEXT,
	package_id TEXT,
	driver_assigned_at INTEGER,
	origin_address TEXT NOT NULL,
	origin_latitude REAL,
	origin_longitude REAL,
	destination_address TEXT NOT NULL,
	destination_latitude REAL,
	destination_longitude REAL,
	scheduled_pickup_time INTEGER NOT NULL,
	timezone TEXT,
	estimated_duration INTEGER,
	actual_pickup_time INTEGER,
	actual_dropoff_time INTEGER,
	estimated_distance REAL,
	actual_distance REAL,
	quoted_amount REAL NOT NULL,
	final_amount REAL,
	base_fare REAL,
	distance_fare REAL,
	time_fare REAL,
	extra_charges REAL DEFAULT 0,
	customer_name TEXT NOT NULL,
	customer_phone TEXT NOT NULL,
	customer_email TEXT,
	passenger_count INTEGER DEFAULT 1 NOT NULL,
	luggage_count INTEGER DEFAULT 0,
	special_requests TEXT,
	additional_notes TEXT,
	toll_preference TEXT DEFAULT 'toll',
	status TEXT DEFAULT 'pending' NOT NULL,
	is_archived INTEGER,
	is_guest_booking INTEGER DEFAULT 0,
	confirmed_at INTEGER,
	driver_en_route_at INTEGER,
	service_started_at INTEGER,
	service_completed_at INTEGER,
	created_at INTEGER DEFAULT (unixepoch()),
	updated_at INTEGER DEFAULT (unixepoch())
);
INSERT INTO bookings_new SELECT
	id, reference_number, share_token, booking_type, car_id,
	CASE WHEN is_guest_booking = 1 THEN NULL ELSE user_id END,
	driver_id, package_id, driver_assigned_at, origin_address, origin_latitude, origin_longitude,
	destination_address, destination_latitude, destination_longitude, scheduled_pickup_time, timezone,
	estimated_duration, actual_pickup_time, actual_dropoff_time, estimated_distance, actual_distance,
	quoted_amount, final_amount, base_fare, distance_fare, time_fare, extra_charges,
	customer_name, customer_phone, customer_email, passenger_count, luggage_count, special_requests, additional_notes,
	toll_preference, status, is_archived, is_guest_booking, confirmed_at, driver_en_route_at, service_started_at, service_completed_at,
	created_at, updated_at
FROM bookings;
DROP TABLE bookings;
ALTER TABLE bookings_new RENAME TO bookings;
PRAGMA foreign_keys = ON;
DELETE FROM users WHERE id = 'guest_booking_user';
