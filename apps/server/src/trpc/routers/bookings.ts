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
import { createOffloadBookingService, CreateOffloadBookingServiceSchema } from "@/services/bookings/create-offload-booking";
import { calculateInstantQuoteService, CalculateInstantQuoteSchema } from "@/services/bookings/calculate-instant-quote";
import { updateBookingStatusService, UpdateBookingStatusSchema, assignDriverService, AssignDriverSchema } from "@/services/bookings/update-booking-status";
import { DeleteBookingServiceSchema, deleteBookingService } from "@/services/bookings/delete-booking";
import { GetBookingServiceSchema, getBookingService } from "@/services/bookings/get-booking";
import { getBookingsService } from "@/services/bookings/get-bookings";
import { updateBookingService, UpdateBookingServiceSchema } from "@/services/bookings/update-booking";
import { editBooking } from "@/services/bookings/edit-booking";
import { cancelBooking } from "@/services/bookings/cancel-booking";
import { validateBookingOperations } from "@/services/bookings/validate-booking-operations";
import { closeTripWithExtras, closeTripWithoutExtras } from "@/services/bookings/close-trip-with-extras";
import { archiveBookingService, ArchiveBookingServiceSchema } from "@/services/bookings/archive-booking";
import { bulkArchiveBookingsService, bulkDeleteBookingsService, BulkArchiveBookingsSchema, BulkDeleteBookingsSchema } from "@/services/bookings/bulk-booking-operations";
import { protectedProcedure, router, publicProcedure, guestProcedure } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { users } from "@/db/sqlite/schema/users";

// Helper function to get user role from database
const getUserRole = async (db: any, userId: string) => {
	const user = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
	return user[0]?.role;
};

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
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to delete bookings",
					});
				}
				
				const userRole = await getUserRole(db, userId);
				
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
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to view bookings",
					});
				}
				
				const userRole = await getUserRole(db, userId);
				
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

				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to view bookings",
					});
				}

				const userRole = await getUserRole(db, userId);

				console.log("🔍 Admin Bookings List Debug:");
				console.log("- User ID:", userId);
				console.log("- User Role:", userRole);
				console.log("- Input params:", input);

				// Apply role-based filtering
				if (userRole === 'admin' || userRole === 'super_admin') {
					// Admins can see all bookings
					const bookings = await getBookingsService(db, input);
					console.log("- Bookings result:", {
						count: bookings?.data?.length || 0,
						hasData: !!bookings?.data,
						firstBooking: bookings?.data?.[0] || null
					});
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
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to update bookings",
					});
				}
				
				const userRole = await getUserRole(db, userId);
				
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
				console.log("🔍 DEBUG createCustomBooking - RECEIVED INPUT:");
				console.log("📦 Input data:", JSON.stringify(input, null, 2));
				console.log("🛑 Stops in input:", input.stops ? input.stops.length : 'No stops');
				console.log("👤 Session data:", JSON.stringify(session, null, 2));

				// Better Auth anonymous plugin - check both user and session structures
				const userId = session?.user?.id || session?.session?.userId;

				if (!userId) {
					throw new Error("User session is required. Please sign in or create a guest account.");
				}

				console.log("📝 Calling createCustomBookingService with userId:", userId);
				const newBooking = await createCustomBookingService(db, { ...input, userId });
				console.log("✅ Custom booking created successfully:", newBooking.id);
				return newBooking;
			} catch (error) {
				console.error("❌ TRPC Error in createCustomBooking:", {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					input: JSON.stringify(input, null, 2)
				});
				handleTRPCError(error);
			}
		}),

	// Create custom booking from instant quote (allow guest users)
	createCustomBookingFromQuote: guestProcedure
		.input(CreateCustomBookingFromQuoteSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				console.log("🔍 DEBUG createCustomBookingFromQuote - RECEIVED INPUT:");
				console.log("📦 Input data:", JSON.stringify(input, null, 2));
				console.log("🛑 Stops in input:", input.stops ? input.stops.length : 'No stops');
				console.log("👤 Session data:", JSON.stringify(session, null, 2));

				// Better Auth anonymous plugin - check both user and session structures
				const userId = session?.user?.id || session?.session?.userId;

				if (!userId) {
					console.log("🔍 Session structure:", JSON.stringify(session, null, 2));
					throw new Error("User session is required. Please sign in or create a guest account.");
				}

				console.log("🚀 Creating custom booking from quote for userId:", userId);
				const inputWithUserId = { ...input, userId };
				console.log("📦 Final payload to service:", JSON.stringify(inputWithUserId, null, 2));

				const newBooking = await createCustomBookingFromQuoteService(db, inputWithUserId);
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

	// Create offload booking (admin only)
	createOffloadBooking: protectedProcedure
		.input(CreateOffloadBookingServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				console.log("🔍 DEBUG createOffloadBooking - RECEIVED INPUT:");
				console.log("📦 Input data:", JSON.stringify(input, null, 2));

				// Check if user is admin or super_admin
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Authentication required",
					});
				}

				const userRole = await getUserRole(db, userId);
				if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Admin access required to create offload bookings",
					});
				}

				console.log("🚀 Creating offload booking for user:", userId, "with role:", userRole);
				const newBooking = await createOffloadBookingService(db, input, userId);
				console.log("✅ Offload booking created successfully:", newBooking?.id);

				return newBooking;
			} catch (error) {
				console.error("❌ TRPC Error in createOffloadBooking:", {
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
		.query(async ({ ctx: { db, env }, input }) => {
			try {
				console.log("🔍 calculateInstantQuote - Input received:", JSON.stringify(input, null, 2));
				console.log("🔍 calculateInstantQuote - Environment keys:", Object.keys(env || {}));
				console.log("🔍 calculateInstantQuote - Has Google Maps key:", !!env?.GOOGLE_MAPS_API_KEY);

				const quote = await calculateInstantQuoteService(db, input, env);

				console.log("✅ calculateInstantQuote - Quote calculated successfully:", JSON.stringify(quote, null, 2));
				return quote;
			} catch (error) {
				console.error("❌ calculateInstantQuote - Error:", error);
				console.error("❌ calculateInstantQuote - Error message:", error instanceof Error ? error.message : String(error));
				console.error("❌ calculateInstantQuote - Error stack:", error instanceof Error ? error.stack : undefined);
				handleTRPCError(error);
			}
		}),

	// Booking status management
	updateStatus: protectedProcedure
		.input(UpdateBookingStatusSchema)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				const updatedBooking = await updateBookingStatusService(db, input, env);
				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Driver assignment
	assignDriver: protectedProcedure
		.input(AssignDriverSchema)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				const updatedBooking = await assignDriverService(db, input, env);
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
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to view bookings",
					});
				}
				
				const userRole = await getUserRole(db, userId);
				
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

	// Get user's own bookings only with validation included
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

				// Add validation information to each booking
				const bookingsWithValidation = bookings.data ? {
					...bookings,
					data: await Promise.all(bookings.data.map(async (booking) => {
						// Skip validation for completed/cancelled bookings to save processing
						if (["completed", "cancelled"].includes(booking.status)) {
							return {
								...booking,
								canEdit: false,
								canCancel: false,
								editReason: `Cannot modify ${booking.status} booking`,
								cancelReason: `Cannot cancel ${booking.status} booking`,
							};
						}

						// Calculate validation for active bookings
						const now = new Date();
						const pickupTime = new Date(booking.scheduledPickupTime);
						const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);
						const hasDriverAssigned = !!booking.driverAssignedAt;

						// Use default 4-hour policy
						const defaultPolicy = {
							editAllowedHours: 4,
							editDisabledAfterDriverAssignment: true,
							cancellationAllowedHours: 4,
							cancellationFeePercentage: 0,
							cancellationDisabledAfterDriverAssignment: false,
						};

						// Check edit permissions
						let canEdit = true;
						let editReason: string | undefined;
						if (hoursUntilPickup < defaultPolicy.editAllowedHours) {
							canEdit = false;
							editReason = `Edits must be made at least ${defaultPolicy.editAllowedHours} hours before pickup`;
						} else if (hasDriverAssigned && defaultPolicy.editDisabledAfterDriverAssignment) {
							canEdit = false;
							editReason = "Cannot edit booking after driver has been assigned";
						}

						// Check cancellation permissions
						let canCancel = true;
						let cancelReason: string | undefined;
						if (hoursUntilPickup < defaultPolicy.cancellationAllowedHours) {
							canCancel = false;
							cancelReason = `Cancellations must be made at least ${defaultPolicy.cancellationAllowedHours} hours before pickup`;
						} else if (hasDriverAssigned && defaultPolicy.cancellationDisabledAfterDriverAssignment) {
							canCancel = false;
							cancelReason = "Cannot cancel booking after driver has been assigned";
						}

						return {
							...booking,
							canEdit,
							canCancel,
							editReason,
							cancelReason,
							hoursUntilPickup,
							hasDriverAssigned,
						};
					}))
				} : bookings;

				return bookingsWithValidation;
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
					// Return empty array instead of throwing error when no driver profile exists
					return { data: [], count: 0 };
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
			scheduledPickupTime: z.string().transform((str) => new Date(str)).optional(),
			customerName: z.string().optional(),
			customerPhone: z.string().optional(),
			customerEmail: z.string().optional(),
			passengerCount: z.number().optional(),
			luggageCount: z.number().optional(),
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

	// Get available trips for drivers (unassigned bookings)
	getAvailableTrips: protectedProcedure
		.input(ResourceListSchema.extend({
			status: z.enum(["confirmed", "pending"]).optional(),
		}))
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				// Get user info from session
				const userId = session?.user?.id || session?.session?.userId;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to view available trips",
					});
				}
				
				const userRole = await getUserRole(db, userId);
				
				// Only drivers can access available trips
				if (userRole !== 'driver') {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only drivers can view available trips",
					});
				}
				
				// Get bookings that don't have a driver assigned yet
				const bookings = await getBookingsService(db, {
					...input,
					filters: {
						...input.filters,
						// Only show confirmed bookings that need drivers
						status: input.status || "confirmed",
						// Only show bookings without assigned drivers
						driverId: null as any,
					},
				});
				
				return bookings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Close trip with extras (drivers only)
	closeTripWithExtras: protectedProcedure
		.input(z.object({
			bookingId: z.string(),
			isNoShow: z.boolean().default(false),
			extrasData: z.object({
				additionalWaitTime: z.number().min(0).default(0),
				unscheduledStops: z.number().min(0).default(0),
				parkingCharges: z.number().min(0).default(0),
				tollCharges: z.number().min(0).default(0),
				location: z.string().default(''),
				otherCharges: z.object({
					description: z.string().default(''),
					amount: z.number().min(0).default(0),
				}),
				extraType: z.enum(['general', 'driver', 'operator']).default('general'),
				notes: z.string().default(''),
			}),
		}))
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Driver must be authenticated to close trips",
					});
				}

				const userRole = await getUserRole(db, userId);
				
				// Only drivers can close trips
				if (userRole !== 'driver') {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only drivers can close trips",
					});
				}

				// Get the driver profile
				const driverProfile = await db.query.drivers.findFirst({
					where: (drivers, { eq }) => eq(drivers.userId, userId),
				});

				if (!driverProfile) {
					throw new TRPCError({
						code: "FORBIDDEN", 
						message: "User is not registered as a driver",
					});
				}

				const result = await closeTripWithExtras(
					db,
					input.bookingId, 
					driverProfile.id, 
					input.extrasData,
					input.isNoShow
				);

				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Close trip without extras (drivers only)
	closeTripWithoutExtras: protectedProcedure
		.input(z.object({
			bookingId: z.string(),
			isNoShow: z.boolean().default(false),
		}))
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Driver must be authenticated to close trips",
					});
				}

				const userRole = await getUserRole(db, userId);
				
				// Only drivers can close trips
				if (userRole !== 'driver') {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only drivers can close trips",
					});
				}

				// Get the driver profile
				const driverProfile = await db.query.drivers.findFirst({
					where: (drivers, { eq }) => eq(drivers.userId, userId),
				});

				if (!driverProfile) {
					throw new TRPCError({
						code: "FORBIDDEN", 
						message: "User is not registered as a driver",
					});
				}

				const result = await closeTripWithoutExtras(
					db,
					input.bookingId, 
					driverProfile.id,
					input.isNoShow
				);

				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Archive booking (admin only)
	archive: protectedProcedure
		.input(ArchiveBookingServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				// Get user info from session
				const userId = session?.user?.id || session?.session?.userId;

				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated",
					});
				}

				const userRole = await getUserRole(db, userId);

				// Only admins can archive bookings
				if (userRole !== 'admin' && userRole !== 'super_admin') {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only administrators can archive bookings",
					});
				}

				const result = await archiveBookingService(db, input);
				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Bulk archive bookings (admin only)
	bulkArchive: protectedProcedure
		.input(BulkArchiveBookingsSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				// Get user info from session
				const userId = session?.user?.id || session?.session?.userId;

				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated",
					});
				}

				const userRole = await getUserRole(db, userId);

				// Only admins can bulk archive bookings
				if (userRole !== 'admin' && userRole !== 'super_admin') {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only administrators can archive bookings",
					});
				}

				const result = await bulkArchiveBookingsService(db, input);
				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Bulk delete bookings (admin only)
	bulkDelete: protectedProcedure
		.input(BulkDeleteBookingsSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				// Get user info from session
				const userId = session?.user?.id || session?.session?.userId;

				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated",
					});
				}

				const userRole = await getUserRole(db, userId);

				// Only admins can bulk delete bookings
				if (userRole !== 'admin' && userRole !== 'super_admin') {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only administrators can delete bookings",
					});
				}

				const result = await bulkDeleteBookingsService(db, input);
				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

