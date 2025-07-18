import {
	InsertBookingSchema,
	UpdateBookingSchema,
} from "@/schemas/shared/tables/booking";
import { createBookingService } from "@/services/bookings/create-booking";
import { deleteBookingService } from "@/services/bookings/delete-booking";
import { getBookingService } from "@/services/bookings/get-booking";
import { getBookingsService } from "@/services/bookings/get-bookings";
import { updateBookingService } from "@/services/bookings/update-booking";
import { protectedProcedure, router } from "@/trpc/init";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const bookingsRouter = router({
	create: protectedProcedure
		.input(InsertBookingSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newBooking = await createBookingService(db, input);
			return newBooking;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedBooking = await deleteBookingService(db, input);
			return deletedBooking;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const booking = await getBookingService(db, input);
			return booking;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const bookings = await getBookingsService(db, input);
			return bookings;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateBookingSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedBooking = await updateBookingService(
				db,
				input.id,
				input.data,
			);
			return updatedBooking;
		}),
});

