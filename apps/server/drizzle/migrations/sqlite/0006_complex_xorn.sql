ALTER TABLE `pricing_config` RENAME TO `pricing_configs`;--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'unread' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `offload_booking_details_booking_id_unique` ON `offload_booking_details` (`booking_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `instant_quotes_expires_at_idx` ON `instant_quotes` (`expires_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `instant_quotes_car_id_idx` ON `instant_quotes` (`car_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `instant_quotes_created_at_idx` ON `instant_quotes` (`created_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `instant_quotes_client_ip_idx` ON `instant_quotes` (`client_ip`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `package_service_types_name_unique` ON `package_service_types` (`name`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `system_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`timezone` text DEFAULT 'Australia/Sydney' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
--> statement-breakpoint
INSERT INTO `__new_pricing_configs`("id", "name", "car_id", "first_km_rate", "first_km_limit", "price_per_km", "car_type_id", "created_at", "updated_at") SELECT "id", "name", "car_id", "first_km_rate", "first_km_limit", "price_per_km", "car_type_id", "created_at", "updated_at" FROM `pricing_configs`;--> statement-breakpoint
DROP TABLE `pricing_configs`;--> statement-breakpoint
ALTER TABLE `__new_pricing_configs` RENAME TO `pricing_configs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `pricing_configs_car_id_idx` ON `pricing_configs` (`car_id`);--> statement-breakpoint
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
--> statement-breakpoint
INSERT INTO `__new_packages`("id", "name", "description", "category_id", "service_type_id", "banner_image_url", "duration", "max_distance", "fixed_price", "hourly_rate", "extra_km_price", "extra_hour_price", "deposit_required", "max_passengers", "advance_booking_hours", "cancellation_hours", "includes_driver", "includes_fuel", "includes_tolls", "includes_waiting", "waiting_time_minutes", "is_available", "is_published", "available_days", "available_time_start", "available_time_end", "created_at", "updated_at") SELECT "id", "name", "description", "category_id", "service_type_id", "banner_image_url", "duration", "max_distance", "fixed_price", "hourly_rate", "extra_km_price", "extra_hour_price", "deposit_required", "max_passengers", "advance_booking_hours", "cancellation_hours", "includes_driver", "includes_fuel", "includes_tolls", "includes_waiting", "waiting_time_minutes", "is_available", "is_published", "available_days", "available_time_start", "available_time_end", "created_at", "updated_at" FROM `packages`;--> statement-breakpoint
DROP TABLE `packages`;--> statement-breakpoint
ALTER TABLE `__new_packages` RENAME TO `packages`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `packages_name_idx` ON `packages` (`name`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `packages_published_availability_idx` ON `packages` (`is_published`,`is_available`);--> statement-breakpoint
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
--> statement-breakpoint
INSERT INTO `__new_bookings`("id", "reference_number", "booking_type", "car_id", "user_id", "driver_id", "package_id", "driver_assigned_at", "origin_address", "origin_latitude", "origin_longitude", "destination_address", "destination_latitude", "destination_longitude", "scheduled_pickup_time", "timezone", "estimated_duration", "actual_pickup_time", "actual_dropoff_time", "estimated_distance", "actual_distance", "quoted_amount", "final_amount", "base_fare", "distance_fare", "time_fare", "extra_charges", "customer_name", "customer_phone", "customer_email", "passenger_count", "luggage_count", "special_requests", "additional_notes", "status", "is_archived", "confirmed_at", "driver_en_route_at", "service_started_at", "service_completed_at", "created_at", "updated_at") SELECT "id", "reference_number", "booking_type", "car_id", "user_id", "driver_id", "package_id", "driver_assigned_at", "origin_address", "origin_latitude", "origin_longitude", "destination_address", "destination_latitude", "destination_longitude", "scheduled_pickup_time", "timezone", "estimated_duration", "actual_pickup_time", "actual_dropoff_time", "estimated_distance", "actual_distance", "quoted_amount", "final_amount", "base_fare", "distance_fare", "time_fare", "extra_charges", "customer_name", "customer_phone", "customer_email", "passenger_count", "luggage_count", "special_requests", "additional_notes", "status", "is_archived", "confirmed_at", "driver_en_route_at", "service_started_at", "service_completed_at", "created_at", "updated_at" FROM `bookings`;--> statement-breakpoint
DROP TABLE `bookings`;--> statement-breakpoint
ALTER TABLE `__new_bookings` RENAME TO `bookings`;--> statement-breakpoint
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
--> statement-breakpoint
INSERT INTO `__new_cars`("id", "name", "description", "license_plate", "vin_number", "model_id", "body_type_id", "fuel_type_id", "transmission_type_id", "drive_type_id", "condition_type_id", "category_id", "color", "doors", "seating_capacity", "luggage_capacity", "available_for_packages", "available_for_custom", "current_latitude", "current_longitude", "last_location_update", "insurance_expiry", "registration_expiry", "last_service_date", "next_service_due", "is_active", "is_available", "is_published", "status", "created_at", "updated_at") SELECT "id", "name", "description", "license_plate", "vin_number", "model_id", "body_type_id", "fuel_type_id", "transmission_type_id", "drive_type_id", "condition_type_id", "category_id", "color", "doors", "seating_capacity", "luggage_capacity", "available_for_packages", "available_for_custom", "current_latitude", "current_longitude", "last_location_update", "insurance_expiry", "registration_expiry", "last_service_date", "next_service_due", "is_active", "is_available", "is_published", "status", "created_at", "updated_at" FROM `cars`;--> statement-breakpoint
DROP TABLE `cars`;--> statement-breakpoint
ALTER TABLE `__new_cars` RENAME TO `cars`;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `cars_license_plate_unique` ON `cars` (`license_plate`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cars_availability_idx` ON `cars` (`is_available`,`is_active`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cars_published_availability_idx` ON `cars` (`is_published`,`is_active`,`is_available`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cars_category_idx` ON `cars` (`category_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cars_status_idx` ON `cars` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cars_location_idx` ON `cars` (`current_latitude`,`current_longitude`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cars_license_plate_idx` ON `cars` (`license_plate`);--> statement-breakpoint
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
--> statement-breakpoint
INSERT INTO `__new_drivers`("id", "user_id", "license_number", "license_expiry", "license_document_url", "insurance_document_url", "background_check_document_url", "profile_photo_url", "phone_number", "emergency_contact_name", "emergency_contact_phone", "address", "date_of_birth", "onboarding_status", "onboarding_notes", "approved_at", "approved_by", "document_verification", "verification_status", "verified_at", "verified_by", "email_verification_sent_at", "email_verified_at", "onboarding_email_sent_at", "is_active", "is_approved", "is_available", "rating", "total_rides", "created_at", "updated_at") SELECT "id", "user_id", "license_number", "license_expiry", "license_document_url", "insurance_document_url", "background_check_document_url", "profile_photo_url", "phone_number", "emergency_contact_name", "emergency_contact_phone", "address", "date_of_birth", "onboarding_status", "onboarding_notes", "approved_at", "approved_by", "document_verification", "verification_status", "verified_at", "verified_by", "email_verification_sent_at", "email_verified_at", "onboarding_email_sent_at", "is_active", "is_approved", "is_available", "rating", "total_rides", "created_at", "updated_at" FROM `drivers`;--> statement-breakpoint
DROP TABLE `drivers`;--> statement-breakpoint
ALTER TABLE `__new_drivers` RENAME TO `drivers`;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `users` ADD `timezone` text;--> statement-breakpoint
ALTER TABLE `users` ADD `is_anonymous` integer DEFAULT false;