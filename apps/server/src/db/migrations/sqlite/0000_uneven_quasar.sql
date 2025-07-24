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
	`car_id` text NOT NULL,
	`package_id` text NOT NULL,
	`user_id` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cars` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`date_manufactured` integer NOT NULL,
	`model_id` text NOT NULL,
	`body_type_id` text NOT NULL,
	`fuel_type_id` text NOT NULL,
	`transmission_type_id` text NOT NULL,
	`drive_type_id` text NOT NULL,
	`condition_type_id` text NOT NULL,
	`number_plate` text NOT NULL,
	`mileage` integer NOT NULL,
	`color` text NOT NULL,
	`engine_size` integer NOT NULL,
	`doors` integer NOT NULL,
	`cylinders` integer NOT NULL,
	`price_per_day` integer,
	`price_per_km` integer,
	`is_for_delivery` integer DEFAULT false NOT NULL,
	`is_available` integer DEFAULT false NOT NULL,
	`is_for_hire` integer DEFAULT false NOT NULL,
	`is_for_rent` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`model_id`) REFERENCES `car_models`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`body_type_id`) REFERENCES `car_body_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`fuel_type_id`) REFERENCES `car_fuel_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`transmission_type_id`) REFERENCES `car_transmission_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`drive_type_id`) REFERENCES `car_drive_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`condition_type_id`) REFERENCES `car_condition_types`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `cars_availability_idx` ON `cars` (`is_available`);--> statement-breakpoint
CREATE INDEX `cars_price_idx` ON `cars` (`price_per_day`);--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`license_number` text NOT NULL,
	`car_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `car_body_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_body_types_name_unique` ON `car_body_types` (`name`);--> statement-breakpoint
CREATE TABLE `car_brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_brands_name_unique` ON `car_brands` (`name`);--> statement-breakpoint
CREATE TABLE `car_condition_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_condition_types_name_unique` ON `car_condition_types` (`name`);--> statement-breakpoint
CREATE TABLE `car_drive_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_drive_types_name_unique` ON `car_drive_types` (`name`);--> statement-breakpoint
CREATE TABLE `car_features` (
	`id` text PRIMARY KEY NOT NULL,
	`car_id` text NOT NULL,
	`feature` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `car_fuel_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
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
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
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
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `car_brands`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_models_brand_id_name_year_unique` ON `car_models` (`brand_id`,`name`,`year`);--> statement-breakpoint
CREATE TABLE `car_transmission_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_transmission_types_name_unique` ON `car_transmission_types` (`name`);--> statement-breakpoint
CREATE TABLE `packages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price_per_day` integer,
	`is_available` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `packages` (`name`);--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`user_id` text,
	`rating` integer,
	`comment` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
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
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
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
