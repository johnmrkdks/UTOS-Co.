/**
 * Migration Script: Convert Distance from Integer (meters) to Real (kilometers)
 *
 * This script:
 * 1. Creates a new bookings table with REAL distance fields
 * 2. Copies all data, converting meters to kilometers
 * 3. Drops old table and renames new one
 *
 * Run with: pnpm tsx scripts/migrate-distance-to-decimal.ts
 */

import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";

// Get database binding from environment
const db = drizzle((globalThis as any).DB);

async function migrateDistanceToDecimal() {
	console.log("🚀 Starting distance migration (integer → decimal)...\n");

	try {
		// Step 1: Create new table with REAL distance fields
		console.log("📋 Step 1: Creating new bookings table with REAL distance fields...");
		await db.run(sql`
			CREATE TABLE bookings_new (
				id TEXT PRIMARY KEY NOT NULL,
				reference_number TEXT,
				booking_type TEXT DEFAULT 'custom' NOT NULL,
				car_id TEXT,
				user_id TEXT NOT NULL,
				driver_id TEXT,
				package_id TEXT,
				driver_assigned_at INTEGER,
				origin_address TEXT NOT NULL,
				origin_latitude REAL,
				origin_longitude REAL,
				destination_address TEXT NOT NULL,
				destination_latitude REAL,
				destination_longitude REAL,
				scheduled_pickup_time INTEGER NOT NULL,
				timezone TEXT,
				estimated_duration INTEGER,
				actual_pickup_time INTEGER,
				actual_dropoff_time INTEGER,
				estimated_distance REAL,
				actual_distance REAL,
				quoted_amount REAL NOT NULL,
				final_amount REAL,
				base_fare REAL,
				distance_fare REAL,
				time_fare REAL,
				extra_charges REAL DEFAULT 0,
				customer_name TEXT NOT NULL,
				customer_phone TEXT NOT NULL,
				customer_email TEXT,
				passenger_count INTEGER DEFAULT 1 NOT NULL,
				luggage_count INTEGER DEFAULT 0,
				special_requests TEXT,
				additional_notes TEXT,
				status TEXT DEFAULT 'pending' NOT NULL,
				is_archived INTEGER,
				confirmed_at INTEGER,
				driver_en_route_at INTEGER,
				service_started_at INTEGER,
				service_completed_at INTEGER,
				created_at INTEGER DEFAULT (unixepoch()),
				updated_at INTEGER DEFAULT (unixepoch()),
				FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE NO ACTION ON DELETE CASCADE,
				FOREIGN KEY (car_id) REFERENCES cars(id) ON UPDATE NO ACTION ON DELETE SET NULL,
				FOREIGN KEY (driver_id) REFERENCES drivers(id) ON UPDATE NO ACTION ON DELETE SET NULL,
				FOREIGN KEY (package_id) REFERENCES packages(id) ON UPDATE NO ACTION ON DELETE SET NULL
			)
		`);
		console.log("✅ New table created\n");

		// Step 2: Count existing bookings
		const countResult = await db.run(sql`SELECT COUNT(*) as count FROM bookings`);
		const bookingCount = (countResult.results[0] as any)?.count || 0;
		console.log(`📊 Found ${bookingCount} bookings to migrate\n`);

		// Step 3: Copy data with distance conversion
		console.log("📦 Step 2: Copying data and converting distances (meters → kilometers)...");
		await db.run(sql`
			INSERT INTO bookings_new
			SELECT
				id,
				reference_number,
				booking_type,
				car_id,
				user_id,
				driver_id,
				package_id,
				driver_assigned_at,
				origin_address,
				origin_latitude,
				origin_longitude,
				destination_address,
				destination_latitude,
				destination_longitude,
				scheduled_pickup_time,
				timezone,
				estimated_duration,
				actual_pickup_time,
				actual_dropoff_time,
				CASE
					WHEN estimated_distance IS NOT NULL THEN CAST(estimated_distance AS REAL) / 1000.0
					ELSE NULL
				END as estimated_distance,
				CASE
					WHEN actual_distance IS NOT NULL THEN CAST(actual_distance AS REAL) / 1000.0
					ELSE NULL
				END as actual_distance,
				quoted_amount,
				final_amount,
				base_fare,
				distance_fare,
				time_fare,
				extra_charges,
				customer_name,
				customer_phone,
				customer_email,
				passenger_count,
				luggage_count,
				special_requests,
				additional_notes,
				status,
				is_archived,
				confirmed_at,
				driver_en_route_at,
				service_started_at,
				service_completed_at,
				created_at,
				updated_at
			FROM bookings
		`);
		console.log("✅ Data copied and converted\n");

		// Step 4: Verify data
		console.log("🔍 Step 3: Verifying converted data...");
		const sampleResult = await db.run(sql`
			SELECT id, estimated_distance, actual_distance
			FROM bookings_new
			WHERE estimated_distance IS NOT NULL
			LIMIT 3
		`);

		if (sampleResult.results.length > 0) {
			console.log("Sample converted data:");
			sampleResult.results.forEach((row: any) => {
				console.log(`  - ID: ${row.id.slice(0, 8)}... | Estimated: ${row.estimated_distance} km | Actual: ${row.actual_distance || 'N/A'} km`);
			});
			console.log("✅ Data verified\n");
		}

		// Step 5: Drop old table
		console.log("🗑️  Step 4: Dropping old bookings table...");
		await db.run(sql`DROP TABLE bookings`);
		console.log("✅ Old table dropped\n");

		// Step 6: Rename new table
		console.log("📝 Step 5: Renaming new table to 'bookings'...");
		await db.run(sql`ALTER TABLE bookings_new RENAME TO bookings`);
		console.log("✅ Table renamed\n");

		// Step 7: Final verification
		const finalCount = await db.run(sql`SELECT COUNT(*) as count FROM bookings`);
		const finalBookingCount = (finalCount.results[0] as any)?.count || 0;

		console.log("🎉 Migration completed successfully!\n");
		console.log("📊 Summary:");
		console.log(`  - Bookings migrated: ${bookingCount}`);
		console.log(`  - Final count: ${finalBookingCount}`);
		console.log(`  - Distance format: INTEGER (meters) → REAL (kilometers)`);
		console.log(`  - Example: 15500 → 15.5 km\n`);

	} catch (error) {
		console.error("❌ Migration failed:", error);
		console.error("\n⚠️  Database may be in inconsistent state. Please restore from backup.\n");
		throw error;
	}
}

// Run migration
migrateDistanceToDecimal()
	.then(() => {
		console.log("✨ All done!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Fatal error:", error);
		process.exit(1);
	});
