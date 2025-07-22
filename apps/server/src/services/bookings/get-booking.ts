import { getBookingById } from "@/data/bookings/get-booking-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import z from "zod";

export const GetBookingServiceSchema = z.object({
	id: z.string()
});

export async function getBookingService(db: DB, { id }: z.infer<typeof GetBookingServiceSchema>) {
	const booking = await getBookingById(db, id);

	if (!booking) {
		throw ErrorFactory.notFound("Booking not found.");
	}

	return booking;
}
