import { getBooking } from "@/data/bookings/get-booking";
import type { DB } from "@/db";

export async function getBookingService(db: DB, id: string) {
	const booking = await getBooking(db, id);
	return booking;
}
