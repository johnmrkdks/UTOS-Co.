import { deleteBooking } from "@/data/bookings/delete-booking";
import { getBookingById } from "@/data/bookings/get-booking-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function deleteBookingService(db: DB, id: string) {
	const booking = await getBookingById(db, id);

	if (!booking) {
		throw ErrorFactory.notFound("Booking not found.");
	}

	const deletedBooking = await deleteBooking(db, id);
	return deletedBooking;
}
