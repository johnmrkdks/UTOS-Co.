/**
 * Computes the driver's share of a booking based on their commission rate.
 *
 * Commission applies to: base fare + waiting time + other charges (unscheduled stops, etc.)
 * Commission EXCLUDES: toll charges, parking charges
 *
 * Formula: driverShare = (totalAmount - tollCharges - parkingCharges) * commissionRate / 100
 */

export type BookingForDriverShare = {
	quotedAmount: number;
	finalAmount?: number | null;
	extraCharges?: number | null;
	extras?: Array<{
		tollCharges?: number | null;
		parkingCharges?: number | null;
	}> | null;
};

export function computeDriverShare(
	booking: BookingForDriverShare,
	commissionRate: number,
): number {
	const totalAmount = booking.finalAmount ?? booking.quotedAmount ?? 0;

	// Sum toll and parking from all extras records
	let tollCharges = 0;
	let parkingCharges = 0;
	if (booking.extras && Array.isArray(booking.extras)) {
		for (const ex of booking.extras) {
			tollCharges += ex.tollCharges ?? 0;
			parkingCharges += ex.parkingCharges ?? 0;
		}
	}

	// Commission base = total amount minus toll and parking (excluded from driver share)
	const commissionBase = Math.max(
		0,
		totalAmount - tollCharges - parkingCharges,
	);
	const driverShare =
		Math.round(((commissionBase * commissionRate) / 100) * 100) / 100;

	return driverShare;
}
