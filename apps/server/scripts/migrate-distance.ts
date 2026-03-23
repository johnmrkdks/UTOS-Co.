/**
 * Distance Migration Script - Simple & Clean
 *
 * Converts distance from INTEGER (meters) to REAL (kilometers)
 *
 * Usage: bun scripts/migrate-distance.ts
 */

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import * as schema from "../src/db/sqlite/schema";
import { bookings } from "../src/db/sqlite/schema";

async function migrate() {
	console.log("🚀 Starting distance migration...\n");

	// Connect to local database
	const dbPath = process.env.LOCAL_DB_PATH || ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite";
	const client = createClient({ url: `file:${dbPath}` });
	const db = drizzle(client, { schema });

	try {
		// Get bookings with only the fields we need
		const allBookings = await db.select({
			id: bookings.id,
			estimatedDistance: bookings.estimatedDistance,
			actualDistance: bookings.actualDistance,
		}).from(bookings);

		console.log(`Found ${allBookings.length} bookings\n`);

		// Show sample before
		const sampleBefore = allBookings.slice(0, 3).filter(b => b.estimatedDistance);
		if (sampleBefore.length > 0) {
			console.log("Sample BEFORE (meters):");
			sampleBefore.forEach(b => {
				console.log(`  ${b.id.slice(0, 8)}... → ${b.estimatedDistance}m`);
			});
			console.log("");
		}

		// Update each booking: meters → kilometers
		await Promise.all(
			allBookings.map(async (booking) => {
				await db.update(bookings)
					.set({
						estimatedDistance: booking.estimatedDistance
							? booking.estimatedDistance / 1000
							: null,
						actualDistance: booking.actualDistance
							? booking.actualDistance / 1000
							: null,
					})
					.where(sql`${bookings.id} = ${booking.id}`)
			})
		);

		console.log("✅ Distances converted\n");

		// Verify
		const updated = await db.select({
			id: bookings.id,
			estimatedDistance: bookings.estimatedDistance,
			actualDistance: bookings.actualDistance,
		}).from(bookings);

		const sampleAfter = updated.slice(0, 3).filter(b => b.estimatedDistance);

		if (sampleAfter.length > 0) {
			console.log("Sample AFTER (kilometers):");
			sampleAfter.forEach(b => {
				console.log(`  ${b.id.slice(0, 8)}... → ${b.estimatedDistance}km`);
			});
			console.log("");
		}

		console.log("🎉 Migration complete!\n");

	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	} finally {
		client.close();
	}
}

migrate();
