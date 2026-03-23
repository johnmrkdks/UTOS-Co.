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
