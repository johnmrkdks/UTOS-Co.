import { createBooking } from "@/data/bookings/create-booking";
import type { DB } from "@/db";
import type { Booking, InsertBooking } from "@/schemas/shared";

export async function createBookingService(db: DB, data: InsertBooking): Promise<Booking> {
	const newBooking = createBooking(db, data);

	return newBooking;
}
