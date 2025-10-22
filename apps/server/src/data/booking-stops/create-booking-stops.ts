import type { DB } from "@/db";
import { bookingStops } from "@/db/sqlite/schema/bookings/booking-stops";
import type { InsertBookingStop } from "@/types";
import { eq } from "drizzle-orm";

export type CreateBookingStopData = InsertBookingStop;

export async function createBookingStops(db: DB, stops: CreateBookingStopData[]) {
	if (stops.length === 0) {
		return [];
	}

	// Sort stops by order to ensure proper sequence
	const sortedStops = stops.sort((a, b) => a.stopOrder - b.stopOrder);

	// Prepare insert data
	const insertData: InsertBookingStop[] = sortedStops.map(stop => ({
		bookingId: stop.bookingId,
		stopOrder: stop.stopOrder,
		address: stop.address,
		latitude: stop.latitude,
		longitude: stop.longitude,
		waitingTime: stop.waitingTime || 0,
		notes: stop.notes,
	}));

	// Insert all stops
	const createdStops = await db.insert(bookingStops).values(insertData).returning();

	return createdStops;
}


