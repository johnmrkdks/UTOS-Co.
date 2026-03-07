CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_type` text NOT NULL,
	`car_id` text NOT NULL,
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
	`estimated_duration` integer,
	`actual_pickup_time` integer,
	`actual_dropoff_time` integer,
	`estimated_distance` integer,
	`actual_distance` integer,
	`quoted_amount` integer NOT NULL,
	`final_amount` integer,
	`base_fare` integer,
	`distance_fare` integer,
	`time_fare` integer,
	`extra_charges` integer DEFAULT 0,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`customer_email` text,
	`passenger_count` integer DEFAULT 1 NOT NULL,
	`special_requests` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`confirmed_at` integer,
	`driver_en_route_at` integer,
	`service_started_at` integer,
	`service_completed_at` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `cars_to_features` (
	`car_id` text NOT NULL,
	`feature_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`feature_id`) REFERENCES `car_features`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `cars` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`license_plate` text NOT NULL,
	`vin_number` text,
	`model_id` text NOT NULL,
	`body_type_id` text NOT NULL,
	`fuel_type_id` text NOT NULL,
	`transmission_type_id` text NOT NULL,
	`drive_type_id` text NOT NULL,
	`condition_type_id` text NOT NULL,
	`category_id` text NOT NULL,
	`color` text NOT NULL,
	`engine_size` integer NOT NULL,
	`doors` integer NOT NULL,
	`cylinders` integer NOT NULL,
	`mileage` integer NOT NULL,
	`seating_capacity` integer DEFAULT 4 NOT NULL,
	`luggage_capacity` text,
	`available_for_packages` integer DEFAULT true NOT NULL,
	`available_for_custom` integer DEFAULT true NOT NULL,
	`current_latitude` real,
	`current_longitude` real,
	`last_location_update` integer,
	`insurance_expiry` integer,
	`registration_expiry` integer,
	`last_service_date` integer,
	`next_service_due` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`model_id`) REFERENCES `car_models`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`body_type_id`) REFERENCES `car_body_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`fuel_type_id`) REFERENCES `car_fuel_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`transmission_type_id`) REFERENCES `car_transmission_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`drive_type_id`) REFERENCES `car_drive_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`condition_type_id`) REFERENCES `car_condition_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `car_categories`(`id`) ON UPDATE no action ON DELETE restrict
);
CREATE UNIQUE INDEX `cars_license_plate_unique` ON `cars` (`license_plate`);
CREATE INDEX `cars_availability_idx` ON `cars` (`is_available`,`is_active`);
CREATE INDEX `cars_published_availability_idx` ON `cars` (`is_published`,`is_active`,`is_available`);
CREATE INDEX `cars_category_idx` ON `cars` (`category_id`);
CREATE INDEX `cars_status_idx` ON `cars` (`status`);
CREATE INDEX `cars_location_idx` ON `cars` (`current_latitude`,`current_longitude`);
CREATE INDEX `cars_license_plate_idx` ON `cars` (`license_plate`);
CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`license_number` text NOT NULL,
	`license_expiry` integer NOT NULL,
	`license_document_url` text,
	`insurance_document_url` text,
	`background_check_document_url` text,
	`profile_photo_url` text,
	`phone_number` text,
	`emergency_contact_name` text,
	`emergency_contact_phone` text,
	`address` text,
	`date_of_birth` integer,
	`onboarding_status` text DEFAULT 'pending' NOT NULL,
	`onboarding_notes` text,
	`approved_at` integer,
	`approved_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`is_available` integer DEFAULT true,
	`rating` real DEFAULT 5,
	`total_rides` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `car_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price_multiplier` real DEFAULT 1 NOT NULL,
	`display_order` integer DEFAULT 0,
	`color` text,
	`icon` text,
	`min_seating_capacity` integer DEFAULT 2,
	`max_seating_capacity` integer DEFAULT 8,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE INDEX `car_categories_name_idx` ON `car_categories` (`name`);
CREATE INDEX `car_categories_order_idx` ON `car_categories` (`display_order`);
CREATE TABLE `car_body_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE UNIQUE INDEX `car_body_types_name_unique` ON `car_body_types` (`name`);
CREATE TABLE `car_brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE UNIQUE INDEX `car_brands_name_unique` ON `car_brands` (`name`);
CREATE TABLE `car_condition_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE UNIQUE INDEX `car_condition_types_name_unique` ON `car_condition_types` (`name`);
CREATE TABLE `car_drive_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE UNIQUE INDEX `car_drive_types_name_unique` ON `car_drive_types` (`name`);
CREATE TABLE `car_features` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE UNIQUE INDEX `car_features_name_unique` ON `car_features` (`name`);
CREATE TABLE `car_fuel_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE UNIQUE INDEX `car_fuel_types_name_unique` ON `car_fuel_types` (`name`);
CREATE TABLE `car_images` (
	`id` text PRIMARY KEY NOT NULL,
	`car_id` text NOT NULL,
	`url` text NOT NULL,
	`alt_text` text,
	`order` integer DEFAULT 0 NOT NULL,
	`is_main` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE cascade ON DELETE cascade
);
CREATE INDEX `car_images_order_idx` ON `car_images` (`car_id`,`order`);
CREATE TABLE `car_models` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`name` text NOT NULL,
	`year` integer NOT NULL,
	`generation` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `car_brands`(`id`) ON UPDATE no action ON DELETE restrict
);
CREATE UNIQUE INDEX `car_models_brand_id_name_year_unique` ON `car_models` (`brand_id`,`name`,`year`);
CREATE TABLE `car_transmission_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE UNIQUE INDEX `car_transmission_types_name_unique` ON `car_transmission_types` (`name`);
CREATE TABLE `booking_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text,
	`service_rating` integer NOT NULL,
	`driver_rating` integer NOT NULL,
	`vehicle_rating` integer NOT NULL,
	`review` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `booking_stops` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`stop_order` integer NOT NULL,
	`address` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`estimated_arrival` integer,
	`actual_arrival` integer,
	`waiting_time` integer DEFAULT 0,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `booking_stops_order_idx` ON `booking_stops` (`booking_id`,`stop_order`);
CREATE TABLE `package_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`display_order` integer DEFAULT 0
);

CREATE TABLE `package_routes` (
	`id` text PRIMARY KEY NOT NULL,
	`package_id` text,
	`stop_order` integer NOT NULL,
	`location_name` text NOT NULL,
	`address` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`estimated_duration` integer,
	`is_pickup_point` integer DEFAULT false,
	`is_dropoff_point` integer DEFAULT false,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `packages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category_id` text,
	`banner_image_url` text,
	`service_type` text NOT NULL,
	`duration` integer,
	`max_distance` integer,
	`fixed_price` integer NOT NULL,
	`extra_km_price` integer,
	`extra_hour_price` integer,
	`deposit_required` integer,
	`max_passengers` integer DEFAULT 4,
	`advance_booking_hours` integer DEFAULT 24,
	`cancellation_hours` integer DEFAULT 24,
	`includes_driver` integer DEFAULT true,
	`includes_fuel` integer DEFAULT true,
	`includes_tolls` integer DEFAULT false,
	`includes_waiting` integer DEFAULT false,
	`waiting_time_minutes` integer DEFAULT 0,
	`is_available` integer DEFAULT true,
	`is_published` integer DEFAULT false,
	`available_days` text,
	`available_time_start` text,
	`available_time_end` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`category_id`) REFERENCES `package_categories`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE INDEX `packages_name_idx` ON `packages` (`name`);
CREATE INDEX `packages_published_availability_idx` ON `packages` (`is_published`,`is_available`);
CREATE TABLE `pricing_config` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`base_fare` integer NOT NULL,
	`price_per_km` integer NOT NULL,
	`price_per_minute` integer,
	`first_km_rate` integer,
	`first_km_limit` integer DEFAULT 5,
	`peak_hour_multiplier` real DEFAULT 1,
	`night_multiplier` real DEFAULT 1.2,
	`weekend_multiplier` real DEFAULT 1,
	`waiting_charge_per_minute` integer DEFAULT 0,
	`stop_charge` integer DEFAULT 0,
	`cancellation_fee` integer DEFAULT 0,
	`peak_hour_start` text,
	`peak_hour_end` text,
	`night_hour_start` text,
	`night_hour_end` text,
	`car_type_id` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);

CREATE TABLE `ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`user_id` text,
	`rating` integer,
	`comment` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer
);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
-- Add booking_extras table for storing detailed extras information
CREATE TABLE `booking_extras` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`additional_wait_time` integer DEFAULT 0,
	`unscheduled_stops` integer DEFAULT 0,
	`parking_charges` integer DEFAULT 0,
	`toll_charges` integer DEFAULT 0,
	`toll_location` text,
	`other_charges_description` text,
	`other_charges_amount` integer DEFAULT 0,
	`extra_type` text DEFAULT 'general' NOT NULL,
	`notes` text,
	`total_extra_amount` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade
);
-- Add offload booking specific fields to bookings table
ALTER TABLE bookings ADD COLUMN offloader_name TEXT;
ALTER TABLE bookings ADD COLUMN job_type TEXT;
ALTER TABLE bookings ADD COLUMN vehicle_type TEXT;
-- Create offload_booking_details table
CREATE TABLE `offload_booking_details` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`offloader_name` text NOT NULL,
	`job_type` text NOT NULL,
	`vehicle_type` text NOT NULL,
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	`updated_at` integer NOT NULL DEFAULT (unixepoch()),
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Create unique index on booking_id for one-to-one relationship
CREATE UNIQUE INDEX `offload_booking_details_booking_id_unique` ON `offload_booking_details` (`booking_id`);

-- Remove offload columns from bookings table
-- Note: SQLite doesn't support DROP COLUMN directly, so we need to:
-- 1. Create a new table without the columns
-- 2. Copy data
-- 3. Drop old table
-- 4. Rename new table
-- However, for safety and to preserve existing data, we'll keep the columns
-- and migrate data in application code first, then create a future migration to drop columns

-- Migration note: Run data migration in application before dropping columns:
-- 1. Copy offload data from bookings to offload_booking_details
-- 2. Verify data integrity
-- 3. Then run a follow-up migration to drop the old columns
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
-- Migration: Convert distance fields from integer (meters) to real (kilometers)
-- Converts existing meter values to kilometers with decimal precision

-- Add reference_number if not exists (required before 0006_complex_xorn runs)
ALTER TABLE bookings ADD COLUMN reference_number TEXT;

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
-- Schema after 0004 may lack: timezone, luggage_count, additional_notes, is_archived
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
	NULL as timezone,
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
	0 as luggage_count,
	special_requests,
	NULL as additional_notes,
	status,
	NULL as is_archived,
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
ALTER TABLE `pricing_config` RENAME TO `pricing_configs`;
CREATE TABLE IF NOT EXISTS `booking_policies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`edit_allowed_hours` integer DEFAULT 4 NOT NULL,
	`edit_disabled_after_driver_assignment` integer DEFAULT true NOT NULL,
	`cancellation_allowed_hours` integer DEFAULT 4 NOT NULL,
	`cancellation_fee_percentage` real DEFAULT 0 NOT NULL,
	`cancellation_disabled_after_driver_assignment` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'unread' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

CREATE TABLE IF NOT EXISTS `customer_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`phone` text,
	`date_of_birth` integer,
	`address` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country` text DEFAULT 'Australia',
	`emergency_contact_name` text,
	`emergency_contact_phone` text,
	`emergency_contact_relationship` text,
	`preferred_car_type` text,
	`communication_preferences` text DEFAULT 'email',
	`profile_completeness` integer DEFAULT 0,
	`is_profile_complete` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `booking_extras` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`additional_wait_time` integer DEFAULT 0,
	`unscheduled_stops` real DEFAULT 0,
	`parking_charges` real DEFAULT 0,
	`toll_charges` real DEFAULT 0,
	`toll_location` text,
	`other_charges_description` text,
	`other_charges_amount` real DEFAULT 0,
	`extra_type` text DEFAULT 'general' NOT NULL,
	`notes` text,
	`total_extra_amount` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `offload_booking_details` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`offloader_name` text NOT NULL,
	`job_type` text NOT NULL,
	`vehicle_type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX IF NOT EXISTS `offload_booking_details_booking_id_unique` ON `offload_booking_details` (`booking_id`);
CREATE TABLE IF NOT EXISTS `instant_quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`origin_address` text NOT NULL,
	`destination_address` text NOT NULL,
	`origin_latitude` real,
	`origin_longitude` real,
	`destination_latitude` real,
	`destination_longitude` real,
	`stops` text,
	`car_id` text,
	`first_km_fare` real NOT NULL,
	`additional_km_fare` real NOT NULL,
	`total_amount` real NOT NULL,
	`estimated_distance` integer NOT NULL,
	`estimated_duration` integer NOT NULL,
	`breakdown` text,
	`scheduled_pickup_time` integer,
	`expires_at` integer NOT NULL,
	`client_ip` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE INDEX IF NOT EXISTS `instant_quotes_expires_at_idx` ON `instant_quotes` (`expires_at`);
CREATE INDEX IF NOT EXISTS `instant_quotes_car_id_idx` ON `instant_quotes` (`car_id`);
CREATE INDEX IF NOT EXISTS `instant_quotes_created_at_idx` ON `instant_quotes` (`created_at`);
CREATE INDEX IF NOT EXISTS `instant_quotes_client_ip_idx` ON `instant_quotes` (`client_ip`);
CREATE TABLE IF NOT EXISTS `package_service_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`rate_type` text DEFAULT 'fixed' NOT NULL,
	`is_active` integer DEFAULT true,
	`display_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS `package_service_types_name_unique` ON `package_service_types` (`name`);
CREATE TABLE IF NOT EXISTS `system_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`timezone` text DEFAULT 'Australia/Sydney' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
PRAGMA foreign_keys=OFF;
CREATE TABLE `__new_pricing_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`car_id` text,
	`first_km_rate` real NOT NULL,
	`first_km_limit` real DEFAULT 10,
	`price_per_km` real DEFAULT 4.85 NOT NULL,
	`car_type_id` text,
	`created_at` real DEFAULT (unixepoch()),
	`updated_at` real DEFAULT (unixepoch()),
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO `__new_pricing_configs`("id", "name", "car_id", "first_km_rate", "first_km_limit", "price_per_km", "car_type_id", "created_at", "updated_at") SELECT "id", "name", "car_id", "first_km_rate", "first_km_limit", "price_per_km", "car_type_id", "created_at", "updated_at" FROM `pricing_configs`;
DROP TABLE `pricing_configs`;
ALTER TABLE `__new_pricing_configs` RENAME TO `pricing_configs`;
PRAGMA foreign_keys=ON;
CREATE INDEX IF NOT EXISTS `pricing_configs_car_id_idx` ON `pricing_configs` (`car_id`);
CREATE TABLE `__new_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category_id` text,
	`service_type_id` text NOT NULL,
	`banner_image_url` text,
	`duration` integer,
	`max_distance` integer,
	`fixed_price` real,
	`hourly_rate` real,
	`extra_km_price` real,
	`extra_hour_price` real,
	`deposit_required` real,
	`max_passengers` integer DEFAULT 20,
	`advance_booking_hours` integer DEFAULT 24,
	`cancellation_hours` integer DEFAULT 24,
	`includes_driver` integer DEFAULT true,
	`includes_fuel` integer DEFAULT true,
	`includes_tolls` integer DEFAULT false,
	`includes_waiting` integer DEFAULT false,
	`waiting_time_minutes` integer DEFAULT 0,
	`is_available` integer DEFAULT true,
	`is_published` integer DEFAULT false,
	`available_days` text,
	`available_time_start` text,
	`available_time_end` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`category_id`) REFERENCES `package_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_type_id`) REFERENCES `package_service_types`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO `__new_packages`("id", "name", "description", "category_id", "service_type_id", "banner_image_url", "duration", "max_distance", "fixed_price", "hourly_rate", "extra_km_price", "extra_hour_price", "deposit_required", "max_passengers", "advance_booking_hours", "cancellation_hours", "includes_driver", "includes_fuel", "includes_tolls", "includes_waiting", "waiting_time_minutes", "is_available", "is_published", "available_days", "available_time_start", "available_time_end", "created_at", "updated_at") SELECT "id", "name", "description", "category_id", "service_type_id", "banner_image_url", "duration", "max_distance", "fixed_price", "hourly_rate", "extra_km_price", "extra_hour_price", "deposit_required", "max_passengers", "advance_booking_hours", "cancellation_hours", "includes_driver", "includes_fuel", "includes_tolls", "includes_waiting", "waiting_time_minutes", "is_available", "is_published", "available_days", "available_time_start", "available_time_end", "created_at", "updated_at" FROM `packages`;
DROP TABLE `packages`;
ALTER TABLE `__new_packages` RENAME TO `packages`;
CREATE INDEX IF NOT EXISTS `packages_name_idx` ON `packages` (`name`);
CREATE INDEX IF NOT EXISTS `packages_published_availability_idx` ON `packages` (`is_published`,`is_available`);
CREATE TABLE `__new_bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`reference_number` text,
	`booking_type` text NOT NULL,
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
	`estimated_distance` real,
	`actual_distance` real,
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
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO `__new_bookings`("id", "reference_number", "booking_type", "car_id", "user_id", "driver_id", "package_id", "driver_assigned_at", "origin_address", "origin_latitude", "origin_longitude", "destination_address", "destination_latitude", "destination_longitude", "scheduled_pickup_time", "timezone", "estimated_duration", "actual_pickup_time", "actual_dropoff_time", "estimated_distance", "actual_distance", "quoted_amount", "final_amount", "base_fare", "distance_fare", "time_fare", "extra_charges", "customer_name", "customer_phone", "customer_email", "passenger_count", "luggage_count", "special_requests", "additional_notes", "status", "is_archived", "confirmed_at", "driver_en_route_at", "service_started_at", "service_completed_at", "created_at", "updated_at") SELECT "id", "reference_number", "booking_type", "car_id", "user_id", "driver_id", "package_id", "driver_assigned_at", "origin_address", "origin_latitude", "origin_longitude", "destination_address", "destination_latitude", "destination_longitude", "scheduled_pickup_time", "timezone", "estimated_duration", "actual_pickup_time", "actual_dropoff_time", "estimated_distance", "actual_distance", "quoted_amount", "final_amount", "base_fare", "distance_fare", "time_fare", "extra_charges", "customer_name", "customer_phone", "customer_email", "passenger_count", "luggage_count", "special_requests", "additional_notes", "status", "is_archived", "confirmed_at", "driver_en_route_at", "service_started_at", "service_completed_at", "created_at", "updated_at" FROM `bookings`;
DROP TABLE `bookings`;
ALTER TABLE `__new_bookings` RENAME TO `bookings`;
CREATE TABLE `__new_cars` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`license_plate` text NOT NULL,
	`vin_number` text,
	`model_id` text NOT NULL,
	`body_type_id` text NOT NULL,
	`fuel_type_id` text NOT NULL,
	`transmission_type_id` text NOT NULL,
	`drive_type_id` text NOT NULL,
	`condition_type_id` text NOT NULL,
	`category_id` text NOT NULL,
	`color` text NOT NULL,
	`doors` integer NOT NULL,
	`seating_capacity` integer DEFAULT 4 NOT NULL,
	`luggage_capacity` integer,
	`available_for_packages` integer DEFAULT true NOT NULL,
	`available_for_custom` integer DEFAULT true NOT NULL,
	`current_latitude` real,
	`current_longitude` real,
	`last_location_update` integer,
	`insurance_expiry` integer,
	`registration_expiry` integer,
	`last_service_date` integer,
	`next_service_due` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`model_id`) REFERENCES `car_models`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`body_type_id`) REFERENCES `car_body_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`fuel_type_id`) REFERENCES `car_fuel_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`transmission_type_id`) REFERENCES `car_transmission_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`drive_type_id`) REFERENCES `car_drive_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`condition_type_id`) REFERENCES `car_condition_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `car_categories`(`id`) ON UPDATE no action ON DELETE restrict
);
INSERT INTO `__new_cars`("id", "name", "description", "license_plate", "vin_number", "model_id", "body_type_id", "fuel_type_id", "transmission_type_id", "drive_type_id", "condition_type_id", "category_id", "color", "doors", "seating_capacity", "luggage_capacity", "available_for_packages", "available_for_custom", "current_latitude", "current_longitude", "last_location_update", "insurance_expiry", "registration_expiry", "last_service_date", "next_service_due", "is_active", "is_available", "is_published", "status", "created_at", "updated_at") SELECT "id", "name", "description", "license_plate", "vin_number", "model_id", "body_type_id", "fuel_type_id", "transmission_type_id", "drive_type_id", "condition_type_id", "category_id", "color", "doors", "seating_capacity", "luggage_capacity", "available_for_packages", "available_for_custom", "current_latitude", "current_longitude", "last_location_update", "insurance_expiry", "registration_expiry", "last_service_date", "next_service_due", "is_active", "is_available", "is_published", "status", "created_at", "updated_at" FROM `cars`;
DROP TABLE `cars`;
ALTER TABLE `__new_cars` RENAME TO `cars`;
CREATE UNIQUE INDEX IF NOT EXISTS `cars_license_plate_unique` ON `cars` (`license_plate`);
CREATE INDEX IF NOT EXISTS `cars_availability_idx` ON `cars` (`is_available`,`is_active`);
CREATE INDEX IF NOT EXISTS `cars_published_availability_idx` ON `cars` (`is_published`,`is_active`,`is_available`);
CREATE INDEX IF NOT EXISTS `cars_category_idx` ON `cars` (`category_id`);
CREATE INDEX IF NOT EXISTS `cars_status_idx` ON `cars` (`status`);
CREATE INDEX IF NOT EXISTS `cars_location_idx` ON `cars` (`current_latitude`,`current_longitude`);
CREATE INDEX IF NOT EXISTS `cars_license_plate_idx` ON `cars` (`license_plate`);
CREATE TABLE `__new_drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`license_number` text NOT NULL,
	`license_expiry` integer NOT NULL,
	`license_document_url` text,
	`insurance_document_url` text,
	`background_check_document_url` text,
	`profile_photo_url` text,
	`phone_number` text,
	`emergency_contact_name` text,
	`emergency_contact_phone` text,
	`address` text,
	`date_of_birth` integer,
	`onboarding_status` text DEFAULT 'pending_approval' NOT NULL,
	`onboarding_notes` text,
	`approved_at` integer,
	`approved_by` text,
	`document_verification` text,
	`verification_status` text DEFAULT 'pending',
	`verified_at` integer,
	`verified_by` text,
	`email_verification_sent_at` integer,
	`email_verified_at` integer,
	`onboarding_email_sent_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`is_available` integer DEFAULT true,
	`rating` real DEFAULT 5,
	`total_rides` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO `__new_drivers`("id", "user_id", "license_number", "license_expiry", "license_document_url", "insurance_document_url", "background_check_document_url", "profile_photo_url", "phone_number", "emergency_contact_name", "emergency_contact_phone", "address", "date_of_birth", "onboarding_status", "onboarding_notes", "approved_at", "approved_by", "document_verification", "verification_status", "verified_at", "verified_by", "email_verification_sent_at", "email_verified_at", "onboarding_email_sent_at", "is_active", "is_approved", "is_available", "rating", "total_rides", "created_at", "updated_at") SELECT "id", "user_id", "license_number", "license_expiry", "license_document_url", "insurance_document_url", "background_check_document_url", "profile_photo_url", "phone_number", "emergency_contact_name", "emergency_contact_phone", "address", "date_of_birth", "onboarding_status", "onboarding_notes", "approved_at", "approved_by", "document_verification", "verification_status", "verified_at", "verified_by", "email_verification_sent_at", "email_verified_at", "onboarding_email_sent_at", "is_active", "is_approved", "is_available", "rating", "total_rides", "created_at", "updated_at" FROM `drivers`;
DROP TABLE `drivers`;
ALTER TABLE `__new_drivers` RENAME TO `drivers`;
ALTER TABLE `users` ADD `phone` text;
ALTER TABLE `users` ADD `timezone` text;
ALTER TABLE `users` ADD `is_anonymous` integer DEFAULT false;
-- Add booking_reference_prefix column to system_settings table
ALTER TABLE system_settings ADD COLUMN booking_reference_prefix TEXT NOT NULL DEFAULT 'DUC';

-- Update existing row with default prefix (if system_settings table has data)
UPDATE system_settings SET booking_reference_prefix = 'DUC' WHERE id = 1;

-- If no settings exist, insert default settings
INSERT OR IGNORE INTO system_settings (id, timezone, booking_reference_prefix)
VALUES (1, 'Australia/Sydney', 'DUC');
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
-- No-op: Distance types and schema already fixed by 0005 and 0006_complex_xorn
-- This migration was for an older schema with offloader_name in bookings
SELECT 1;
-- Add commission_rate to drivers table (percentage 0-100, default 50 for 50/50 split)
ALTER TABLE drivers ADD COLUMN commission_rate integer DEFAULT 50;
-- Invoice sent logs table for tracking all invoices emailed
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
