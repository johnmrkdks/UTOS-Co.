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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `cars_to_features` (
	`car_id` text NOT NULL,
	`feature_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`feature_id`) REFERENCES `car_features`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX `cars_license_plate_unique` ON `cars` (`license_plate`);--> statement-breakpoint
CREATE INDEX `cars_availability_idx` ON `cars` (`is_available`,`is_active`);--> statement-breakpoint
CREATE INDEX `cars_published_availability_idx` ON `cars` (`is_published`,`is_active`,`is_available`);--> statement-breakpoint
CREATE INDEX `cars_category_idx` ON `cars` (`category_id`);--> statement-breakpoint
CREATE INDEX `cars_status_idx` ON `cars` (`status`);--> statement-breakpoint
CREATE INDEX `cars_location_idx` ON `cars` (`current_latitude`,`current_longitude`);--> statement-breakpoint
CREATE INDEX `cars_license_plate_idx` ON `cars` (`license_plate`);--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `car_categories_name_idx` ON `car_categories` (`name`);--> statement-breakpoint
CREATE INDEX `car_categories_order_idx` ON `car_categories` (`display_order`);--> statement-breakpoint
CREATE TABLE `car_body_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_body_types_name_unique` ON `car_body_types` (`name`);--> statement-breakpoint
CREATE TABLE `car_brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_brands_name_unique` ON `car_brands` (`name`);--> statement-breakpoint
CREATE TABLE `car_condition_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_condition_types_name_unique` ON `car_condition_types` (`name`);--> statement-breakpoint
CREATE TABLE `car_drive_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_drive_types_name_unique` ON `car_drive_types` (`name`);--> statement-breakpoint
CREATE TABLE `car_features` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_features_name_unique` ON `car_features` (`name`);--> statement-breakpoint
CREATE TABLE `car_fuel_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_fuel_types_name_unique` ON `car_fuel_types` (`name`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `car_images_order_idx` ON `car_images` (`car_id`,`order`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX `car_models_brand_id_name_year_unique` ON `car_models` (`brand_id`,`name`,`year`);--> statement-breakpoint
CREATE TABLE `car_transmission_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_transmission_types_name_unique` ON `car_transmission_types` (`name`);--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `booking_stops_order_idx` ON `booking_stops` (`booking_id`,`stop_order`);--> statement-breakpoint
CREATE TABLE `package_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`display_order` integer DEFAULT 0
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `packages_name_idx` ON `packages` (`name`);--> statement-breakpoint
CREATE INDEX `packages_published_availability_idx` ON `packages` (`is_published`,`is_available`);--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
