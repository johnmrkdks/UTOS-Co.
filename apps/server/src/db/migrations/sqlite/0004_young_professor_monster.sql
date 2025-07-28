PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_car_features` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_car_features`("id", "name", "created_at") SELECT "id", "name", "created_at" FROM `car_features`;--> statement-breakpoint
DROP TABLE `car_features`;--> statement-breakpoint
ALTER TABLE `__new_car_features` RENAME TO `car_features`;--> statement-breakpoint
PRAGMA foreign_keys=ON;