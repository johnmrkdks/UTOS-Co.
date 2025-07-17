import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { Booking, UpdateBooking } from "@/schemas/shared/tables/booking";
import { eq } from "drizzle-orm";

type UpdateBookingParams = {
	id: string;
	data: Omit<UpdateBooking, "status">;
};

export async function updateBooking(
	db: DB,
	params: UpdateBookingParams,
): Promise<Booking> {
	const { id, data } = params;

	const [record] = await db
		.update(bookings)
		.set(data)
		.where(eq(bookings.id, id))
		.returning();

	return record;
}
