import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { UpdateBooking } from "@/schemas/shared";
import { eq } from "drizzle-orm";

type UpdateBookingStatusParams = {
	id: string;
	data: Pick<UpdateBooking, "status">;
};

export async function updateBookingStatus(
	db: DB,
	params: UpdateBookingStatusParams,
) {
	const { id, data } = params;

	const [record] = await db
		.update(bookings)
		.set(data)
		.where(eq(bookings.id, id))
		.returning();

	return record;
}
