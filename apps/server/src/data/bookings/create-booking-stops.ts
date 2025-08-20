import type { DB } from "@/db";
import { bookingStops } from "@/db/sqlite/schema/bookings/booking-stops";
import { eq } from "drizzle-orm";

type InsertBookingStop = typeof bookingStops.$inferInsert;

export interface CreateBookingStopData {
	bookingId: string;
	stopOrder: number;
	address: string;
	latitude?: number;
	longitude?: number;
	waitingTime?: number;
	notes?: string;
}

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

export async function getBookingStops(db: DB, bookingId: string) {
	const stops = await db
		.select()
		.from(bookingStops)
		.where(eq(bookingStops.bookingId, bookingId))
		.orderBy(bookingStops.stopOrder);
	
	return stops;
}

export async function deleteBookingStops(db: DB, bookingId: string) {
	const deletedStops = await db
		.delete(bookingStops)
		.where(eq(bookingStops.bookingId, bookingId))
		.returning();
	
	return deletedStops;
}