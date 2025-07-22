import { getBookingById } from "@/data/bookings/get-booking-by-id";
import { updateBooking } from "@/data/bookings/update-booking";
import type { DB } from "@/db";
import type { UpdateBooking } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

type UpdateBookingParams = {
	id: string;
	data: UpdateBooking;
};

export async function updateBookingService(db: DB, { id, data }: UpdateBookingParams) {
	const booking = await getBookingById(db, id);

	if (!booking) {
		throw ErrorFactory.notFound("Booking not found.");
	}

	const updatedBooking = await updateBooking(db, { id, data });

	return updatedBooking;
}
