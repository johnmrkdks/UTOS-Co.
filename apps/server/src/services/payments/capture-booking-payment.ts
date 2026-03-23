/**
 * Capture a previously authorized payment.
 * If final amount exceeds authorized amount (e.g. tolls, parking, waiting time),
 * updates the payment via Square UpdatePayment before capture so the client is charged the final amount.
 */

import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { BookingPaymentStatusEnum } from "@/db/sqlite/enums";
import { bookings } from "@/db/sqlite/schema/bookings";
import { bookingPayments } from "@/db/sqlite/schema/payments";
import { getSquareClient } from "./square-client";

export interface CapturePaymentParams {
	db: DB;
	bookingId: string;
	/** Final amount in dollars - client is charged this amount (may include extras) */
	finalAmountDollars: number;
	idempotencyKey: string;
	accessToken: string;
	locationId: string;
	env?: "sandbox" | "production";
}

export async function captureBookingPayment(params: CapturePaymentParams) {
	const {
		db,
		bookingId,
		finalAmountDollars,
		idempotencyKey,
		accessToken,
		locationId,
		env = "sandbox",
	} = params;

	const existing = await db
		.select()
		.from(bookingPayments)
		.where(eq(bookingPayments.bookingId, bookingId))
		.get();

	if (!existing) {
		throw new Error("No payment record found for this booking");
	}

	if (existing.status === "captured") {
		return { squarePaymentId: existing.squarePaymentId, status: "captured" };
	}

	if (existing.status !== "authorized") {
		throw new Error(`Cannot capture payment in status: ${existing.status}`);
	}

	const client = await getSquareClient(accessToken, env);
	const finalAmountCents = Math.round(finalAmountDollars * 100);

	// If final amount differs from authorized, update payment before capture (Square UpdatePayment API)
	if (finalAmountCents !== existing.authorizedAmountCents) {
		const getResult = (await client.payments.get({
			paymentId: existing.squarePaymentId,
		})) as {
			payment?: { versionToken?: string };
			data?: { payment?: { versionToken?: string } };
		};
		const payment = getResult?.data?.payment ?? getResult?.payment;
		if (!payment) {
			throw new Error("Could not retrieve payment from Square");
		}
		const versionToken =
			(payment as { versionToken?: string; version_token?: string })
				.versionToken ??
			(payment as { versionToken?: string; version_token?: string })
				.version_token;
		const updateIdempotencyKey = `upd-${bookingId}`.slice(0, 45);
		try {
			const updateResult = (await client.payments.update({
				paymentId: existing.squarePaymentId,
				payment: {
					amountMoney: {
						amount: BigInt(finalAmountCents),
						currency: "AUD",
					},
					...(versionToken && { versionToken }),
				},
				idempotencyKey: updateIdempotencyKey,
			})) as {
				payment?: unknown;
				data?: { payment?: unknown };
				errors?: Array<{ detail?: string }>;
			};
			const updatedPayment =
				updateResult?.data?.payment ??
				(updateResult as { payment?: unknown }).payment;
			if (!updatedPayment) {
				const errMsg =
					(updateResult as { errors?: Array<{ detail?: string }> }).errors?.[0]
						?.detail ?? "Update failed";
				throw new Error(
					`Could not update payment amount to $${finalAmountDollars.toFixed(2)}: ${errMsg}. The client may need to pay the difference separately.`,
				);
			}
		} catch (err) {
			if (err instanceof Error) throw err;
			throw new Error(
				"Could not update payment amount. Capture the original amount or contact the customer for the difference.",
			);
		}
	}

	// Capture (complete) the payment
	const result = await client.payments.complete({
		paymentId: existing.squarePaymentId,
	});

	if (!result.payment) {
		throw new Error("Square capture failed");
	}

	await db
		.update(bookingPayments)
		.set({
			status: "captured",
			capturedAmountCents: finalAmountCents,
			finalAmountCents: finalAmountCents,
			capturedAt: new Date(),
			idempotencyKey,
			updatedAt: new Date(),
		})
		.where(eq(bookingPayments.bookingId, bookingId));

	await db
		.update(bookings)
		.set({
			paymentStatus: BookingPaymentStatusEnum.PaymentCaptured,
			finalAmount: finalAmountDollars,
			updatedAt: new Date(),
		})
		.where(eq(bookings.id, bookingId));

	return { squarePaymentId: existing.squarePaymentId, status: "captured" };
}
