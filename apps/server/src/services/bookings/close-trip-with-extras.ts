import { bookings, bookingExtras } from "@/db/sqlite/schema";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import type { Env } from "@/types/env";
import { sendTripStatusNotification } from "@/services/notifications/booking-email-notification-service";

export interface ExtrasFormData {
	additionalWaitTime: number; // in minutes
	unscheduledStops: number;
	parkingCharges: number; // in dollars with decimal precision
	tollCharges: number; // in dollars with decimal precision
	location: string; // toll location
	otherCharges: {
		description: string;
		amount: number; // in dollars with decimal precision
	};
	extraType: 'general' | 'driver' | 'operator';
	notes: string;
}

export async function closeTripWithExtras(
	db: DB,
	bookingId: string,
	driverId: string,
	extrasData: ExtrasFormData,
	env?: Env,
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

		// Calculate total extras amount with proper decimal precision
		const totalExtrasAmount = Math.round((
			extrasData.parkingCharges +
			extrasData.tollCharges +
			extrasData.otherCharges.amount
		) * 100) / 100;

		// Calculate new final amount (original quoted amount + extras) with proper decimal precision
		const newFinalAmount = Math.round(((booking.finalAmount || booking.quotedAmount) + totalExtrasAmount) * 100) / 100;

		// When driver adds waiting time: defer completion email until admin finalizes amount
		// When only tolls/parking (no waiting time): complete immediately and send email
		const hasWaitingTime = extrasData.additionalWaitTime > 0;
		const finalStatus = isNoShow
			? BookingStatusEnum.NoShow
			: hasWaitingTime
				? BookingStatusEnum.AwaitingPricingReview
				: BookingStatusEnum.Completed;

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

		// When Completed (no waiting time): send completion email immediately
		// When AwaitingPricingReview: do NOT send - admin will trigger after finalizing amount
		if (env && finalStatus === BookingStatusEnum.Completed) {
			try {
				await sendTripStatusNotification({ bookingId, status: "completed", env });
				console.log(`✅ CLOSE TRIP EMAIL: Completion email sent for booking ${bookingId} (extras, no waiting time)`);
			} catch (emailError) {
				console.error(`❌ CLOSE TRIP EMAIL: Failed to send:`, emailError);
			}
		} else if (finalStatus === BookingStatusEnum.AwaitingPricingReview) {
			console.log(`📧 CLOSE TRIP DEBUG: Booking ${bookingId} awaiting admin pricing review (driver added waiting time)`);
		}

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
	env?: Env,
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
				finalAmount: Math.round((booking.finalAmount || booking.quotedAmount) * 100) / 100, // Keep original amount with proper precision
				serviceCompletedAt: new Date(),
				actualDropoffTime: isNoShow ? null : new Date(),
				updatedAt: new Date(),
			})
			.where(eq(bookings.id, bookingId))
			.returning()
			.get();

		// Send completion email notification
		if (env && finalStatus === BookingStatusEnum.Completed) {
			console.log(`📧 CLOSE TRIP DEBUG: Sending completion email for booking ${bookingId} (no extras)`);
			try {
				await sendTripStatusNotification({
					bookingId,
					status: "completed",
					env,
				});
				console.log(`✅ CLOSE TRIP EMAIL: Completion email sent for booking ${bookingId} (no extras)`);
			} catch (emailError) {
				console.error(`❌ CLOSE TRIP EMAIL: Failed to send completion email for booking ${bookingId}:`, emailError);
				// Don't fail the booking completion if email fails
			}
		}

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