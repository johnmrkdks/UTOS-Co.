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
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const bookingsRouter = router({
	create: protectedProcedure
		.input(InsertBookingSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newBooking = await createBookingService(db, input);
				return newBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedBooking = await deleteBookingService(db, input.id);
				return deletedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const booking = await getBookingService(db, input.id);
				return booking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const bookings = await getBookingsService(db, input);
				return bookings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateBookingSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedBooking = await updateBookingService(
					db,
					input,
				);
				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

