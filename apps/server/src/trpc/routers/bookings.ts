import {
	InsertBookingSchema,
	UpdateBookingSchema,
} from "@/schemas/shared/tables/booking";
import { bookings } from "@/db/sqlite/schema";
import { eq } from "drizzle-orm";
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
import { editBooking } from "@/services/bookings/edit-booking";
import { cancelBooking } from "@/services/bookings/cancel-booking";
import { validateBookingOperations } from "@/services/bookings/validate-booking-operations";
import { protectedProcedure, router, publicProcedure, guestProcedure } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { TRPCError } from "@trpc/server";
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
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				// Get user info from session
				const userId = session?.user?.id || session?.session?.userId;
				const userRole = session?.user?.role;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to delete bookings",
					});
				}
				
				// Get the booking first to check ownership
				const existingBooking = await getBookingService(db, input);
				
				if (!existingBooking) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Booking not found",
					});
				}
				
				// Apply role-based access control
				if (userRole === 'admin' || userRole === 'super_admin') {
					// Admins can delete any booking
				} else {
					// Regular users and drivers cannot delete bookings via this endpoint
					// They should use the cancelBooking endpoint instead
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only admins can delete bookings. Use cancelBooking to cancel your bookings.",
					});
				}
				
				const deletedBooking = await deleteBookingService(db, input);
				return deletedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetBookingServiceSchema)
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				// Get user info from session
				const userId = session?.user?.id || session?.session?.userId;
				const userRole = session?.user?.role;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to view bookings",
					});
				}
				
				const booking = await getBookingService(db, input);
				
				if (!booking) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Booking not found",
					});
				}
				
				// Apply role-based access control
				if (userRole === 'admin' || userRole === 'super_admin') {
					// Admins can see any booking
					return booking;
				} else if (userRole === 'driver') {
					// Drivers can only see bookings assigned to them
					const driverProfile = await db.query.drivers.findFirst({
						where: (drivers, { eq }) => eq(drivers.userId, userId),
					});

					if (!driverProfile) {
						throw new TRPCError({
							code: "FORBIDDEN", 
							message: "User is not registered as a driver",
						});
					}

					if (booking.driverId !== driverProfile.id) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You can only view your assigned bookings",
						});
					}
					
					return booking;
				} else {
					// Regular users (customers) can only see their own bookings
					if (booking.userId !== userId) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You can only view your own bookings",
						});
					}
					
					return booking;
				}
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				// Get user info from session
				const userId = session?.user?.id || session?.session?.userId;
				const userRole = session?.user?.role;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to view bookings",
					});
				}
				
				// Apply role-based filtering
				if (userRole === 'admin' || userRole === 'super_admin') {
					// Admins can see all bookings
					const bookings = await getBookingsService(db, input);
					return bookings;
				} else if (userRole === 'driver') {
					// Drivers can only see their assigned bookings
					const driverProfile = await db.query.drivers.findFirst({
						where: (drivers, { eq }) => eq(drivers.userId, userId),
					});

					if (!driverProfile) {
						throw new TRPCError({
							code: "FORBIDDEN", 
							message: "User is not registered as a driver",
						});
					}

					const bookings = await getBookingsService(db, {
						...input,
						filters: {
							...input.filters,
							driverId: driverProfile.id,
						},
					});
					return bookings;
				} else {
					// Regular users (customers) can only see their own bookings
					const bookings = await getBookingsService(db, {
						...input,
						filters: {
							...input.filters,
							userId: userId,
						},
					});
					return bookings;
				}
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateBookingServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				// Get user info from session
				const userId = session?.user?.id || session?.session?.userId;
				const userRole = session?.user?.role;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to update bookings",
					});
				}
				
				// Get the booking first to check ownership
				const existingBooking = await getBookingService(db, { id: input.id });
				
				if (!existingBooking) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Booking not found",
					});
				}
				
				// Apply role-based access control
				if (userRole === 'admin' || userRole === 'super_admin') {
					// Admins can update any booking
				} else {
					// Regular users and drivers cannot update bookings via this endpoint
					// They should use the specific editBooking endpoint which has proper validation
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only admins can use this update endpoint. Use editBooking for customer updates.",
					});
				}
				
				const updatedBooking = await updateBookingService(db, input);
				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Package booking procedures (require authentication)
	createPackageBooking: protectedProcedure
		.input(CreatePackageBookingSchema.omit({ userId: true }))
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				console.log("🔍 DEBUG createPackageBooking - START");
				console.log("📥 Input received:", JSON.stringify(input, null, 2));
				console.log("👤 Session object:", JSON.stringify(session, null, 2));
				
				// Better Auth anonymous plugin - check both user and session structures
				const userId = session?.user?.id || session?.session?.userId;
				console.log("🆔 Extracted userId:", userId);
				
				if (!userId) {
					console.error("❌ No userId found in session");
					throw new Error("User session is required. Please sign in or create a guest account.");
				}
				
				console.log("📅 Original scheduledPickupTime:", input.scheduledPickupTime, typeof input.scheduledPickupTime);
				
				// Convert scheduledPickupTime string to Date object and add userId
				const processedInput = {
					...input,
					scheduledPickupTime: new Date(input.scheduledPickupTime),
					userId
				};
				
				console.log("📝 Processed input:", JSON.stringify(processedInput, null, 2));
				console.log("🕐 Processed scheduledPickupTime:", processedInput.scheduledPickupTime, typeof processedInput.scheduledPickupTime);
				
				console.log("🏃‍♂️ Calling createPackageBookingService...");
				const newBooking = await createPackageBookingService(db, processedInput);
				console.log("✅ Service returned successfully:", newBooking?.id);
				
				return newBooking;
			} catch (error) {
				console.error("💥 ERROR in createPackageBooking:", error);
				console.error("📚 Error stack:", error instanceof Error ? error.stack : 'No stack trace');
				handleTRPCError(error);
			}
		}),

	// Custom booking procedures (allow guest users)
	createCustomBooking: guestProcedure
		.input(CreateCustomBookingSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				// Better Auth anonymous plugin - check both user and session structures
				const userId = session?.user?.id || session?.session?.userId;
				
				if (!userId) {
					throw new Error("User session is required. Please sign in or create a guest account.");
				}
				
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
				// Better Auth anonymous plugin - check both user and session structures
				const userId = session?.user?.id || session?.session?.userId;
				
				if (!userId) {
					console.log("🔍 Session structure:", JSON.stringify(session, null, 2));
					throw new Error("User session is required. Please sign in or create a guest account.");
				}
				
				console.log("🚀 Creating custom booking from quote for userId:", userId);
				const newBooking = await createCustomBookingFromQuoteService(db, { ...input, userId });
				console.log("✅ Custom booking created successfully:", newBooking.id);
				return newBooking;
			} catch (error) {
				console.error("❌ TRPC Error in createCustomBookingFromQuote:", {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					input: JSON.stringify(input, null, 2)
				});
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
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				// Get user info from session
				const userId = session?.user?.id || session?.session?.userId;
				const userRole = session?.user?.role;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to view bookings",
					});
				}
				
				// Apply role-based filtering
				if (userRole === 'admin' || userRole === 'super_admin') {
					// Admins can see all bookings
					const bookings = await getBookingsService(db, input);
					return bookings;
				} else if (userRole === 'driver') {
					// Drivers can only see their assigned bookings
					const driverProfile = await db.query.drivers.findFirst({
						where: (drivers, { eq }) => eq(drivers.userId, userId),
					});

					if (!driverProfile) {
						throw new TRPCError({
							code: "FORBIDDEN", 
							message: "User is not registered as a driver",
						});
					}

					const bookings = await getBookingsService(db, {
						...input,
						filters: {
							...input.filters,
							driverId: driverProfile.id,
						},
					});
					return bookings;
				} else {
					// Regular users (customers) can only see their own bookings
					const bookings = await getBookingsService(db, {
						...input,
						filters: {
							...input.filters,
							userId: userId,
						},
					});
					return bookings;
				}
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get user's own bookings only
	getUserBookings: protectedProcedure
		.input(ResourceListSchema.extend({
			userId: z.string().optional(),
		}))
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				// Ensure user can only see their own bookings
				const userId = session?.user?.id || session?.session?.userId;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to view bookings",
					});
				}
				
				// Force filter by the authenticated user's ID only (ignore input userId)
				const bookings = await getBookingsService(db, {
					...input,
					filters: {
						...input.filters,
						userId: userId, // Only show bookings for this specific user
					},
				});
				
				return bookings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get user's own bookings (authenticated users only)
	getUnifiedUserBookings: protectedProcedure
		.input(ResourceListSchema.extend({
			userId: z.string().optional(),
		}))
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				// Ensure user can only see their own bookings
				const userId = session?.user?.id || session?.session?.userId;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to view bookings",
					});
				}
				
				// Force filter by the authenticated user's ID only
				const bookings = await getBookingsService(db, {
					...input,
					filters: {
						...input.filters,
						userId: userId, // Only show bookings for this specific user
					},
				});
				return bookings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get driver's assigned bookings only
	getDriverBookings: protectedProcedure
		.input(ResourceListSchema.extend({
			driverId: z.string().optional(),
		}))
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				// Get the current user's driver profile
				const userId = session?.user?.id || session?.session?.userId;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Driver must be authenticated to view trips",
					});
				}

				// Find the driver profile for this user
				const driverProfile = await db.query.drivers.findFirst({
					where: (drivers, { eq }) => eq(drivers.userId, userId),
				});

				if (!driverProfile) {
					throw new TRPCError({
						code: "FORBIDDEN", 
						message: "User is not registered as a driver",
					});
				}

				// Only show bookings assigned to this specific driver
				const bookings = await getBookingsService(db, {
					...input,
					filters: {
						...input.filters,
						driverId: driverProfile.id, // Only show bookings assigned to this driver
					},
				});
				return bookings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Validate booking operations
	validateOperations: protectedProcedure
		.input(z.object({
			bookingId: z.string(),
		}))
		.query(async ({ ctx: { db, session }, input }) => {
			console.log("🔍 validateOperations - START");
			console.log("📥 Input:", JSON.stringify(input, null, 2));
			console.log("👤 Session:", JSON.stringify(session, null, 2));
			
			try {
				const userId = session?.user?.id || session?.session?.userId;
				console.log("🆔 Extracted userId:", userId);
				
				if (!userId) {
					console.error("❌ No userId found in session");
					throw new Error("User session is required");
				}

				console.log("🔍 Querying booking with ID:", input.bookingId);
				
				// Get the booking first
				const [booking] = await db
					.select()
					.from(bookings)
					.where(eq(bookings.id, input.bookingId));

				console.log("📋 Found booking:", booking ? "Yes" : "No");
				if (booking) {
					console.log("📋 Booking details:", {
						id: booking.id,
						userId: booking.userId,
						status: booking.status,
						scheduledPickupTime: booking.scheduledPickupTime,
						driverAssignedAt: booking.driverAssignedAt
					});
				}

				if (!booking) {
					console.error("❌ Booking not found for ID:", input.bookingId);
					throw new Error("Booking not found");
				}

				if (booking.userId !== userId) {
					console.error("❌ User mismatch. Booking userId:", booking.userId, "Session userId:", userId);
					throw new Error("You can only check your own bookings");
				}

				console.log("🔍 Calling validateBookingOperations...");
				const validation = await validateBookingOperations(db, booking);
				console.log("✅ Validation result:", JSON.stringify(validation, null, 2));
				
				return validation;
			} catch (error) {
				console.error("💥 ERROR in validateOperations:", error);
				console.error("📚 Error stack:", error instanceof Error ? error.stack : 'No stack trace');
				console.error("🔍 Input that caused error:", JSON.stringify(input, null, 2));
				console.error("👤 Session that caused error:", JSON.stringify(session, null, 2));
				handleTRPCError(error);
			}
		}),

	// Edit booking
	editBooking: protectedProcedure
		.input(z.object({
			bookingId: z.string(),
			originAddress: z.string().optional(),
			originLatitude: z.number().optional(),
			originLongitude: z.number().optional(),
			destinationAddress: z.string().optional(),
			destinationLatitude: z.number().optional(),
			destinationLongitude: z.number().optional(),
			scheduledPickupTime: z.date().optional(),
			customerName: z.string().optional(),
			customerPhone: z.string().optional(),
			customerEmail: z.string().optional(),
			passengerCount: z.number().optional(),
			specialRequests: z.string().optional(),
		}))
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) {
					throw new Error("User session is required");
				}

				const { bookingId, ...editData } = input;
				return await editBooking(db, bookingId, userId, editData);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Cancel booking
	cancelBooking: protectedProcedure
		.input(z.object({
			bookingId: z.string(),
			cancellationReason: z.string().optional(),
		}))
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) {
					throw new Error("User session is required");
				}

				return await cancelBooking(db, input.bookingId, userId, input.cancellationReason);
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

