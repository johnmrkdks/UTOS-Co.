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
import { BookingExtraSchema } from "./booking-extra";
import { BookingStopSchema } from "./booking-stop";
import { BookingStatusEnum } from "@/db/sqlite/enums";

export const BookingSchema = createSelectSchema(bookings, {
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
}).extend({
	car: CarSchema.optional(),
	user: UserSchema.optional(),
	package: PackageSchema.optional(),
	extras: z.array(BookingExtraSchema).optional(),
	stops: z.array(BookingStopSchema).optional(),
});
export const InsertBookingSchema = createInsertSchema(bookings, {
	status: z.nativeEnum(BookingStatusEnum),
});
export const UpdateBookingSchema = createUpdateSchema(bookings, {
	status: z.nativeEnum(BookingStatusEnum).optional(),
});

export type Booking = z.infer<typeof BookingSchema>;
export type InsertBooking = z.infer<typeof InsertBookingSchema>;
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;
