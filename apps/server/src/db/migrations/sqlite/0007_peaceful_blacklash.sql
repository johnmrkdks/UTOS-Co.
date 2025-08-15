DROP INDEX `name_idx`;--> statement-breakpoint
ALTER TABLE `packages` ADD `is_published` integer DEFAULT false;--> statement-breakpoint
CREATE INDEX `packages_name_idx` ON `packages` (`name`);--> statement-breakpoint
CREATE INDEX `packages_published_availability_idx` ON `packages` (`is_published`,`is_available`);--> statement-breakpoint
ALTER TABLE `cars` ADD `is_published` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `cars_published_availability_idx` ON `cars` (`is_published`,`is_active`,`is_available`);