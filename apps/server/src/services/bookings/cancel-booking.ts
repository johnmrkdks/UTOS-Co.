import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { bookings } from "@/db/sqlite/schema";
import { validateBookingOperations } from "./validate-booking-operations";
import { TRPCError } from "@trpc/server";
import { BookingStatusEnum } from "@/db/sqlite/enums";

export async function cancelBooking(
	db: DB,
	bookingId: string,
	userId: string,
	cancellationReason?: string,
	userRole?: string
) {
	// Get the booking with user verification
	const [existingBooking] = await db
		.select()
		.from(bookings)
		.where(eq(bookings.id, bookingId));

	if (!existingBooking) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Booking not found",
		});
	}

	// Guest bookings (userId is null) can only be cancelled by admins
	const isAdmin = userRole === "admin" || userRole === "super_admin";
	if (existingBooking.userId === null) {
		if (!isAdmin) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Guest bookings can only be cancelled by administrators. Please contact support.",
			});
		}
	} else if (existingBooking.userId !== userId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You can only cancel your own bookings",
		});
	}

	// Validate cancellation permissions
	const validation = await validateBookingOperations(db, existingBooking);

	if (!validation.canCancel) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: validation.cancelReason || "Booking cannot be cancelled at this time",
		});
	}

	// Update the booking status to cancelled
	const [cancelledBooking] = await db
		.update(bookings)
		.set({
			status: BookingStatusEnum.Cancelled,
			specialRequests: cancellationReason 
				? (existingBooking.specialRequests 
					? `${existingBooking.specialRequests}\n\nCancellation reason: ${cancellationReason}` 
					: `Cancellation reason: ${cancellationReason}`)
				: existingBooking.specialRequests,
			updatedAt: new Date(),
		})
		.where(eq(bookings.id, bookingId))
		.returning();

	return {
		booking: cancelledBooking,
		cancellationFeePercentage: validation.cancellationFeePercentage || 0,
	};
}