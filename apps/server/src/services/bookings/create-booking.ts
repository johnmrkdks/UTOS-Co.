import { createBooking } from "@/data/bookings/create-booking";
import type { DB } from "@/db";
import { InsertBookingSchema, type Booking, type InsertBooking } from "@/schemas/shared";
import { z } from "zod";

export const CreateBookingServiceSchema = InsertBookingSchema

export type CreateBookingParams = z.infer<typeof CreateBookingServiceSchema>

export async function createBookingService(db: DB, data: CreateBookingParams) {
	const newBooking = createBooking(db, data);

	return newBooking;
}
