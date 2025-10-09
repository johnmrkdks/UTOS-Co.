-- Migration: Convert distance fields from integer (meters) to real (kilometers)
-- Converts existing meter values to kilometers with decimal precision

-- Create new bookings table with real distance fields
CREATE TABLE `bookings_new` AS SELECT * FROM `bookings` WHERE 1=0;

-- Drop and recreate with correct types
DROP TABLE `bookings_new`;

CREATE TABLE `bookings_new` (
	`id` text PRIMARY KEY NOT NULL,
	`reference_number` text,
	`booking_type` text DEFAULT 'custom' NOT NULL,
	`car_id` text,
	`user_id` text NOT NULL,
	`driver_id` text,
	`package_id` text,
	`driver_assigned_at` integer,
	`origin_address` text NOT NULL,
	`origin_latitude` real,
	`origin_longitude` real,
	`destination_address` text NOT NULL,
	`destination_latitude` real,
	`destination_longitude` real,
	`scheduled_pickup_time` integer NOT NULL,
	`timezone` text,
	`estimated_duration` integer,
	`actual_pickup_time` integer,
	`actual_dropoff_time` integer,
	`estimated_distance` real,  -- Changed from INTEGER to REAL
	`actual_distance` real,      -- Changed from INTEGER to REAL
	`quoted_amount` real NOT NULL,
	`final_amount` real,
	`base_fare` real,
	`distance_fare` real,
	`time_fare` real,
	`extra_charges` real DEFAULT 0,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`customer_email` text,
	`passenger_count` integer DEFAULT 1 NOT NULL,
	`luggage_count` integer DEFAULT 0,
	`special_requests` text,
	`additional_notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`is_archived` integer,
	`confirmed_at` integer,
	`driver_en_route_at` integer,
	`service_started_at` integer,
	`service_completed_at` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE set null
);

-- Copy data, converting meters to kilometers
INSERT INTO bookings_new
SELECT
	id,
	reference_number,
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
	timezone,
	estimated_duration,
	actual_pickup_time,
	actual_dropoff_time,
	CASE
		WHEN estimated_distance IS NOT NULL THEN CAST(estimated_distance AS REAL) / 1000.0
		ELSE NULL
	END as estimated_distance,  -- Convert meters to kilometers
	CASE
		WHEN actual_distance IS NOT NULL THEN CAST(actual_distance AS REAL) / 1000.0
		ELSE NULL
	END as actual_distance,      -- Convert meters to kilometers
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
	luggage_count,
	special_requests,
	additional_notes,
	status,
	is_archived,
	confirmed_at,
	driver_en_route_at,
	service_started_at,
	service_completed_at,
	created_at,
	updated_at
FROM bookings;

-- Drop old table and rename
DROP TABLE bookings;
ALTER TABLE bookings_new RENAME TO bookings;
