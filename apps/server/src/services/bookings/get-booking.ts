import z from "zod";
import { getBookingById } from "@/data/bookings/get-booking-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const GetBookingServiceSchema = z.object({
	id: z.string(),
});

export type GetBookingByIdParams = z.infer<typeof GetBookingServiceSchema>;

export async function getBookingService(db: DB, { id }: GetBookingByIdParams) {
	const booking = await getBookingById(db, id);

	if (!booking) {
		throw ErrorFactory.notFound("Booking not found.");
	}

	return booking;
}
