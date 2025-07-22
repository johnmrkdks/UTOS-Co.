import { createBooking } from "@/data/bookings/create-booking";
import type { DB } from "@/db";
import { InsertBookingSchema, type Booking, type InsertBooking } from "@/schemas/shared";
import { z } from "zod";

export const CreateBookingServiceSchema = z.object({
	data: InsertBookingSchema,
});

export async function createBookingService(db: DB, { data }: z.infer<typeof CreateBookingServiceSchema>) {
	const newBooking = createBooking(db, data);

	return newBooking;
}
