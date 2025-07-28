import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { InsertBooking } from "@/schemas/shared";
import { BookingStatusEnum, BookingTypeEnum } from "@/db/sqlite/enums";

type CreateBookingParams = InsertBooking;

export async function createBooking(db: DB, params: CreateBookingParams) {
	const [record] = await db.insert(bookings).values({
		...params,
		status: params.status as BookingStatusEnum,
		bookingType: params.bookingType as BookingTypeEnum,
	}).returning();

	return record;
}
