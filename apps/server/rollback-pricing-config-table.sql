-- Rollback script: Revert pricing_configs back to pricing_config
-- Use this only if the migration fails and you need to revert

-- Step 1: Create the old table structure
CREATE TABLE "pricing_config" (
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

-- Step 2: Copy data back
INSERT INTO "pricing_config" SELECT * FROM "pricing_configs";

-- Step 3: Recreate old indexes
CREATE INDEX "pricing_config_car_id_idx" ON "pricing_config" ("car_id");
CREATE INDEX "pricing_config_car_active_idx" ON "pricing_config" ("car_id", "is_active");

-- Step 4: Drop the new table
DROP TABLE "pricing_configs";