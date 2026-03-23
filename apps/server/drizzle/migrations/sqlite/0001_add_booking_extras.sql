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