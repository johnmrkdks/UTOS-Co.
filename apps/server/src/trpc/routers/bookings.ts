import {
	InsertBookingSchema,
	UpdateBookingSchema,
} from "@/schemas/shared/tables/booking";
import { createBookingService, CreateBookingServiceSchema } from "@/services/bookings/create-booking";
import { createPackageBookingService, CreatePackageBookingSchema } from "@/services/bookings/create-package-booking";
import { createCustomBookingService, CreateCustomBookingSchema } from "@/services/bookings/create-custom-booking";
import { createCustomBookingFromQuoteService, CreateCustomBookingFromQuoteSchema } from "@/services/bookings/create-custom-booking-from-quote";
import { calculateInstantQuoteService, CalculateInstantQuoteSchema } from "@/services/bookings/calculate-instant-quote";
import { updateBookingStatusService, UpdateBookingStatusSchema, assignDriverService, AssignDriverSchema } from "@/services/bookings/update-booking-status";
import { DeleteBookingServiceSchema, deleteBookingService } from "@/services/bookings/delete-booking";
import { GetBookingServiceSchema, getBookingService } from "@/services/bookings/get-booking";
import { getBookingsService } from "@/services/bookings/get-bookings";
import { updateBookingService, UpdateBookingServiceSchema } from "@/services/bookings/update-booking";
import { protectedProcedure, router, publicProcedure, guestProcedure } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { z } from "zod";

export const bookingsRouter = router({
	create: protectedProcedure
		.input(CreateBookingServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newBooking = await createBookingService(db, input);
				return newBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteBookingServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedBooking = await deleteBookingService(db, input);
				return deletedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetBookingServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const booking = await getBookingService(db, input);
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
		.input(UpdateBookingServiceSchema)
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

	// Package booking procedures (allow guest users)
	createPackageBooking: guestProcedure
		.input(CreatePackageBookingSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				// Use session.user for authenticated users, or session data for anonymous users
				const userId = session.user?.id || session.id;
				const newBooking = await createPackageBookingService(db, { ...input, userId });
				return newBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Custom booking procedures (allow guest users)
	createCustomBooking: guestProcedure
		.input(CreateCustomBookingSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				// Use session.user for authenticated users, or session data for anonymous users
				const userId = session.user?.id || session.id;
				const newBooking = await createCustomBookingService(db, { ...input, userId });
				return newBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Create custom booking from instant quote (allow guest users)
	createCustomBookingFromQuote: guestProcedure
		.input(CreateCustomBookingFromQuoteSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				// Use session.user for authenticated users, or session data for anonymous users
				const userId = session.user?.id || session.id;
				const newBooking = await createCustomBookingFromQuoteService(db, { ...input, userId });
				return newBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Instant quote calculation (can be public for quote generation)
	calculateInstantQuote: publicProcedure
		.input(CalculateInstantQuoteSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const quote = await calculateInstantQuoteService(db, input);
				return quote;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Booking status management
	updateStatus: protectedProcedure
		.input(UpdateBookingStatusSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedBooking = await updateBookingStatusService(db, input);
				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Driver assignment
	assignDriver: protectedProcedure
		.input(AssignDriverSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedBooking = await assignDriverService(db, input);
				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get bookings by type
	listByType: protectedProcedure
		.input(ResourceListSchema.extend({
			bookingType: z.enum(["package", "custom"]).optional(),
		}))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const bookings = await getBookingsService(db, input);
				return bookings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get user's bookings
	getUserBookings: protectedProcedure
		.input(ResourceListSchema.extend({
			userId: z.string().optional(),
		}))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const bookings = await getBookingsService(db, input);
				return bookings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get driver's bookings
	getDriverBookings: protectedProcedure
		.input(ResourceListSchema.extend({
			driverId: z.string().optional(),
		}))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const bookings = await getBookingsService(db, input);
				return bookings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

