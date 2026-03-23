import { eq } from "drizzle-orm";
import { getBookingByShareToken } from "@/data/bookings/get-booking-by-share-token";
import type { DB } from "@/db";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import { bookingExtras, bookings } from "@/db/sqlite/schema";
import { sendTripStatusNotification } from "@/services/notifications/booking-email-notification-service";
import { maybeCapturePaymentOnCompletion } from "@/services/payments/maybe-capture-on-completion";
import type { Env } from "@/types/env";
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
	isNoShow = false,
) {
	const booking = await getBookingByShareToken(db, shareToken);

	if (!booking) {
		throw new Error(
			"Booking not found. The share link may be invalid or expired.",
		);
	}

	if (booking.status === BookingStatusEnum.Completed) {
		throw new Error("Booking is already completed");
	}

	// Calculate total extras amount (tolls, parking, other - waiting time $ is set by admin later)
	const totalExtrasAmount =
		Math.round(
			(extrasData.parkingCharges +
				extrasData.tollCharges +
				extrasData.otherCharges.amount) *
				100,
		) / 100;

	const newFinalAmount =
		Math.round(
			((booking.finalAmount || booking.quotedAmount) + totalExtrasAmount) * 100,
		) / 100;

	// External drivers: ALWAYS go to awaiting_pricing_review - never completed. Admin must finalize.
	// No Show with extras: go to awaiting_pricing_review so admin can finalize amount, then capture + send no-show email
	const finalStatus = isNoShow
		? BookingStatusEnum.AwaitingPricingReview
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

	await db.insert(bookingExtras).values({
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
	isNoShow = false,
) {
	const booking = await getBookingByShareToken(db, shareToken);

	if (!booking) {
		throw new Error(
			"Booking not found. The share link may be invalid or expired.",
		);
	}

	if (booking.status === BookingStatusEnum.Completed) {
		throw new Error("Booking is already completed");
	}

	// External drivers: normally go to awaiting_pricing_review for admin to finalize.
	// No Show (no extras): auto-capture total fare + send no-show email immediately
	const finalStatus = isNoShow
		? BookingStatusEnum.NoShow
		: BookingStatusEnum.AwaitingPricingReview;

	const updatedBooking = await db
		.update(bookings)
		.set({
			status: finalStatus,
			finalAmount:
				Math.round((booking.finalAmount || booking.quotedAmount) * 100) / 100,
			serviceCompletedAt: new Date(),
			actualDropoffTime: isNoShow ? null : new Date(),
			updatedAt: new Date(),
		})
		.where(eq(bookings.id, booking.id))
		.returning()
		.get();

	// No Show (no extras): capture payment + send no-show email
	if (env && isNoShow) {
		const finalAmount =
			Math.round((booking.finalAmount || booking.quotedAmount) * 100) / 100;
		await maybeCapturePaymentOnCompletion(db, booking.id, finalAmount, env);
		try {
			await sendTripStatusNotification({
				bookingId: booking.id,
				status: "no_show",
				env,
			});
			console.log(
				`✅ NO SHOW: Payment captured and email sent for booking ${booking.id} ($${finalAmount.toFixed(2)})`,
			);
		} catch (emailError) {
			console.error(
				`❌ NO SHOW: Failed to send no-show email for booking ${booking.id}:`,
				emailError,
			);
		}
	}

	return {
		success: true,
		data: { booking: updatedBooking },
		message: isNoShow
			? "No show recorded. Payment has been charged and the client has been notified."
			: "Trip submitted. Admin will finalize the amount.",
	};
}
