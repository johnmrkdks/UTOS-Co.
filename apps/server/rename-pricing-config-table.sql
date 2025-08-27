-- Rename pricing_config table to pricing_configs
-- This needs to be run manually in your D1 database

-- Step 1: Create the new table with updated name and indexes
CREATE TABLE "pricing_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"car_id" text,
	"base_fare" integer NOT NULL,
	"price_per_km" integer NOT NULL,
	"price_per_minute" integer,
	"first_km_rate" integer,
	"first_km_limit" integer DEFAULT 5,
	"peak_hour_multiplier" real DEFAULT 1.0,
	"night_multiplier" real DEFAULT 1.2,
	"weekend_multiplier" real DEFAULT 1.0,
	"waiting_charge_per_minute" integer DEFAULT 0,
	"stop_charge" integer DEFAULT 0,
	"cancellation_fee" integer DEFAULT 0,
	"peak_hour_start" text,
	"peak_hour_end" text,
	"night_hour_start" text,
	"night_hour_end" text,
	"car_type_id" text,
	"is_active" integer DEFAULT 1,
	"created_at" integer DEFAULT (unixepoch()),
	"updated_at" integer DEFAULT (unixepoch()),
	FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE cascade
);

-- Step 2: Copy all data from old table to new table
INSERT INTO "pricing_configs" SELECT * FROM "pricing_config";

-- Step 3: Create indexes for the new table
CREATE INDEX "pricing_configs_car_id_idx" ON "pricing_configs" ("car_id");
CREATE INDEX "pricing_configs_car_active_idx" ON "pricing_configs" ("car_id", "is_active");

-- Step 4: Drop the old table
DROP TABLE "pricing_config";

-- Verification: Check that data was copied correctly
-- SELECT COUNT(*) FROM "pricing_configs";