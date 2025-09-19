import { bookingStops } from "@/db/sqlite/schema/bookings/booking-stops";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const BookingStopSchema = createSelectSchema(bookingStops, {
	createdAt: z.union([z.date(), z.string()]),
});

export const InsertBookingStopSchema = createInsertSchema(bookingStops);
export const UpdateBookingStopSchema = createUpdateSchema(bookingStops);

export type BookingStop = z.infer<typeof BookingStopSchema>;
export type InsertBookingStop = z.infer<typeof InsertBookingStopSchema>;
export type UpdateBookingStop = z.infer<typeof UpdateBookingStopSchema>;