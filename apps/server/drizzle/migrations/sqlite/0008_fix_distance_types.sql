-- Fix distance types from INTEGER to REAL for current database
-- This migration handles the current database schema without reference_number

-- Create new table with REAL distance types
CREATE TABLE bookings_new (
	id TEXT PRIMARY KEY NOT NULL,
	booking_type TEXT NOT NULL,
	car_id TEXT NOT NULL,
	user_id TEXT NOT NULL,
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
	estimated_duration INTEGER,
	actual_pickup_time INTEGER,
	actual_dropoff_time INTEGER,
	estimated_distance REAL,  -- Changed from INTEGER to REAL
	actual_distance REAL,      -- Changed from INTEGER to REAL
	quoted_amount INTEGER NOT NULL,
	final_amount INTEGER,
	base_fare INTEGER,
	distance_fare INTEGER,
	time_fare INTEGER,
	extra_charges INTEGER DEFAULT 0,
	customer_name TEXT NOT NULL,
	customer_phone TEXT NOT NULL,
	customer_email TEXT,
	passenger_count INTEGER NOT NULL DEFAULT 1,
	special_requests TEXT,
	status TEXT NOT NULL DEFAULT 'pending',
	confirmed_at INTEGER,
	driver_en_route_at INTEGER,
	service_started_at INTEGER,
	service_completed_at INTEGER,
	created_at INTEGER DEFAULT (unixepoch()),
	updated_at INTEGER DEFAULT (unixepoch()),
	offloader_name TEXT,
	job_type TEXT,
	vehicle_type TEXT,
	timezone TEXT,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
	FOREIGN KEY (driver_id) REFERENCES drivers(id),
	FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Copy data, converting meters to kilometers
INSERT INTO bookings_new
SELECT
	id,
	booking_type,
	car_id,
	user_id,
	driver_id,
	package_id,
	driver_assigned_at,
	origin_address,
	origin_latitude,
	origin_longitude,
	destination_address,
	destination_latitude,
	destination_longitude,
	scheduled_pickup_time,
	estimated_duration,
	actual_pickup_time,
	actual_dropoff_time,
	CASE
		WHEN estimated_distance IS NOT NULL THEN CAST(estimated_distance AS REAL) / 1000.0
		ELSE NULL
	END as estimated_distance,
	CASE
		WHEN actual_distance IS NOT NULL THEN CAST(actual_distance AS REAL) / 1000.0
		ELSE NULL
	END as actual_distance,
	quoted_amount,
	final_amount,
	base_fare,
	distance_fare,
	time_fare,
	extra_charges,
	customer_name,
	customer_phone,
	customer_email,
	passenger_count,
	special_requests,
	status,
	confirmed_at,
	driver_en_route_at,
	service_started_at,
	service_completed_at,
	created_at,
	updated_at,
	offloader_name,
	job_type,
	vehicle_type,
	timezone
FROM bookings;

-- Drop old table and rename
DROP TABLE bookings;
ALTER TABLE bookings_new RENAME TO bookings;
