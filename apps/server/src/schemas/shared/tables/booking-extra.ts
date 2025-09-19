import { bookingExtras } from "@/db/sqlite/schema/bookings/booking-extras";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const BookingExtraSchema = createSelectSchema(bookingExtras, {
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
});

export const InsertBookingExtraSchema = createInsertSchema(bookingExtras);
export const UpdateBookingExtraSchema = createUpdateSchema(bookingExtras);

export type BookingExtra = z.infer<typeof BookingExtraSchema>;
export type InsertBookingExtra = z.infer<typeof InsertBookingExtraSchema>;
export type UpdateBookingExtra = z.infer<typeof UpdateBookingExtraSchema>;