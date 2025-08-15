PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bookings` (
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
INSERT INTO `__new_bookings`("id", "booking_type", "car_id", "user_id", "driver_id", "package_id", "driver_assigned_at", "origin_address", "origin_latitude", "origin_longitude", "destination_address", "destination_latitude", "destination_longitude", "scheduled_pickup_time", "estimated_duration", "actual_pickup_time", "actual_dropoff_time", "estimated_distance", "actual_distance", "quoted_amount", "final_amount", "base_fare", "distance_fare", "time_fare", "extra_charges", "customer_name", "customer_phone", "customer_email", "passenger_count", "special_requests", "status", "confirmed_at", "driver_en_route_at", "service_started_at", "service_completed_at", "created_at", "updated_at") SELECT "id", "booking_type", "car_id", "user_id", "driver_id", "package_id", "driver_assigned_at", "origin_address", "origin_latitude", "origin_longitude", "destination_address", "destination_latitude", "destination_longitude", "scheduled_pickup_time", "estimated_duration", "actual_pickup_time", "actual_dropoff_time", "estimated_distance", "actual_distance", "quoted_amount", "final_amount", "base_fare", "distance_fare", "time_fare", "extra_charges", "customer_name", "customer_phone", "customer_email", "passenger_count", "special_requests", "status", "confirmed_at", "driver_en_route_at", "service_started_at", "service_completed_at", "created_at", "updated_at" FROM `bookings`;--> statement-breakpoint
DROP TABLE `bookings`;--> statement-breakpoint
ALTER TABLE `__new_bookings` RENAME TO `bookings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_cars_to_features` (
	`car_id` text NOT NULL,
	`feature_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`feature_id`) REFERENCES `car_features`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_cars_to_features`("car_id", "feature_id", "created_at", "updated_at") SELECT "car_id", "feature_id", "created_at", "updated_at" FROM `cars_to_features`;--> statement-breakpoint
DROP TABLE `cars_to_features`;--> statement-breakpoint
ALTER TABLE `__new_cars_to_features` RENAME TO `cars_to_features`;--> statement-breakpoint
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
INSERT INTO `__new_cars`("id", "name", "description", "license_plate", "vin_number", "model_id", "body_type_id", "fuel_type_id", "transmission_type_id", "drive_type_id", "condition_type_id", "category_id", "color", "engine_size", "doors", "cylinders", "mileage", "seating_capacity", "luggage_capacity", "available_for_packages", "available_for_custom", "current_latitude", "current_longitude", "last_location_update", "insurance_expiry", "registration_expiry", "last_service_date", "next_service_due", "is_active", "is_available", "is_published", "status", "created_at", "updated_at") SELECT "id", "name", "description", "license_plate", "vin_number", "model_id", "body_type_id", "fuel_type_id", "transmission_type_id", "drive_type_id", "condition_type_id", "category_id", "color", "engine_size", "doors", "cylinders", "mileage", "seating_capacity", "luggage_capacity", "available_for_packages", "available_for_custom", "current_latitude", "current_longitude", "last_location_update", "insurance_expiry", "registration_expiry", "last_service_date", "next_service_due", "is_active", "is_available", "is_published", "status", "created_at", "updated_at" FROM `cars`;--> statement-breakpoint
DROP TABLE `cars`;--> statement-breakpoint
ALTER TABLE `__new_cars` RENAME TO `cars`;--> statement-breakpoint
CREATE UNIQUE INDEX `cars_license_plate_unique` ON `cars` (`license_plate`);--> statement-breakpoint
CREATE INDEX `cars_availability_idx` ON `cars` (`is_available`,`is_active`);--> statement-breakpoint
CREATE INDEX `cars_published_availability_idx` ON `cars` (`is_published`,`is_active`,`is_available`);--> statement-breakpoint
CREATE INDEX `cars_category_idx` ON `cars` (`category_id`);--> statement-breakpoint
CREATE INDEX `cars_status_idx` ON `cars` (`status`);--> statement-breakpoint
CREATE INDEX `cars_location_idx` ON `cars` (`current_latitude`,`current_longitude`);--> statement-breakpoint
CREATE INDEX `cars_license_plate_idx` ON `cars` (`license_plate`);--> statement-breakpoint
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
INSERT INTO `__new_drivers`("id", "user_id", "license_number", "license_expiry", "license_document_url", "insurance_document_url", "background_check_document_url", "profile_photo_url", "phone_number", "emergency_contact_name", "emergency_contact_phone", "address", "date_of_birth", "onboarding_status", "onboarding_notes", "approved_at", "approved_by", "is_active", "is_approved", "is_available", "rating", "total_rides", "created_at", "updated_at") SELECT "id", "user_id", "license_number", "license_expiry", "license_document_url", "insurance_document_url", "background_check_document_url", "profile_photo_url", "phone_number", "emergency_contact_name", "emergency_contact_phone", "address", "date_of_birth", "onboarding_status", "onboarding_notes", "approved_at", "approved_by", "is_active", "is_approved", "is_available", "rating", "total_rides", "created_at", "updated_at" FROM `drivers`;--> statement-breakpoint
DROP TABLE `drivers`;--> statement-breakpoint
ALTER TABLE `__new_drivers` RENAME TO `drivers`;--> statement-breakpoint
CREATE TABLE `__new_car_categories` (
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
INSERT INTO `__new_car_categories`("id", "name", "description", "price_multiplier", "display_order", "color", "icon", "min_seating_capacity", "max_seating_capacity", "is_active", "created_at", "updated_at") SELECT "id", "name", "description", "price_multiplier", "display_order", "color", "icon", "min_seating_capacity", "max_seating_capacity", "is_active", "created_at", "updated_at" FROM `car_categories`;--> statement-breakpoint
DROP TABLE `car_categories`;--> statement-breakpoint
ALTER TABLE `__new_car_categories` RENAME TO `car_categories`;--> statement-breakpoint
CREATE INDEX `car_categories_name_idx` ON `car_categories` (`name`);--> statement-breakpoint
CREATE INDEX `car_categories_order_idx` ON `car_categories` (`display_order`);--> statement-breakpoint
CREATE TABLE `__new_car_body_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_car_body_types`("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM `car_body_types`;--> statement-breakpoint
DROP TABLE `car_body_types`;--> statement-breakpoint
ALTER TABLE `__new_car_body_types` RENAME TO `car_body_types`;--> statement-breakpoint
CREATE UNIQUE INDEX `car_body_types_name_unique` ON `car_body_types` (`name`);--> statement-breakpoint
CREATE TABLE `__new_car_brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_car_brands`("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM `car_brands`;--> statement-breakpoint
DROP TABLE `car_brands`;--> statement-breakpoint
ALTER TABLE `__new_car_brands` RENAME TO `car_brands`;--> statement-breakpoint
CREATE UNIQUE INDEX `car_brands_name_unique` ON `car_brands` (`name`);--> statement-breakpoint
CREATE TABLE `__new_car_condition_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_car_condition_types`("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM `car_condition_types`;--> statement-breakpoint
DROP TABLE `car_condition_types`;--> statement-breakpoint
ALTER TABLE `__new_car_condition_types` RENAME TO `car_condition_types`;--> statement-breakpoint
CREATE UNIQUE INDEX `car_condition_types_name_unique` ON `car_condition_types` (`name`);--> statement-breakpoint
CREATE TABLE `__new_car_drive_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_car_drive_types`("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM `car_drive_types`;--> statement-breakpoint
DROP TABLE `car_drive_types`;--> statement-breakpoint
ALTER TABLE `__new_car_drive_types` RENAME TO `car_drive_types`;--> statement-breakpoint
CREATE UNIQUE INDEX `car_drive_types_name_unique` ON `car_drive_types` (`name`);--> statement-breakpoint
CREATE TABLE `__new_car_features` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_car_features`("id", "name", "description", "created_at", "updated_at") SELECT "id", "name", "description", "created_at", "updated_at" FROM `car_features`;--> statement-breakpoint
DROP TABLE `car_features`;--> statement-breakpoint
ALTER TABLE `__new_car_features` RENAME TO `car_features`;--> statement-breakpoint
CREATE UNIQUE INDEX `car_features_name_unique` ON `car_features` (`name`);--> statement-breakpoint
CREATE TABLE `__new_car_fuel_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_car_fuel_types`("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM `car_fuel_types`;--> statement-breakpoint
DROP TABLE `car_fuel_types`;--> statement-breakpoint
ALTER TABLE `__new_car_fuel_types` RENAME TO `car_fuel_types`;--> statement-breakpoint
CREATE UNIQUE INDEX `car_fuel_types_name_unique` ON `car_fuel_types` (`name`);--> statement-breakpoint
CREATE TABLE `__new_car_images` (
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
INSERT INTO `__new_car_images`("id", "car_id", "url", "alt_text", "order", "is_main", "created_at", "updated_at") SELECT "id", "car_id", "url", "alt_text", "order", "is_main", "created_at", "updated_at" FROM `car_images`;--> statement-breakpoint
DROP TABLE `car_images`;--> statement-breakpoint
ALTER TABLE `__new_car_images` RENAME TO `car_images`;--> statement-breakpoint
CREATE INDEX `car_images_order_idx` ON `car_images` (`car_id`,`order`);--> statement-breakpoint
CREATE TABLE `__new_car_models` (
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
INSERT INTO `__new_car_models`("id", "brand_id", "name", "year", "generation", "created_at", "updated_at") SELECT "id", "brand_id", "name", "year", "generation", "created_at", "updated_at" FROM `car_models`;--> statement-breakpoint
DROP TABLE `car_models`;--> statement-breakpoint
ALTER TABLE `__new_car_models` RENAME TO `car_models`;--> statement-breakpoint
CREATE UNIQUE INDEX `car_models_brand_id_name_year_unique` ON `car_models` (`brand_id`,`name`,`year`);--> statement-breakpoint
CREATE TABLE `__new_car_transmission_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_car_transmission_types`("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM `car_transmission_types`;--> statement-breakpoint
DROP TABLE `car_transmission_types`;--> statement-breakpoint
ALTER TABLE `__new_car_transmission_types` RENAME TO `car_transmission_types`;--> statement-breakpoint
CREATE UNIQUE INDEX `car_transmission_types_name_unique` ON `car_transmission_types` (`name`);--> statement-breakpoint
CREATE TABLE `__new_booking_reviews` (
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
INSERT INTO `__new_booking_reviews`("id", "booking_id", "service_rating", "driver_rating", "vehicle_rating", "review", "created_at") SELECT "id", "booking_id", "service_rating", "driver_rating", "vehicle_rating", "review", "created_at" FROM `booking_reviews`;--> statement-breakpoint
DROP TABLE `booking_reviews`;--> statement-breakpoint
ALTER TABLE `__new_booking_reviews` RENAME TO `booking_reviews`;--> statement-breakpoint
CREATE TABLE `__new_booking_stops` (
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
INSERT INTO `__new_booking_stops`("id", "booking_id", "stop_order", "address", "latitude", "longitude", "estimated_arrival", "actual_arrival", "waiting_time", "notes", "created_at") SELECT "id", "booking_id", "stop_order", "address", "latitude", "longitude", "estimated_arrival", "actual_arrival", "waiting_time", "notes", "created_at" FROM `booking_stops`;--> statement-breakpoint
DROP TABLE `booking_stops`;--> statement-breakpoint
ALTER TABLE `__new_booking_stops` RENAME TO `booking_stops`;--> statement-breakpoint
CREATE INDEX `booking_stops_order_idx` ON `booking_stops` (`booking_id`,`stop_order`);--> statement-breakpoint
CREATE TABLE `__new_packages` (
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
INSERT INTO `__new_packages`("id", "name", "description", "category_id", "banner_image_url", "service_type", "duration", "max_distance", "fixed_price", "extra_km_price", "extra_hour_price", "deposit_required", "max_passengers", "advance_booking_hours", "cancellation_hours", "includes_driver", "includes_fuel", "includes_tolls", "includes_waiting", "waiting_time_minutes", "is_available", "is_published", "available_days", "available_time_start", "available_time_end", "created_at", "updated_at") SELECT "id", "name", "description", "category_id", "banner_image_url", "service_type", "duration", "max_distance", "fixed_price", "extra_km_price", "extra_hour_price", "deposit_required", "max_passengers", "advance_booking_hours", "cancellation_hours", "includes_driver", "includes_fuel", "includes_tolls", "includes_waiting", "waiting_time_minutes", "is_available", "is_published", "available_days", "available_time_start", "available_time_end", "created_at", "updated_at" FROM `packages`;--> statement-breakpoint
DROP TABLE `packages`;--> statement-breakpoint
ALTER TABLE `__new_packages` RENAME TO `packages`;--> statement-breakpoint
CREATE INDEX `packages_name_idx` ON `packages` (`name`);--> statement-breakpoint
CREATE INDEX `packages_published_availability_idx` ON `packages` (`is_published`,`is_available`);--> statement-breakpoint
CREATE TABLE `__new_pricing_config` (
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
INSERT INTO `__new_pricing_config`("id", "name", "base_fare", "price_per_km", "price_per_minute", "first_km_rate", "first_km_limit", "peak_hour_multiplier", "night_multiplier", "weekend_multiplier", "waiting_charge_per_minute", "stop_charge", "cancellation_fee", "peak_hour_start", "peak_hour_end", "night_hour_start", "night_hour_end", "car_type_id", "is_active", "created_at", "updated_at") SELECT "id", "name", "base_fare", "price_per_km", "price_per_minute", "first_km_rate", "first_km_limit", "peak_hour_multiplier", "night_multiplier", "weekend_multiplier", "waiting_charge_per_minute", "stop_charge", "cancellation_fee", "peak_hour_start", "peak_hour_end", "night_hour_start", "night_hour_end", "car_type_id", "is_active", "created_at", "updated_at" FROM `pricing_config`;--> statement-breakpoint
DROP TABLE `pricing_config`;--> statement-breakpoint
ALTER TABLE `__new_pricing_config` RENAME TO `pricing_config`;--> statement-breakpoint
CREATE TABLE `__new_ratings` (
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
INSERT INTO `__new_ratings`("id", "entity_id", "entity_type", "user_id", "rating", "comment", "created_at", "updated_at") SELECT "id", "entity_id", "entity_type", "user_id", "rating", "comment", "created_at", "updated_at" FROM `ratings`;--> statement-breakpoint
DROP TABLE `ratings`;--> statement-breakpoint
ALTER TABLE `__new_ratings` RENAME TO `ratings`;--> statement-breakpoint
CREATE TABLE `__new_users` (
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
INSERT INTO `__new_users`("id", "name", "email", "email_verified", "image", "created_at", "updated_at", "role", "banned", "ban_reason", "ban_expires") SELECT "id", "name", "email", "email_verified", "image", "created_at", "updated_at", "role", "banned", "ban_reason", "ban_expires" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);