import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { Booking, InsertBooking } from "@/schemas/shared/tables/booking";
import { BookingStatusEnum } from "@/db/sqlite/enums";

type CreateBookingParams = InsertBooking;

export async function createBooking(db: DB, params: CreateBookingParams): Promise<Booking> {
	const [record] = await db.insert(bookings).values({
		...params,
		status: params.status as BookingStatusEnum,
	}).returning();

	return record;
}
