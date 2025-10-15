/**
 * Run Distance Migration Script
 *
 * Executes the 0005 migration to convert distance from integer to real
 *
 * Usage:
 *   pnpm tsx scripts/run-distance-migration.ts
 */

// @ts-nocheck - Migration script, better-sqlite3 is a dev-only dependency
import { drizzle } from "drizzle-orm/d1";
import Database from "better-sqlite3";
import { sql } from "drizzle-orm";
import path from "node:path";
import fs from "node:fs";

async function runMigration() {
	console.log("🚀 Distance Migration Script\n");

	// Read local database path from env
	const dbPath = process.env.LOCAL_DB_PATH || ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite";
	const fullPath = path.join(process.cwd(), dbPath);

	console.log(`📁 Database: ${fullPath}\n`);

	if (!fs.existsSync(fullPath)) {
		console.error("❌ Database file not found!");
		console.error(`   Expected at: ${fullPath}`);
		console.error("\n💡 Make sure to run 'pnpm dev:server' first to create the database.\n");
		process.exit(1);
	}

	// Open SQLite database
	const sqlite = new Database(fullPath);
	const db = drizzle(sqlite as any);

	console.log("🔍 Checking current schema...\n");

	// Check current distance field types
	const tableInfo = sqlite.prepare("PRAGMA table_info(bookings)").all() as any[];
	const estimatedDistanceField = tableInfo.find((col: any) => col.name === "estimated_distance");
	const actualDistanceField = tableInfo.find((col: any) => col.name === "actual_distance");

	if (!estimatedDistanceField) {
		console.error("❌ bookings table not found or missing estimated_distance column");
		process.exit(1);
	}

	console.log(`Current estimated_distance type: ${estimatedDistanceField.type}`);
	console.log(`Current actual_distance type: ${actualDistanceField.type}\n`);

	if (estimatedDistanceField.type === "REAL" || estimatedDistanceField.type === "real") {
		console.log("✅ Distance fields are already REAL type. Migration may have already been applied.\n");
		console.log("Do you want to continue anyway? (This will recreate the table)");
		console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...\n");
		await new Promise((resolve) => setTimeout(resolve, 5000));
	}

	try {
		// Count existing bookings
		const countResult = sqlite.prepare("SELECT COUNT(*) as count FROM bookings").get() as any;
		const bookingCount = countResult?.count || 0;

		console.log(`📊 Found ${bookingCount} bookings to migrate\n`);

		if (bookingCount > 0) {
			// Show sample data before migration
			const sampleBefore = sqlite.prepare(`
				SELECT id, estimated_distance, actual_distance
				FROM bookings
				WHERE estimated_distance IS NOT NULL
				LIMIT 3
			`).all() as any[];

			console.log("📋 Sample data BEFORE migration:");
			sampleBefore.forEach((row: any) => {
				console.log(`  - ID: ${row.id.slice(0, 8)}... | Estimated: ${row.estimated_distance} | Actual: ${row.actual_distance || "N/A"}`);
			});
			console.log("");
		}

		console.log("🔄 Starting migration...\n");

		// Execute migration
		console.log("Step 1/5: Creating new table with REAL fields...");
		sqlite.exec(`
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

		console.log("Step 2/5: Copying and converting data...");
		sqlite.exec(`
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

		if (bookingCount > 0) {
			// Show sample data after conversion
			const sampleAfter = sqlite.prepare(`
				SELECT id, estimated_distance, actual_distance
				FROM bookings_new
				WHERE estimated_distance IS NOT NULL
				LIMIT 3
			`).all() as any[];

			console.log("📋 Sample data AFTER migration:");
			sampleAfter.forEach((row: any) => {
				console.log(`  - ID: ${row.id.slice(0, 8)}... | Estimated: ${row.estimated_distance} km | Actual: ${row.actual_distance || "N/A"} km`);
			});
			console.log("");
		}

		console.log("Step 3/5: Dropping old table...");
		sqlite.exec("DROP TABLE bookings");
		console.log("✅ Old table dropped\n");

		console.log("Step 4/5: Renaming new table...");
		sqlite.exec("ALTER TABLE bookings_new RENAME TO bookings");
		console.log("✅ Table renamed\n");

		console.log("Step 5/5: Verifying migration...");
		const finalCount = sqlite.prepare("SELECT COUNT(*) as count FROM bookings").get() as any;
		const finalTableInfo = sqlite.prepare("PRAGMA table_info(bookings)").all() as any[];
		const finalEstimatedField = finalTableInfo.find((col: any) => col.name === "estimated_distance");

		console.log(`✅ Verification complete\n`);

		console.log("🎉 Migration completed successfully!\n");
		console.log("📊 Summary:");
		console.log(`  - Bookings migrated: ${bookingCount}`);
		console.log(`  - Final count: ${finalCount.count}`);
		console.log(`  - Distance field type: ${finalEstimatedField.type}`);
		console.log(`  - Format: INTEGER (meters) → REAL (kilometers)`);
		console.log(`  - Example: 15500 → 15.5 km\n`);

		sqlite.close();
		console.log("✨ Migration complete!\n");

	} catch (error) {
		console.error("\n❌ Migration failed:", error);
		console.error("\n⚠️  Database may be in inconsistent state.");
		console.error("💡 Restore from backup or delete .wrangler folder and restart.\n");
		sqlite.close();
		process.exit(1);
	}
}

runMigration()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Fatal error:", error);
		process.exit(1);
	});
