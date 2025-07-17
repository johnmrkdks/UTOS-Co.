import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { Booking, UpdateBooking } from "@/schemas/shared/tables/booking";
import { eq } from "drizzle-orm";

type UpdateBookingStatusParams = {
	id: string;
	data: Pick<UpdateBooking, "status">;
};

export async function updateBookingStatus(
	db: DB,
	params: UpdateBookingStatusParams,
): Promise<Booking> {
	const { id, data } = params;

	const [record] = await db
		.update(bookings)
		.set(data)
		.where(eq(bookings.id, id))
		.returning();

	return record;
}
