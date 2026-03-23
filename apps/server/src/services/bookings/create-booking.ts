import type { z } from "zod";
import { createBooking } from "@/data/bookings/create-booking";
import type { DB } from "@/db";
import {
	type Booking,
	type InsertBooking,
	InsertBookingSchema,
} from "@/schemas/shared";

export const CreateBookingServiceSchema = InsertBookingSchema;

export type CreateBookingParams = z.infer<typeof CreateBookingServiceSchema>;

export async function createBookingService(db: DB, data: CreateBookingParams) {
	const newBooking = createBooking(db, data);

	return newBooking;
}
