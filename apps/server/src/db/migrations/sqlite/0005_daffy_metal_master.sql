ALTER TABLE `car_body_types` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `car_brands` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `car_condition_types` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `car_drive_types` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `car_features` ADD `description` text;--> statement-breakpoint
ALTER TABLE `car_features` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `car_features_name_unique` ON `car_features` (`name`);--> statement-breakpoint
ALTER TABLE `car_fuel_types` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `car_images` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `car_models` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `car_transmission_types` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;