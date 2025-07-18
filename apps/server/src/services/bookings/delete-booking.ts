import { deleteBooking } from "@/data/bookings/delete-booking";
import type { DB } from "@/db";

export async function deleteBookingService(db: DB, id: string) {
	const deletedBooking = await deleteBooking(db, id);
	return deletedBooking;
}
