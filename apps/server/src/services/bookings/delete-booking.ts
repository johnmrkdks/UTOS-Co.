import { deleteBooking } from "@/data/bookings/delete-booking";
import { getBookingById } from "@/data/bookings/get-booking-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import z from "zod";

export const DeleteBookingServiceSchema = z.object({
	id: z.string()
});

export async function deleteBookingService(db: DB, { id }: z.infer<typeof DeleteBookingServiceSchema>) {
	const booking = await getBookingById(db, id);

	if (!booking) {
		throw ErrorFactory.notFound("Booking not found.");
	}

	const deletedBooking = await deleteBooking(db, id);
	return deletedBooking;
}
