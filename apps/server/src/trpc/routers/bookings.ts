import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getBookingByShareToken } from "@/data/bookings/get-booking-by-share-token";
import type { DB } from "@/db";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import { bookingExtras, bookings } from "@/db/sqlite/schema";
import { users } from "@/db/sqlite/schema/users";
import {
	InsertBookingSchema,
	UpdateBookingSchema,
} from "@/schemas/shared/tables/booking";
import {
	ArchiveBookingServiceSchema,
	archiveBookingService,
} from "@/services/bookings/archive-booking";
import {
	BulkArchiveBookingsSchema,
	BulkDeleteBookingsSchema,
	bulkArchiveBookingsService,
	bulkDeleteBookingsService,
} from "@/services/bookings/bulk-booking-operations";
import {
	CalculateInstantQuoteSchema,
	calculateInstantQuoteService,
} from "@/services/bookings/calculate-instant-quote";
import { cancelBooking } from "@/services/bookings/cancel-booking";
import {
	closeTripWithExtrasByShareToken,
	closeTripWithoutExtrasByShareToken,
} from "@/services/bookings/close-trip-by-share-token";
import {
	closeTripWithExtras,
	closeTripWithoutExtras,
} from "@/services/bookings/close-trip-with-extras";
import {
	CreateBookingServiceSchema,
	createBookingService,
} from "@/services/bookings/create-booking";
import {
	AdminCreateCustomBookingSchema,
	CreateCustomBookingSchema,
	createCustomBookingService,
} from "@/services/bookings/create-custom-booking";
import {
	CreateCustomBookingFromQuoteSchema,
	createCustomBookingFromQuoteService,
} from "@/services/bookings/create-custom-booking-from-quote";
import {
	CreateOffloadBookingServiceSchema,
	createOffloadBookingService,
} from "@/services/bookings/create-offload-booking";
import {
	AdminCreatePackageBookingSchema,
	CreatePackageBookingSchema,
	createPackageBookingService,
} from "@/services/bookings/create-package-booking";
import {
	DeleteBookingServiceSchema,
	deleteBookingService,
} from "@/services/bookings/delete-booking";
import { editBooking } from "@/services/bookings/edit-booking";
import { generateBookingShareTokenService } from "@/services/bookings/generate-booking-share-token";
import {
	GetBookingServiceSchema,
	getBookingService,
} from "@/services/bookings/get-booking";
import { getBookingsService } from "@/services/bookings/get-bookings";
import {
	UpdateBookingServiceSchema,
	updateBookingService,
} from "@/services/bookings/update-booking";
import {
	AssignDriverSchema,
	assignDriverService,
	UpdateBookingStatusSchema,
	updateBookingStatusService,
} from "@/services/bookings/update-booking-status";
import {
	UpdateBookingStatusByTokenSchema,
	updateBookingStatusByTokenService,
} from "@/services/bookings/update-booking-status-by-token";
import { validateBookingOperations } from "@/services/bookings/validate-booking-operations";
import {
	sendAdminNewBookingEmail,
	sendBookingConfirmationEmail,
	sendPaymentLinkEmail,
	sendTripStatusNotification,
} from "@/services/notifications/booking-email-notification-service";
import {
	CreateBookingReviewSchema,
	createBookingReviewService,
} from "@/services/reviews/create-booking-review";
import {
	HasBookingReviewSchema,
	hasBookingReviewService,
} from "@/services/reviews/has-booking-review";
import {
	guestProcedure,
	protectedProcedure,
	publicProcedure,
	router,
} from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";

// Helper function to get user role from database
const getUserRole = async (db: DB, userId: string) => {
	const user = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	return user[0]?.role;
};

async function requireAdmin(db: DB, userId: string) {
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
				if (userRole === "admin" || userRole === "super_admin") {
					// Admins can delete any booking
				} else {
					// Regular users and drivers cannot delete bookings via this endpoint
					// They should use the cancelBooking endpoint instead
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"Only admins can delete bookings. Use cancelBooking to cancel your bookings.",
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
				if (userRole === "admin" || userRole === "super_admin") {
					// Admins can see any booking
					return booking;
				}
				if (userRole === "driver") {
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
				}
				// Regular users (customers) can only see their own bookings
				if (booking.userId !== userId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You can only view your own bookings",
					});
				}

				return booking;
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

				// Apply role-based filtering
				if (userRole === "admin" || userRole === "super_admin") {
					// Admins see all bookings EXCEPT pending_payment (not shown until payment goes through)
					const result = await getBookingsService(db, input);
					const filteredData = (result?.data ?? []).filter(
						(b: { paymentStatus?: string | null }) =>
							b.paymentStatus !== "pending_payment",
					);
					return { ...result, data: filteredData };
				}
				if (userRole === "driver") {
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
				}
				// Regular users (customers) can only see their own bookings
				const bookings = await getBookingsService(db, {
					...input,
					filters: {
						...input.filters,
						userId: userId,
					},
				});
				return bookings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateBookingServiceSchema)
		.mutation(async ({ ctx: { db, session, env }, input }) => {
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
				if (userRole === "admin" || userRole === "super_admin") {
					// Admins can update any booking
				} else {
					// Regular users and drivers cannot update bookings via this endpoint
					// They should use the specific editBooking endpoint which has proper validation
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"Only admins can use this update endpoint. Use editBooking for customer updates.",
					});
				}

				const updatedBooking = await updateBookingService(db, input);

				// When admin finalizes a booking awaiting_pricing_review (driver closed with waiting time or no-show with extras),
				// capture payment + send the deferred completion or no-show email to the client
				const hasAmountUpdate =
					input.data.finalAmount !== undefined ||
					input.data.extraCharges !== undefined;
				const statusSetToCompleted = input.data.status === "completed";
				const wasAwaitingPricingReview =
					existingBooking.status === "awaiting_pricing_review";
				const isNoShowWithExtras = existingBooking.actualDropoffTime === null; // No-show: driver set actualDropoffTime to null
				if (
					(hasAmountUpdate || statusSetToCompleted) &&
					wasAwaitingPricingReview &&
					env
				) {
					try {
						const finalStatus = isNoShowWithExtras
							? BookingStatusEnum.NoShow
							: BookingStatusEnum.Completed;
						const emailStatus = isNoShowWithExtras ? "no_show" : "completed";
						// Ensure status is set (completed for normal trips, no_show for no-show with extras)
						await db
							.update(bookings)
							.set({
								status: finalStatus,
								updatedAt: new Date(),
							})
							.where(eq(bookings.id, input.id));
						// Capture payment with FINAL amount (includes tolls, parking, waiting time)
						const { maybeCapturePaymentOnCompletion } = await import(
							"@/services/payments/maybe-capture-on-completion"
						);
						const finalAmount =
							input.data.finalAmount ??
							updatedBooking?.finalAmount ??
							(existingBooking.quotedAmount ?? 0) +
								(existingBooking.extraCharges ?? 0);
						await maybeCapturePaymentOnCompletion(
							db,
							input.id,
							finalAmount,
							env,
							true,
						);
						await sendTripStatusNotification({
							bookingId: input.id,
							status: emailStatus,
							env,
						});
					} catch {
						// Email/payment capture failed; don't fail the update
					}
				}

				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Package booking procedures (allow guest users)
	createPackageBooking: publicProcedure
		.input(CreatePackageBookingSchema.omit({ userId: true }))
		.mutation(async ({ ctx: { db, session, env }, input }) => {
			try {
				// Better Auth anonymous plugin - check both user and session structures
				// Guest bookings allowed: userId is optional
				const userId =
					session?.user?.id || session?.session?.userId || undefined;

				// Convert scheduledPickupTime string to Date object; userId optional for guests
				const processedInput = {
					...input,
					scheduledPickupTime: new Date(input.scheduledPickupTime),
					userId,
				};

				const newBooking = await createPackageBookingService(
					db,
					processedInput,
				);

				// Send admin notification only - confirmation email sent when admin confirms
				try {
					await sendAdminNewBookingEmail(newBooking.id, env);
				} catch {
					// Admin email failed; don't fail the booking
				}

				return newBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Admin: Create package booking for client (existing or walk-in) with optional sendPaymentToClient */
	adminCreatePackageBooking: protectedProcedure
		.input(AdminCreatePackageBookingSchema)
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

				const newBooking = await createPackageBookingService(db, {
					...input,
					userId,
					sendPaymentToClient: input.sendPaymentToClient,
				});

				try {
					await sendAdminNewBookingEmail(newBooking.id, env);
				} catch {
					// Admin email failed; don't fail the booking
				}

				// When sendPaymentToClient: email payment link to client
				let paymentLinkSent = false;
				let paymentLinkMessage: string | undefined;
				if (input.sendPaymentToClient) {
					try {
						const result = await sendPaymentLinkEmail(newBooking.id, env);
						paymentLinkSent = result.success;
						paymentLinkMessage = result.message;
					} catch (emailError) {
						paymentLinkMessage =
							emailError instanceof Error
								? emailError.message
								: "Failed to send payment link";
					}
				}

				return { ...newBooking, paymentLinkSent, paymentLinkMessage };
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Custom booking procedures (allow guest users)
	createCustomBooking: guestProcedure
		.input(CreateCustomBookingSchema)
		.mutation(async ({ ctx: { db, session, env }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;

				if (!userId) {
					throw new Error(
						"User session is required. Please sign in or create a guest account.",
					);
				}

				const newBooking = await createCustomBookingService(db, {
					...input,
					userId,
				});

				// Send admin notification only - confirmation email sent when admin confirms
				try {
					await sendAdminNewBookingEmail(newBooking.id, env);
				} catch {
					// Admin email failed; don't fail the booking
				}

				return newBooking;
			} catch (error) {
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
				} catch {
					// Admin email failed; don't fail the booking
				}

				// When sendPaymentToClient: email payment link to client
				let paymentLinkSent = false;
				let paymentLinkMessage: string | undefined;
				if (input.sendPaymentToClient) {
					try {
						const result = await sendPaymentLinkEmail(newBooking.id, env);
						paymentLinkSent = result.success;
						paymentLinkMessage = result.message;
					} catch (emailError) {
						paymentLinkMessage =
							emailError instanceof Error
								? emailError.message
								: "Failed to send payment link";
					}
				}

				return { ...newBooking, paymentLinkSent, paymentLinkMessage };
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Create custom booking from instant quote (allow guest users)
	createCustomBookingFromQuote: guestProcedure
		.input(CreateCustomBookingFromQuoteSchema)
		.mutation(async ({ ctx: { db, session, env }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;

				if (!userId) {
					throw new Error(
						"User session is required. Please sign in or create a guest account.",
					);
				}

				const inputWithUserId = { ...input, userId, isGuest: false };
				const newBooking = await createCustomBookingFromQuoteService(
					db,
					inputWithUserId,
				);

				try {
					await sendAdminNewBookingEmail(newBooking.id, env);
				} catch {
					// Emails failed; don't fail the booking creation
				}

				return newBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Create custom booking from quote as guest (no auth required)
	createCustomBookingFromQuoteAsGuest: publicProcedure
		.input(
			CreateCustomBookingFromQuoteSchema.omit({ userId: true }).extend({
				isGuest: z.literal(true),
			}),
		)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				const inputWithGuest = { ...input, isGuest: true };
				const newBooking = await createCustomBookingFromQuoteService(
					db,
					inputWithGuest,
				);

				try {
					await sendAdminNewBookingEmail(newBooking.id, env);
				} catch {
					// Emails failed; don't fail the booking creation
				}

				return newBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Create offload booking (admin only)
	createOffloadBooking: protectedProcedure
		.input(CreateOffloadBookingServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Authentication required",
					});
				}

				const userRole = await getUserRole(db, userId);
				if (!userRole || !["admin", "super_admin"].includes(userRole)) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Admin access required to create offload bookings",
					});
				}

				return await createOffloadBookingService(db, input, userId);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Instant quote calculation (can be public for quote generation)
	calculateInstantQuote: publicProcedure
		.input(CalculateInstantQuoteSchema)
		.query(async ({ ctx: { db, env }, input }) => {
			try {
				return await calculateInstantQuoteService(db, input, env);
			} catch (error) {
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
		.input(
			z.object({
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
					extraType: z
						.enum(["general", "driver", "operator"])
						.default("general"),
					notes: z.string().default(""),
				}),
			}),
		)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				return await closeTripWithExtrasByShareToken(
					db,
					input.shareToken,
					input.extrasData,
					env,
					input.isNoShow,
				);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Public: Close trip without extras via share token (for external drivers without account - no auth) */
	closeTripWithoutExtrasByShareToken: publicProcedure
		.input(
			z.object({
				shareToken: z.string().min(1),
				isNoShow: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				return await closeTripWithoutExtrasByShareToken(
					db,
					input.shareToken,
					env,
					input.isNoShow,
				);
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
				if (!userId)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Authentication required",
					});
				const role = await getUserRole(db, userId);
				const booking = await getBookingService(db, { id: input.bookingId });
				if (!booking)
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Booking not found",
					});
				// Admin or assigned driver can generate
				const isAdmin = role === "admin" || role === "super_admin";
				const isAssignedDriver =
					booking.driverId && booking.driver?.userId === userId;
				if (!isAdmin && !isAssignedDriver) {
					throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
				}
				return await generateBookingShareTokenService(db, input.bookingId);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Admin: Resend payment link email to client for a booking with pending_payment */
	sendPaymentLink: protectedProcedure
		.input(z.object({ bookingId: z.string() }))
		.mutation(async ({ ctx: { db, session, env }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Authentication required",
					});
				await requireAdmin(db, userId);
				const result = await sendPaymentLinkEmail(input.bookingId, env);
				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get bookings by type
	listByType: protectedProcedure
		.input(
			ResourceListSchema.extend({
				bookingType: z
					.enum(["package", "custom", "guest", "offload"])
					.optional(),
			}),
		)
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
				if (userRole === "admin" || userRole === "super_admin") {
					// Admins see all bookings EXCEPT pending_payment (not shown until payment goes through)
					const result = await getBookingsService(db, input);
					const filteredData = (result?.data ?? []).filter(
						(b: { paymentStatus?: string | null }) =>
							b.paymentStatus !== "pending_payment",
					);
					return { ...result, data: filteredData };
				}
				if (userRole === "driver") {
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
				}
				// Regular users (customers) can only see their own bookings
				const bookings = await getBookingsService(db, {
					...input,
					filters: {
						...input.filters,
						userId: userId,
					},
				});
				return bookings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get user's own bookings only with validation included
	getUserBookings: protectedProcedure
		.input(
			ResourceListSchema.extend({
				userId: z.string().optional(),
			}),
		)
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
				const bookingsWithValidation = bookings.data
					? {
							...bookings,
							data: await Promise.all(
								bookings.data.map(async (booking) => {
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
									const hoursUntilPickup =
										(pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);
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
									} else if (
										hasDriverAssigned &&
										defaultPolicy.editDisabledAfterDriverAssignment
									) {
										canEdit = false;
										editReason =
											"Cannot edit booking after driver has been assigned";
									}

									// Check cancellation permissions
									let canCancel = true;
									let cancelReason: string | undefined;
									if (
										hoursUntilPickup < defaultPolicy.cancellationAllowedHours
									) {
										canCancel = false;
										cancelReason = `Cancellations must be made at least ${defaultPolicy.cancellationAllowedHours} hours before pickup`;
									} else if (
										hasDriverAssigned &&
										defaultPolicy.cancellationDisabledAfterDriverAssignment
									) {
										canCancel = false;
										cancelReason =
											"Cannot cancel booking after driver has been assigned";
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
								}),
							),
						}
					: bookings;

				return bookingsWithValidation;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get user's own bookings (authenticated users only)
	getUnifiedUserBookings: protectedProcedure
		.input(
			ResourceListSchema.extend({
				userId: z.string().optional(),
			}),
		)
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
		.input(
			ResourceListSchema.extend({
				driverId: z.string().optional(),
			}),
		)
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
				const { computeDriverShare } = await import(
					"@/utils/compute-driver-share"
				);

				const dataWithDriverShare = (result.data || []).map((b: any) => {
					const driverShare = computeDriverShare(
						{
							quotedAmount: b.quotedAmount ?? 0,
							finalAmount: b.finalAmount,
							extraCharges: b.extraCharges,
							extras: b.extras,
						},
						commissionRate,
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
		.input(
			z.object({
				bookingId: z.string(),
			}),
		)
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;

				if (!userId) {
					throw new Error("User session is required");
				}

				const [booking] = await db
					.select()
					.from(bookings)
					.where(eq(bookings.id, input.bookingId));

				if (!booking) {
					throw new Error("Booking not found");
				}

				const userRole = await getUserRole(db, userId);
				const isAdmin = userRole === "admin" || userRole === "super_admin";
				if (booking.userId === null) {
					if (!isAdmin) {
						throw new Error(
							"Guest bookings can only be managed by administrators",
						);
					}
				} else if (booking.userId !== userId) {
					throw new Error("You can only check your own bookings");
				}

				return await validateBookingOperations(db, booking);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Edit booking
	editBooking: protectedProcedure
		.input(
			z.object({
				bookingId: z.string(),
				originAddress: z.string().optional(),
				originLatitude: z.number().optional(),
				originLongitude: z.number().optional(),
				destinationAddress: z.string().optional(),
				destinationLatitude: z.number().optional(),
				destinationLongitude: z.number().optional(),
				scheduledPickupTime: z
					.string()
					.transform((str) => new Date(str))
					.optional(),
				customerName: z.string().optional(),
				customerPhone: z.string().optional(),
				customerEmail: z.string().optional(),
				passengerCount: z.number().optional(),
				luggageCount: z.number().optional(),
				specialRequests: z.string().optional(),
				additionalNotes: z.string().optional(),
			}),
		)
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
		.input(
			z.object({
				bookingId: z.string(),
				cancellationReason: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx: { db, session, env }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) {
					throw new Error("User session is required");
				}

				const userRole = await getUserRole(db, userId);
				return await cancelBooking(
					db,
					input.bookingId,
					userId,
					input.cancellationReason,
					userRole,
					env,
				);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get available trips for drivers (unassigned bookings)
	getAvailableTrips: protectedProcedure
		.input(
			ResourceListSchema.extend({
				status: z.enum(["confirmed", "pending"]).optional(),
			}),
		)
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
				if (userRole !== "driver") {
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
		.input(
			z.object({
				bookingId: z.string(),
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
					extraType: z
						.enum(["general", "driver", "operator"])
						.default("general"),
					notes: z.string().default(""),
				}),
			}),
		)
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
				if (userRole !== "driver") {
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
					input.isNoShow,
				);

				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Close trip without extras (drivers only)
	closeTripWithoutExtras: protectedProcedure
		.input(
			z.object({
				bookingId: z.string(),
				isNoShow: z.boolean().default(false),
			}),
		)
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
				if (userRole !== "driver") {
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
					input.isNoShow,
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
				if (userRole !== "admin" && userRole !== "super_admin") {
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
				if (userRole !== "admin" && userRole !== "super_admin") {
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
				if (userRole !== "admin" && userRole !== "super_admin") {
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
		.input(
			z.object({
				bookingId: z.string(),
			}),
		)
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
				if (userRole !== "admin" && userRole !== "super_admin") {
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
						status: BookingStatusEnum.Confirmed,
					},
				});

				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Unassign car from booking
	unassignCar: protectedProcedure
		.input(
			z.object({
				bookingId: z.string(),
			}),
		)
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
				if (userRole !== "admin" && userRole !== "super_admin") {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only administrators can unassign cars",
					});
				}

				// Update booking to remove car assignment
				const updatedBooking = await updateBookingService(db, {
					id: input.bookingId,
					data: {
						carId: null,
					},
				});

				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});
