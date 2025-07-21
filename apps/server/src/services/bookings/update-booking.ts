import { updateBooking } from "@/data/bookings/update-booking";
import type { DB } from "@/db";
import type { UpdateBooking } from "@/schemas/shared";

type UpdateBookingParams = {
	id: string;
	data: UpdateBooking;
};

export async function updateBookingService(db: DB, { id, data }: UpdateBookingParams) {
	const updatedBooking = await updateBooking(db, { id, data });

	return updatedBooking;
}
