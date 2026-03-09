import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { bookings } from "@/db/sqlite/schema";
import { validateBookingOperations } from "./validate-booking-operations";
import { TRPCError } from "@trpc/server";

interface EditBookingData {
	originAddress?: string;
	originLatitude?: number;
	originLongitude?: number;
	destinationAddress?: string;
	destinationLatitude?: number;
	destinationLongitude?: number;
	scheduledPickupTime?: Date;
	customerName?: string;
	customerPhone?: string;
	customerEmail?: string;
	passengerCount?: number;
	luggageCount?: number;
	specialRequests?: string;
	additionalNotes?: string;
}

export async function editBooking(
	db: DB,
	bookingId: string,
	userId: string,
	editData: EditBookingData,
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

	// Guest bookings (userId is null) can only be edited by admins
	const isAdmin = userRole === "admin" || userRole === "super_admin";
	if (existingBooking.userId === null) {
		if (!isAdmin) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Guest bookings can only be edited by administrators",
			});
		}
	} else if (existingBooking.userId !== userId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You can only edit your own bookings",
		});
	}

	// Validate edit permissions
	const validation = await validateBookingOperations(db, existingBooking);

	if (!validation.canEdit) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: validation.editReason || "Booking cannot be edited at this time",
		});
	}

	// Update the booking
	const [updatedBooking] = await db
		.update(bookings)
		.set({
			...editData,
			updatedAt: new Date(),
		})
		.where(eq(bookings.id, bookingId))
		.returning();

	return updatedBooking;
}