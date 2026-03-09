import { bookings, bookingExtras } from "@/db/sqlite/schema";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import type { Env } from "@/types/env";
import { getBookingByShareToken } from "@/data/bookings/get-booking-by-share-token";
import type { ExtrasFormData } from "./close-trip-with-extras";

/**
 * Close trip with extras via share token (for external drivers without an account).
 * External drivers can add the same extras (tolls, parking, waiting time) but are NOT allowed to mark as completed.
 * Status always goes to awaiting_pricing_review - admin must finalize.
 */
export async function closeTripWithExtrasByShareToken(
	db: DB,
	shareToken: string,
	extrasData: ExtrasFormData,
	env?: Env,
	isNoShow: boolean = false
) {
	const booking = await getBookingByShareToken(db, shareToken);

	if (!booking) {
		throw new Error("Booking not found. The share link may be invalid or expired.");
	}

	if (booking.status === BookingStatusEnum.Completed) {
		throw new Error("Booking is already completed");
	}

	// Calculate total extras amount (tolls, parking, other - waiting time $ is set by admin later)
	const totalExtrasAmount = Math.round(
		(extrasData.parkingCharges + extrasData.tollCharges + extrasData.otherCharges.amount) * 100
	) / 100;

	const newFinalAmount = Math.round(
		((booking.finalAmount || booking.quotedAmount) + totalExtrasAmount) * 100
	) / 100;

	// External drivers: ALWAYS go to awaiting_pricing_review - never completed. Admin must finalize.
	const finalStatus = isNoShow
		? BookingStatusEnum.NoShow
		: BookingStatusEnum.AwaitingPricingReview;

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
		.where(eq(bookings.id, booking.id))
		.returning()
		.get();

	await db
		.insert(bookingExtras)
		.values({
			bookingId: booking.id,
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
		});

	return {
		success: true,
		data: { booking: updatedBooking },
		message: "Trip extras submitted. Admin will finalize the amount.",
	};
}

/**
 * Close trip without extras via share token (for external drivers without an account).
 * External drivers cannot mark as completed - always goes to awaiting_pricing_review for admin to complete.
 */
export async function closeTripWithoutExtrasByShareToken(
	db: DB,
	shareToken: string,
	env?: Env,
	isNoShow: boolean = false
) {
	const booking = await getBookingByShareToken(db, shareToken);

	if (!booking) {
		throw new Error("Booking not found. The share link may be invalid or expired.");
	}

	if (booking.status === BookingStatusEnum.Completed) {
		throw new Error("Booking is already completed");
	}

	// External drivers: ALWAYS go to awaiting_pricing_review - never completed. Admin must finalize.
	const finalStatus = isNoShow ? BookingStatusEnum.NoShow : BookingStatusEnum.AwaitingPricingReview;

	const updatedBooking = await db
		.update(bookings)
		.set({
			status: finalStatus,
			finalAmount: Math.round((booking.finalAmount || booking.quotedAmount) * 100) / 100,
			serviceCompletedAt: new Date(),
			actualDropoffTime: isNoShow ? null : new Date(),
			updatedAt: new Date(),
		})
		.where(eq(bookings.id, booking.id))
		.returning()
		.get();

	return {
		success: true,
		data: { booking: updatedBooking },
		message: "Trip submitted. Admin will finalize the amount.",
	};
}
