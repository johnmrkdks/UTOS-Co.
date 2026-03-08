import { getBookingByShareToken } from "@/data/bookings/get-booking-by-share-token";
import { updateBookingStatusService } from "@/services/bookings/update-booking-status";
import type { DB } from "@/db";
import type { Env } from "@/types/env";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";
import { BookingStatusEnum } from "@/db/sqlite/enums";

export const UpdateBookingStatusByTokenSchema = z.object({
	shareToken: z.string().min(1, "Share token is required"),
	status: z.nativeEnum(BookingStatusEnum),
	actualPickupTime: z.date().optional(),
	actualDropoffTime: z.date().optional(),
	actualDistance: z.number().optional(),
	finalAmount: z.number().optional(),
	extraCharges: z.number().optional(),
});

export type UpdateBookingStatusByTokenParams = z.infer<typeof UpdateBookingStatusByTokenSchema>;

/**
 * Update booking status via share token (no auth - for driver job link).
 * Only allows driver-relevant status transitions.
 */
export async function updateBookingStatusByTokenService(
	db: DB,
	data: UpdateBookingStatusByTokenParams,
	env?: Env
) {
	const booking = await getBookingByShareToken(db, data.shareToken);

	if (!booking) {
		throw ErrorFactory.notFound("Booking not found. The share link may be invalid or expired.");
	}

	// Map to the standard update format
	return updateBookingStatusService(
		db,
		{
			id: booking.id,
			status: data.status,
			actualPickupTime: data.actualPickupTime,
			actualDropoffTime: data.actualDropoffTime,
			actualDistance: data.actualDistance,
			finalAmount: data.finalAmount,
			extraCharges: data.extraCharges,
		},
		env
	);
}
