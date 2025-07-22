import { getBookingById } from "@/data/bookings/get-booking-by-id";
import { updateBooking } from "@/data/bookings/update-booking";
import type { DB } from "@/db";
import { UpdateBookingSchema, type UpdateBooking } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import z from "zod";

export const UpdateBookingServiceSchema = z.object({
	id: z.string(),
	data: UpdateBookingSchema,
});

export async function updateBookingService(db: DB, { id, data }: z.infer<typeof UpdateBookingServiceSchema>) {
	const booking = await getBookingById(db, id);

	if (!booking) {
		throw ErrorFactory.notFound("Booking not found.");
	}

	const updatedBooking = await updateBooking(db, { id, data });

	return updatedBooking;
}
