import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { InsertBooking } from "@/schemas/shared";
import { BookingStatusEnum, BookingTypeEnum } from "@/db/sqlite/enums";
import { generateBookingReference } from "@/utils/generate-booking-reference";

type CreateBookingParams = InsertBooking;

export async function createBooking(db: DB, params: CreateBookingParams) {
	// Generate reference number if not provided
	const referenceNumber = params.referenceNumber || await generateBookingReference(db);

	const [record] = await db.insert(bookings).values({
		...params,
		referenceNumber,
		status: params.status as BookingStatusEnum,
		bookingType: params.bookingType as BookingTypeEnum,
	}).returning();

	return record;
}
