import { bookings } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const BookingSchema = createSelectSchema(bookings);
export const InsertBookingSchema = createInsertSchema(bookings);
export const UpdateBookingSchema = createUpdateSchema(bookings);

export type Booking = z.infer<typeof BookingSchema>;
export type InsertBooking = z.infer<typeof InsertBookingSchema>;
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;
