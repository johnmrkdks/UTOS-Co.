import { bookings } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { CarSchema } from "./car";
import { UserSchema } from "./user";
import { PackageSchema } from "./package";
import { BookingStatusEnum } from "@/db/sqlite/enums";

export const BookingSchema = createSelectSchema(bookings).extend({
	car: CarSchema.optional(),
	user: UserSchema.optional(),
	package: PackageSchema.optional(),
});
export const InsertBookingSchema = createInsertSchema(bookings);
export const UpdateBookingSchema = createUpdateSchema(bookings, {
	status: z.nativeEnum(BookingStatusEnum),
});

export type Booking = z.infer<typeof BookingSchema>;
export type InsertBooking = z.infer<typeof InsertBookingSchema>;
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;
