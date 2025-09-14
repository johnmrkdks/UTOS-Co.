import { bookings, bookingExtras } from "@/db/sqlite/schema";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import { eq } from "drizzle-orm";
import type { DB } from "@/db";

export interface ExtrasFormData {
	additionalWaitTime: number; // in minutes
	unscheduledStops: number;
	parkingCharges: number; // in cents
	tollCharges: number; // in cents
	location: string; // toll location
	otherCharges: {
		description: string;
		amount: number; // in cents
	};
	extraType: 'general' | 'driver' | 'operator';
	notes: string;
}

export async function closeTripWithExtras(
	db: DB,
	bookingId: string,
	driverId: string,
	extrasData: ExtrasFormData,
	isNoShow: boolean = false
) {
	try {
		// First verify the booking exists and belongs to the driver
		const booking = await db
			.select()
			.from(bookings)
			.where(eq(bookings.id, bookingId))
			.get();

		if (!booking) {
			throw new Error("Booking not found");
		}

		if (booking.driverId !== driverId) {
			throw new Error("Unauthorized: Booking does not belong to this driver");
		}

		if (booking.status === BookingStatusEnum.Completed) {
			throw new Error("Booking is already completed");
		}

		// Calculate total extras amount
		const totalExtrasAmount = 
			extrasData.parkingCharges + 
			extrasData.tollCharges + 
			extrasData.otherCharges.amount;

		// Calculate new final amount (original quoted amount + extras)
		const newFinalAmount = (booking.finalAmount || booking.quotedAmount) + totalExtrasAmount;

		// Determine the final status based on whether it's a no-show
		const finalStatus = isNoShow ? BookingStatusEnum.NoShow : BookingStatusEnum.Completed;

		// Update booking status and amounts
		const updatedBooking = await db
			.update(bookings)
			.set({
				status: finalStatus,
				finalAmount: newFinalAmount,
				extraCharges: totalExtrasAmount,
				serviceCompletedAt: new Date(),
				actualDropoffTime: isNoShow ? null : new Date(),
				updatedAt: new Date(),
			})
			.where(eq(bookings.id, bookingId))
			.returning()
			.get();

		// Insert extras details
		const extrasRecord = await db
			.insert(bookingExtras)
			.values({
				bookingId,
				additionalWaitTime: extrasData.additionalWaitTime,
				unscheduledStops: extrasData.unscheduledStops,
				parkingCharges: extrasData.parkingCharges,
				tollCharges: extrasData.tollCharges,
				tollLocation: extrasData.location,
				otherChargesDescription: extrasData.otherCharges.description,
				otherChargesAmount: extrasData.otherCharges.amount,
				extraType: extrasData.extraType,
				notes: extrasData.notes,
				totalExtraAmount: totalExtrasAmount,
			})
			.returning()
			.get();

		const result = {
			booking: updatedBooking,
			extras: extrasRecord
		};

		return {
			success: true,
			data: result,
			message: "Trip completed successfully with extras"
		};

	} catch (error) {
		console.error("Error closing trip with extras:", error);
		throw new Error(error instanceof Error ? error.message : "Failed to close trip with extras");
	}
}

export async function closeTripWithoutExtras(
	db: DB,
	bookingId: string,
	driverId: string,
	isNoShow: boolean = false
) {
	try {
		// Verify booking exists and belongs to driver
		const booking = await db
			.select()
			.from(bookings)
			.where(eq(bookings.id, bookingId))
			.get();

		if (!booking) {
			throw new Error("Booking not found");
		}

		if (booking.driverId !== driverId) {
			throw new Error("Unauthorized: Booking does not belong to this driver");
		}

		if (booking.status === BookingStatusEnum.Completed) {
			throw new Error("Booking is already completed");
		}

		// Determine the final status based on whether it's a no-show
		const finalStatus = isNoShow ? BookingStatusEnum.NoShow : BookingStatusEnum.Completed;

		// Update booking to completed without extras
		const updatedBooking = await db
			.update(bookings)
			.set({
				status: finalStatus,
				finalAmount: booking.finalAmount || booking.quotedAmount, // Keep original amount
				serviceCompletedAt: new Date(),
				actualDropoffTime: isNoShow ? null : new Date(),
				updatedAt: new Date(),
			})
			.where(eq(bookings.id, bookingId))
			.returning()
			.get();

		return {
			success: true,
			data: { booking: updatedBooking },
			message: "Trip completed successfully"
		};

	} catch (error) {
		console.error("Error closing trip:", error);
		throw new Error(error instanceof Error ? error.message : "Failed to close trip");
	}
}