import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { InsertBooking } from "@/schemas/shared";
import { generateBookingReference } from "@/utils/generate-booking-reference";

type CreateBookingParams = InsertBooking;

/** Generate a URL-safe share token for public tracking/update links */
function generateShareToken(): string {
	const array = new Uint8Array(24);
	crypto.getRandomValues(array);
	return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createBooking(db: DB, params: CreateBookingParams) {
	// Generate reference number if not provided
	const referenceNumber =
		params.referenceNumber || (await generateBookingReference(db));
	const shareToken = params.shareToken ?? generateShareToken();

	const [record] = await db
		.insert(bookings)
		.values({
			...params,
			referenceNumber,
			shareToken,
			status: params.status,
			bookingType: params.bookingType,
		})
		.returning();

	return record;
}
