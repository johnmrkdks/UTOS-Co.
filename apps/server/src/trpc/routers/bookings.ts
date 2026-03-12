import {
	InsertBookingSchema,
	UpdateBookingSchema,
} from "@/schemas/shared/tables/booking";
import { bookings, bookingExtras } from "@/db/sqlite/schema";
import { eq } from "drizzle-orm";
import { createBookingService, CreateBookingServiceSchema } from "@/services/bookings/create-booking";
import { createPackageBookingService, CreatePackageBookingSchema } from "@/services/bookings/create-package-booking";
import { createCustomBookingService, CreateCustomBookingSchema, AdminCreateCustomBookingSchema } from "@/services/bookings/create-custom-booking";
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
import { closeTripWithExtras, closeTripWithoutExtras } from "@/services/bookings/close-trip-with-extras";
import { archiveBookingService, ArchiveBookingServiceSchema } from "@/services/bookings/archive-booking";
import { bulkArchiveBookingsService, bulkDeleteBookingsService, BulkArchiveBookingsSchema, BulkDeleteBookingsSchema } from "@/services/bookings/bulk-booking-operations";
import { sendBookingConfirmationEmail, sendAdminNewBookingEmail, sendTripStatusNotification } from "@/services/notifications/booking-email-notification-service";
import { protectedProcedure, router, publicProcedure, guestProcedure } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { users } from "@/db/sqlite/schema/users";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import { createOffloadBookingService, CreateOffloadBookingServiceSchema } from "@/services/bookings/create-offload-booking";
import { createBookingReviewService, CreateBookingReviewSchema } from "@/services/reviews/create-booking-review";
import { hasBookingReviewService, HasBookingReviewSchema } from "@/services/reviews/has-booking-review";
import { getBookingByShareToken } from "@/data/bookings/get-booking-by-share-token";
import { updateBookingStatusByTokenService, UpdateBookingStatusByTokenSchema } from "@/services/bookings/update-booking-status-by-token";
import { closeTripWithExtrasByShareToken, closeTripWithoutExtrasByShareToken } from "@/services/bookings/close-trip-by-share-token";
import { generateBookingShareTokenService } from "@/services/bookings/generate-booking-share-token";

// Helper function to get user role from database
const getUserRole = async (db: any, userId: string) => {
	const user = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
	return user[0]?.role;
};

async function requireAdmin(db: any, userId: string) {
	const role = await getUserRole(db, userId);
	if (role !== "admin" && role !== "super_admin") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}
}

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
					// Admins see all bookings EXCEPT pending_payment (not shown until payment goes through)
					const result = await getBookingsService(db, input);
					const filteredData = (result?.data ?? []).filter(
						(b: { paymentStatus?: string | null }) => b.paymentStatus !== "pending_payment"
					);
					console.log("- Bookings result:", {
						count: filteredData?.length || 0,
						hasData: !!filteredData?.length,
						excludedPending: (result?.data?.length ?? 0) - filteredData.length
					});
					return { ...result, data: filteredData };
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
		.mutation(async ({ ctx: { db, session, env }, input }) => {
			try {
				console.log("🔍 DEBUG bookings.update - START");
				console.log("📥 Input received:", JSON.stringify(input, null, 2));
				console.log("📅 scheduledPickupTime type:", typeof input.data.scheduledPickupTime);
				console.log("📅 scheduledPickupTime value:", input.data.scheduledPickupTime);
				console.log("👤 Session object:", JSON.stringify(session, null, 2));

				// Get user info from session
				const userId = session?.user?.id || session?.session?.userId;
				console.log("🆔 Extracted userId:", userId);

				if (!userId) {
					console.error("❌ No userId found in session");
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User must be authenticated to update bookings",
					});
				}

				const userRole = await getUserRole(db, userId);
				console.log("👤 User role:", userRole);

				// Get the booking first to check ownership
				console.log("🔍 Fetching existing booking with id:", input.id);
				const existingBooking = await getBookingService(db, { id: input.id });

				if (!existingBooking) {
					console.error("❌ Booking not found for id:", input.id);
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Booking not found",
					});
				}

				console.log("📋 Existing booking found:", {
					id: existingBooking.id,
					status: existingBooking.status,
					bookingType: existingBooking.bookingType,
					scheduledPickupTime: existingBooking.scheduledPickupTime,
				});

				// Apply role-based access control
				if (userRole === 'admin' || userRole === 'super_admin') {
					console.log("✅ Admin access granted");
					// Admins can update any booking
				} else {
					console.error("❌ Non-admin user attempting to use admin endpoint");
					// Regular users and drivers cannot update bookings via this endpoint
					// They should use the specific editBooking endpoint which has proper validation
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only admins can use this update endpoint. Use editBooking for customer updates.",
					});
				}

				console.log("🚀 Calling updateBookingService...");
				console.log("📝 Update data:", JSON.stringify(input.data, null, 2));

				const updatedBooking = await updateBookingService(db, input);

				console.log("✅ Booking updated successfully:", updatedBooking?.id);
				console.log("📋 Updated booking data:", JSON.stringify(updatedBooking, null, 2));

				// When admin finalizes a booking awaiting_pricing_review (driver closed with waiting time),
				// capture payment + send the deferred completion email to the client
				const hasAmountUpdate = input.data.finalAmount !== undefined || input.data.extraCharges !== undefined;
				const statusSetToCompleted = input.data.status === "completed";
				const wasAwaitingPricingReview = existingBooking.status === "awaiting_pricing_review";
				if ((hasAmountUpdate || statusSetToCompleted) && wasAwaitingPricingReview && env) {
					try {
						// Ensure status is set to completed
						await db.update(bookings).set({
							status: "completed",
							updatedAt: new Date(),
						}).where(eq(bookings.id, input.id));
						// Capture payment with FINAL amount (includes tolls, parking, waiting time)
						const { maybeCapturePaymentOnCompletion } = await import("@/services/payments/maybe-capture-on-completion");
						const finalAmount = input.data.finalAmount ?? updatedBooking?.finalAmount ?? (existingBooking.quotedAmount ?? 0) + (existingBooking.extraCharges ?? 0);
						console.log(`📷 Capturing payment for booking ${input.id} with final amount: $${finalAmount.toFixed(2)}`);
						await maybeCapturePaymentOnCompletion(db, input.id, finalAmount, env, true);
						await sendTripStatusNotification({ bookingId: input.id, status: "completed", env });
						console.log("✅ Completion email sent after admin finalized charges");
					} catch (emailErr) {
						console.error("❌ Failed to send completion email or capture payment:", emailErr);
					}
				}

				return updatedBooking;
			} catch (error) {
				console.error("💥 ERROR in bookings.update:", error);
				console.error("📚 Error stack:", error instanceof Error ? error.stack : 'No stack trace');
				console.error("🔍 Input that caused error:", JSON.stringify(input, null, 2));
				handleTRPCError(error);
			}
		}),

	// Package booking procedures (allow guest users)
	createPackageBooking: publicProcedure
		.input(CreatePackageBookingSchema.omit({ userId: true }))
		.mutation(async ({ ctx: { db, session, env }, input }) => {
			try {
				console.log("🔍 DEBUG createPackageBooking - START");
				console.log("📥 Input received:", JSON.stringify(input, null, 2));
				console.log("👤 Session object:", JSON.stringify(session, null, 2));

				// Better Auth anonymous plugin - check both user and session structures
				// Guest bookings allowed: userId is optional
				const userId = session?.user?.id || session?.session?.userId || undefined;
				console.log("🆔 Extracted userId:", userId ?? "(guest booking)");

				console.log("📅 Original scheduledPickupTime:", input.scheduledPickupTime, typeof input.scheduledPickupTime);

				// Convert scheduledPickupTime string to Date object; userId optional for guests
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

				// Send admin notification only - confirmation email sent when admin confirms
				try {
					await sendAdminNewBookingEmail(newBooking.id, env);
				} catch (emailError) {
					console.error("❌ Error sending admin email:", emailError);
				}

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
		.mutation(async ({ ctx: { db, session, env }, input }) => {
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

				// Send admin notification only - confirmation email sent when admin confirms
				try {
					await sendAdminNewBookingEmail(newBooking.id, env);
				} catch (emailError) {
					console.error("❌ Error sending admin email:", emailError);
				}

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

	/** Admin/Super Admin: Create custom booking for client (existing or walk-in/phone) */
	adminCreateCustomBooking: protectedProcedure
		.input(AdminCreateCustomBookingSchema)
		.mutation(async ({ ctx: { db, session, env }, input }) => {
			try {
				const adminUserId = session?.user?.id || session?.session?.userId;
				if (!adminUserId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Authentication required",
					});
				}
				await requireAdmin(db, adminUserId);

				// Use client's userId if provided (existing client), else admin's (walk-in/phone)
				const userId = input.userId ?? adminUserId;

				const newBooking = await createCustomBookingService(db, {
					...input,
					userId,
				});

				try {
					await sendAdminNewBookingEmail(newBooking.id, env);
				} catch (emailError) {
					console.error("Error sending admin email:", emailError);
				}

				return newBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Create custom booking from instant quote (allow guest users)
	createCustomBookingFromQuote: guestProcedure
		.input(CreateCustomBookingFromQuoteSchema)
		.mutation(async ({ ctx: { db, session, env }, input }) => {
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
				const inputWithUserId = { ...input, userId, isGuest: false };
				console.log("📦 Final payload to service:", JSON.stringify(inputWithUserId, null, 2));

				const newBooking = await createCustomBookingFromQuoteService(db, inputWithUserId);
				console.log("✅ Custom booking created successfully:", newBooking.id);

				// Send booking confirmation and admin notification emails
				try {
					await sendAdminNewBookingEmail(newBooking.id, env);
				} catch (emailError) {
					console.error("❌ Error sending emails:", emailError);
					// Don't fail the booking creation if emails fail
				}

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

	// Create custom booking from quote as guest (no auth required)
	createCustomBookingFromQuoteAsGuest: publicProcedure
		.input(CreateCustomBookingFromQuoteSchema.omit({ userId: true }).extend({ isGuest: z.literal(true) }))
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				console.log("🔍 DEBUG createCustomBookingFromQuoteAsGuest - Guest booking:");

				const inputWithGuest = { ...input, isGuest: true };
				const newBooking = await createCustomBookingFromQuoteService(db, inputWithGuest);

				try {
					await sendAdminNewBookingEmail(newBooking.id, env);
				} catch (emailError) {
					console.error("❌ Error sending emails:", emailError);
				}

				return newBooking;
			} catch (error) {
				console.error("❌ TRPC Error in createCustomBookingFromQuoteAsGuest:", error);
				handleTRPCError(error);
			}
		}),

	// Create offload booking (admin only)
	createOffloadBooking: protectedProcedure
		.use(async ({ next, rawInput }) => {
			console.log("\n" + "🟡".repeat(40));
			console.log("🔍 PRE-VALIDATION - RAW INPUT RECEIVED:");
			console.log(JSON.stringify(rawInput, null, 2));
			console.log("🟡".repeat(40) + "\n");

			try {
				const result = await next();
				return result;
			} catch (error) {
				console.error("\n" + "🔴".repeat(40));
				console.error("❌ MIDDLEWARE ERROR:");
				console.error("Error:", error instanceof Error ? error.message : String(error));
				if (error instanceof z.ZodError) {
					console.error("🔴 VALIDATION FAILED:");
					console.error(JSON.stringify(error.issues, null, 2));
				}
				console.error("🔴".repeat(40) + "\n");
				throw error;
			}
		})
		.input(CreateOffloadBookingServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				console.log("\n" + "=".repeat(80));
				console.log("🔍 DEBUG createOffloadBooking - START");
				console.log("=".repeat(80));
				console.log("📥 RECEIVED INPUT:");
				console.log(JSON.stringify(input, null, 2));
				console.log("\n📊 INPUT ANALYSIS:");
				console.log("- originAddress:", input.originAddress);
				console.log("- destinationAddress:", input.destinationAddress);
				console.log("- quotedAmount:", input.quotedAmount, "Type:", typeof input.quotedAmount);
				console.log("- scheduledPickupTime:", input.scheduledPickupTime, "Type:", typeof input.scheduledPickupTime);
				console.log("- offloadDetails:", JSON.stringify(input.offloadDetails, null, 2));
				console.log("- stops:", JSON.stringify(input.stops, null, 2));
				console.log("- stops length:", input.stops?.length || 0);

				// Check if user is admin or super_admin
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) {
					console.error("❌ Authentication failed: No user ID in session");
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Authentication required",
					});
				}

				console.log("👤 User ID:", userId);
				const userRole = await getUserRole(db, userId);
				console.log("👤 User role:", userRole);

				if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
					console.error("❌ Authorization failed: User role is", userRole);
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Admin access required to create offload bookings",
					});
				}

				console.log("🚀 Calling createOffloadBookingService...");
				const newBooking = await createOffloadBookingService(db, input, userId);
				console.log("✅ Offload booking created successfully!");
				console.log("📋 Booking ID:", newBooking?.id);
				console.log("=".repeat(80) + "\n");

				return newBooking;
			} catch (error) {
				console.error("\n" + "=".repeat(80));
				console.error("❌ TRPC Error in createOffloadBooking");
				console.error("=".repeat(80));
				console.error("Error message:", error instanceof Error ? error.message : String(error));
				console.error("Error stack:", error instanceof Error ? error.stack : undefined);
				console.error("Input that caused error:", JSON.stringify(input, null, 2));
				if (error instanceof z.ZodError) {
					console.error("🔴 VALIDATION ERROR - Zod Issues:");
					console.error(JSON.stringify(error.issues, null, 2));
				}
				console.error("=".repeat(80) + "\n");
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

	/** Public: Get booking by share token (for client tracking / driver job links - no auth) */
	getByShareToken: publicProcedure
		.input(z.object({ shareToken: z.string().min(1) }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const booking = await getBookingByShareToken(db, input.shareToken);
				if (!booking) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Booking not found. The share link may be invalid.",
					});
				}
				return booking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Public: Update booking status via share token (for driver job link - no auth) */
	updateStatusByShareToken: publicProcedure
		.input(UpdateBookingStatusByTokenSchema)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				return await updateBookingStatusByTokenService(db, input, env);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Public: Close trip with extras via share token (for external drivers without account - no auth) */
	closeTripWithExtrasByShareToken: publicProcedure
		.input(z.object({
			shareToken: z.string().min(1),
			isNoShow: z.boolean().default(false),
			extrasData: z.object({
				additionalWaitTime: z.number().min(0).default(0),
				unscheduledStops: z.number().min(0).default(0),
				parkingCharges: z.number().min(0).default(0),
				tollCharges: z.number().min(0).default(0),
				location: z.string().default(""),
				otherCharges: z.object({
					description: z.string().default(""),
					amount: z.number().min(0).default(0),
				}),
				extraType: z.enum(["general", "driver", "operator"]).default("general"),
				notes: z.string().default(""),
			}),
		}))
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				return await closeTripWithExtrasByShareToken(db, input.shareToken, input.extrasData, env, input.isNoShow);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Public: Close trip without extras via share token (for external drivers without account - no auth) */
	closeTripWithoutExtrasByShareToken: publicProcedure
		.input(z.object({
			shareToken: z.string().min(1),
			isNoShow: z.boolean().default(false),
		}))
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				return await closeTripWithoutExtrasByShareToken(db, input.shareToken, env, input.isNoShow);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Admin/Driver: Generate share token for booking (for legacy bookings without one) */
	generateShareToken: protectedProcedure
		.input(z.object({ bookingId: z.string() }))
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
				const role = await getUserRole(db, userId);
				const booking = await getBookingService(db, { id: input.bookingId });
				if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
				// Admin or assigned driver can generate
				const isAdmin = role === "admin" || role === "super_admin";
				const isAssignedDriver = booking.driverId && booking.driver?.userId === userId;
				if (!isAdmin && !isAssignedDriver) {
					throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
				}
				return await generateBookingShareTokenService(db, input.bookingId);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get bookings by type
	listByType: protectedProcedure
		.input(ResourceListSchema.extend({
			bookingType: z.enum(["package", "custom", "guest", "offload"]).optional(),
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
					// Admins see all bookings EXCEPT pending_payment (not shown until payment goes through)
					const result = await getBookingsService(db, input);
					const filteredData = (result?.data ?? []).filter(
						(b: { paymentStatus?: string | null }) => b.paymentStatus !== "pending_payment"
					);
					return { ...result, data: filteredData };
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
				const result = await getBookingsService(db, {
					...input,
					filters: {
						...input.filters,
						driverId: driverProfile.id, // Only show bookings assigned to this driver
					},
				});

				// Compute driver share for each booking (excludes toll/parking, includes waiting time)
				const commissionRate = driverProfile.commissionRate ?? 50;
				const { computeDriverShare } = await import("@/utils/compute-driver-share");

				const dataWithDriverShare = (result.data || []).map((b: any) => {
					const driverShare = computeDriverShare(
						{
							quotedAmount: b.quotedAmount ?? 0,
							finalAmount: b.finalAmount,
							extraCharges: b.extraCharges,
							extras: b.extras,
						},
						commissionRate
					);
					const { extras: _extras, ...rest } = b;
					return {
						...rest,
						driverShare,
						// Mask full amounts - driver only sees their share
						quotedAmount: driverShare,
						finalAmount: driverShare,
						extraCharges: 0,
						// Strip extras breakdown (toll, parking) - driver should not see charge details
						extras: undefined,
					};
				});

				return { ...result, data: dataWithDriverShare };
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

				const userRole = await getUserRole(db, userId);
				const isAdmin = userRole === "admin" || userRole === "super_admin";
				// Guest bookings (userId is null) can only be validated by admins
				if (booking.userId === null) {
					if (!isAdmin) {
						throw new Error("Guest bookings can only be managed by administrators");
					}
				} else if (booking.userId !== userId) {
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
			additionalNotes: z.string().optional(),
		}))
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) {
					throw new Error("User session is required");
				}

				const userRole = await getUserRole(db, userId);
				const { bookingId, ...editData } = input;
				return await editBooking(db, bookingId, userId, editData, userRole);
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

				const userRole = await getUserRole(db, userId);
				return await cancelBooking(db, input.bookingId, userId, input.cancellationReason, userRole);
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
		.mutation(async ({ ctx: { db, session, env }, input }) => {
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
					env,
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
		.mutation(async ({ ctx: { db, session, env }, input }) => {
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
					env,
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

	// Create review for completed booking (customer only)
	createReview: protectedProcedure
		.input(CreateBookingReviewSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "You must be logged in to submit a review",
					});
				}
				return await createBookingReviewService(db, input, userId);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Check if booking has a review
	hasReview: protectedProcedure
		.input(HasBookingReviewSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				return await hasBookingReviewService(db, input);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Unassign driver from booking
	unassignDriver: protectedProcedure
		.input(z.object({
			bookingId: z.string(),
		}))
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

				// Only admins can unassign drivers
				if (userRole !== 'admin' && userRole !== 'super_admin') {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only administrators can unassign drivers",
					});
				}

				// Update booking to remove driver assignment and reset status to confirmed
				const updatedBooking = await updateBookingService(db, {
					id: input.bookingId,
					data: {
						driverId: null,
						status: BookingStatusEnum.Confirmed
					}
				});

				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Unassign car from booking
	unassignCar: protectedProcedure
		.input(z.object({
			bookingId: z.string(),
		}))
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

				// Only admins can unassign cars
				if (userRole !== 'admin' && userRole !== 'super_admin') {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only administrators can unassign cars",
					});
				}

				// Update booking to remove car assignment
				const updatedBooking = await updateBookingService(db, {
					id: input.bookingId,
					data: {
						carId: null
					}
				});

				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

