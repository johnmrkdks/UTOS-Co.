CREATE TABLE `cars_to_features` (
	`car_id` text NOT NULL,
	`feature_id` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`feature_id`) REFERENCES `car_features`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_car_categories`("id", "name", "description", "price_multiplier", "display_order", "color", "icon", "min_seating_capacity", "max_seating_capacity", "is_active", "created_at", "updated_at") SELECT "id", "name", "description", "price_multiplier", "display_order", "color", "icon", "min_seating_capacity", "max_seating_capacity", "is_active", "created_at", "updated_at" FROM `car_categories`;--> statement-breakpoint
DROP TABLE `car_categories`;--> statement-breakpoint
ALTER TABLE `__new_car_categories` RENAME TO `car_categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `car_categories_name_idx` ON `car_categories` (`name`);--> statement-breakpoint
CREATE INDEX `car_categories_order_idx` ON `car_categories` (`display_order`);--> statement-breakpoint
ALTER TABLE `packages` ADD `banner_image_url` text;