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
import { OffloadBookingDetailsSchema } from "./offload-booking-details";
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
	offloadDetails: OffloadBookingDetailsSchema.optional(),
});
export const InsertBookingSchema = createInsertSchema(bookings, {
	status: z.nativeEnum(BookingStatusEnum),
});
export const UpdateBookingSchema = createUpdateSchema(bookings, {
	status: z.nativeEnum(BookingStatusEnum).optional(),
	// Accept both Date objects and ISO string for scheduledPickupTime
	scheduledPickupTime: z.union([z.date(), z.string().datetime()]).optional(),
	// Accept both Date objects and ISO string for timestamp fields
	driverAssignedAt: z.union([z.date(), z.string().datetime()]).optional(),
	actualPickupTime: z.union([z.date(), z.string().datetime()]).optional(),
	actualDropoffTime: z.union([z.date(), z.string().datetime()]).optional(),
	confirmedAt: z.union([z.date(), z.string().datetime()]).optional(),
	driverEnRouteAt: z.union([z.date(), z.string().datetime()]).optional(),
	serviceStartedAt: z.union([z.date(), z.string().datetime()]).optional(),
	serviceCompletedAt: z.union([z.date(), z.string().datetime()]).optional(),
	createdAt: z.union([z.date(), z.string().datetime()]).optional(),
	updatedAt: z.union([z.date(), z.string().datetime()]).optional(),
}).partial();

export type Booking = z.infer<typeof BookingSchema>;
export type InsertBooking = z.infer<typeof InsertBookingSchema>;
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;
