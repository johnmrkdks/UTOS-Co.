-- Remove base_fare column from cars table
-- SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- Create a backup of the cars table
CREATE TABLE cars_backup AS SELECT * FROM cars;

-- Drop the original table
DROP TABLE cars;

-- Recreate the cars table without base_fare column
-- (This should match the current schema in cars.ts)
CREATE TABLE "cars" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"license_plate" text NOT NULL UNIQUE,
	"vin_number" text,
	"model_id" text NOT NULL,
	"body_type_id" text NOT NULL,
	"fuel_type_id" text NOT NULL,
	"transmission_type_id" text NOT NULL,
	"drive_type_id" text NOT NULL,
	"condition_type_id" text NOT NULL,
	"category_id" text NOT NULL,
	"color" text NOT NULL,
	"engine_size" integer NOT NULL,
	"doors" integer NOT NULL,
	"cylinders" integer NOT NULL,
	"mileage" integer NOT NULL,
	"seating_capacity" integer DEFAULT 4 NOT NULL,
	"luggage_capacity" text,
	"available_for_packages" integer DEFAULT true NOT NULL,
	"available_for_custom" integer DEFAULT true NOT NULL,
	"current_latitude" real,
	"current_longitude" real,
	"last_location_update" integer,
	"insurance_expiry" integer,
	"registration_expiry" integer,
	"last_service_date" integer,
	"next_service_due" integer,
	"is_active" integer DEFAULT true NOT NULL,
	"is_available" integer DEFAULT true NOT NULL,
	"is_published" integer DEFAULT false NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" integer DEFAULT (unixepoch()) NOT NULL,
	"updated_at" integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY ("model_id") REFERENCES "car_models"("id") ON DELETE restrict,
	FOREIGN KEY ("body_type_id") REFERENCES "car_body_types"("id") ON DELETE restrict,
	FOREIGN KEY ("fuel_type_id") REFERENCES "car_fuel_types"("id") ON DELETE restrict,
	FOREIGN KEY ("transmission_type_id") REFERENCES "car_transmission_types"("id") ON DELETE restrict,
	FOREIGN KEY ("drive_type_id") REFERENCES "car_drive_types"("id") ON DELETE restrict,
	FOREIGN KEY ("condition_type_id") REFERENCES "car_condition_types"("id") ON DELETE restrict,
	FOREIGN KEY ("category_id") REFERENCES "car_categories"("id") ON DELETE restrict
);

-- Restore data from backup (excluding base_fare column)
INSERT INTO cars (
	id, name, description, license_plate, vin_number,
	model_id, body_type_id, fuel_type_id, transmission_type_id, drive_type_id,
	condition_type_id, category_id, color, engine_size, doors, cylinders, mileage,
	seating_capacity, luggage_capacity, available_for_packages, available_for_custom,
	current_latitude, current_longitude, last_location_update,
	insurance_expiry, registration_expiry, last_service_date, next_service_due,
	is_active, is_available, is_published, status, created_at, updated_at
)
SELECT 
	id, name, description, license_plate, vin_number,
	model_id, body_type_id, fuel_type_id, transmission_type_id, drive_type_id,
	condition_type_id, category_id, color, engine_size, doors, cylinders, mileage,
	seating_capacity, luggage_capacity, available_for_packages, available_for_custom,
	current_latitude, current_longitude, last_location_update,
	insurance_expiry, registration_expiry, last_service_date, next_service_due,
	is_active, is_available, is_published, status, created_at, updated_at
FROM cars_backup;

-- Recreate indexes
CREATE INDEX "cars_availability_idx" ON "cars" ("is_available","is_active");
CREATE INDEX "cars_published_availability_idx" ON "cars" ("is_published","is_active","is_available");
CREATE INDEX "cars_category_idx" ON "cars" ("category_id");
CREATE INDEX "cars_status_idx" ON "cars" ("status");
CREATE INDEX "cars_location_idx" ON "cars" ("current_latitude","current_longitude");
CREATE INDEX "cars_license_plate_idx" ON "cars" ("license_plate");

-- Clean up backup table
DROP TABLE cars_backup;