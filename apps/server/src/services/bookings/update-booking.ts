import { updateBooking } from "@/data/bookings/update-booking";
import type { DB } from "@/db";
import type { UpdateBooking } from "@/schemas/shared/tables/booking";

export async function updateBookingService(db: DB, id: string, data: UpdateBooking) {
	const updatedBooking = await updateBooking(db, id, data);

	return updatedBooking;
}
