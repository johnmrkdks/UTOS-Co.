/**
 * Authorize (hold) payment for a booking using Square Payments API.
 * Uses delayed capture - funds are held but not charged until capture.
 */
import type { DB } from "@/db";

/** Map Square error codes to user-friendly messages for card/Apple Pay declines */
function squareErrorToMessage(code: string, detail?: string): string {
	const messages: Record<string, string> = {
		INSUFFICIENT_FUNDS:
			"Your card has insufficient funds. Please use a different card or add funds.",
		PAYMENT_DECLINED:
			"Your card was declined. Please check your card details or try a different card.",
		GENERIC_DECLINE:
			"Your card was declined. Please try again or use a different card.",
		CVV_FAILURE:
			"The security code (CVV) is incorrect. Please check and try again.",
		PAN_FAILURE: "The card number is invalid. Please check and try again.",
		CARD_EXPIRED: "Your card has expired. Please use a different card.",
		CARD_NOT_SUPPORTED:
			"This card is not supported. Please use a different card.",
		CARDHOLDER_INSUFFICIENT_PERMISSIONS:
			"Your card does not allow this transaction. Please contact your bank.",
		TRANSACTION_LIMIT:
			"The payment amount exceeds your card limit. Please try a smaller amount or use a different card.",
		VOICE_FAILURE:
			"Your bank requires additional verification. Please contact them to authorize this payment.",
	};
	const msg = messages[code] ?? detail ?? `Payment declined: ${code}`;
	return msg;
}

import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { BookingPaymentStatusEnum, BookingStatusEnum } from "@/db/sqlite/enums";
import { bookings } from "@/db/sqlite/schema/bookings";
import { bookingPayments } from "@/db/sqlite/schema/payments";
import { getSquareClient } from "./square-client";

export interface AuthorizePaymentParams {
	db: DB;
	bookingId: string;
	sourceId: string; // Payment token from Web Payments SDK (card, Apple Pay, Google Pay)
	amountCents: number;
	currency?: string;
	idempotencyKey: string;
	paymentMethodId?: string | null;
	accessToken: string;
	locationId: string;
	env?: "sandbox" | "production";
}

export async function authorizeBookingPayment(params: AuthorizePaymentParams) {
	const {
		db,
		bookingId,
		sourceId,
		amountCents,
		currency = "AUD",
		idempotencyKey,
		paymentMethodId,
		accessToken,
		locationId,
		env = "sandbox",
	} = params;

	// Validate booking exists and is awaiting payment
	const existing = await db
		.select({ id: bookings.id, paymentStatus: bookings.paymentStatus })
		.from(bookings)
		.where(eq(bookings.id, bookingId))
		.get();
	if (!existing) {
		throw new Error("Booking not found");
	}
	if (existing.paymentStatus && existing.paymentStatus !== "pending_payment") {
		throw new Error("Booking is not awaiting payment");
	}

	const client = await getSquareClient(accessToken, env);

	let result: Awaited<ReturnType<typeof client.payments.create>>;
	try {
		result = await client.payments.create({
			sourceId,
			idempotencyKey,
			amountMoney: {
				amount: BigInt(amountCents),
				currency: currency as "AUD" | "USD",
			},
			locationId,
			autocomplete: false,
			referenceId: bookingId,
		});
	} catch (err) {
		const squareErrors = (
			err as { errors?: Array<{ code?: string; detail?: string }> }
		)?.errors;
		const first = squareErrors?.[0];
		const code = first?.code ?? "PAYMENT_DECLINED";
		throw new Error(squareErrorToMessage(code, first?.detail));
	}

	if (!result.payment) {
		const squareErrors = (
			result as { errors?: Array<{ code?: string; detail?: string }> }
		).errors;
		const first = squareErrors?.[0];
		const code = first?.code ?? "PAYMENT_DECLINED";
		throw new Error(squareErrorToMessage(code, first?.detail));
	}

	const payment = result.payment;
	const squarePaymentId = payment.id!;

	// Insert or update booking_payments (idempotent on retry)
	await db
		.insert(bookingPayments)
		.values({
			id: createId(),
			bookingId,
			squarePaymentId,
			authorizedAmountCents: amountCents,
			finalAmountCents: amountCents,
			status: "authorized",
			paymentMethodId: paymentMethodId ?? null,
			squareSourceId: sourceId,
			idempotencyKey,
		})
		.onConflictDoUpdate({
			target: bookingPayments.bookingId,
			set: {
				squarePaymentId,
				authorizedAmountCents: amountCents,
				finalAmountCents: amountCents,
				status: "authorized",
				paymentMethodId: paymentMethodId ?? null,
				squareSourceId: sourceId,
				idempotencyKey,
				updatedAt: new Date(),
			},
		});

	// Update booking: payment authorized + status confirmed
	await db
		.update(bookings)
		.set({
			paymentStatus: BookingPaymentStatusEnum.PaymentAuthorized,
			status: BookingStatusEnum.Confirmed,
			updatedAt: new Date(),
		})
		.where(eq(bookings.id, bookingId));

	return {
		squarePaymentId,
		status: payment.status,
	};
}
