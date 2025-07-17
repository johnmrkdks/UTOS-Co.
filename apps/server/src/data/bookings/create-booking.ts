import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import type { Booking, InsertBooking } from "@/schemas/shared/tables/booking";

type CreateBookingParams = InsertBooking;

export async function createBooking(
	db: DB,
	params: CreateBookingParams,
): Promise<Booking> {
	const [record] = await db
		.insert(bookings)
		.values({
			...params,
			status: BookingStatusEnum.Pending,
		})
		.returning();

	return record;
}
