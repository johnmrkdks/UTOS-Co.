import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateBooking } from "@/schemas/shared";
import { BookingStatusEnum } from "@/db/sqlite/enums";

type UpdateBookingParams = {
	id: string;
	data: UpdateBooking;
};

export async function updateBooking(db: DB, { id, data }: UpdateBookingParams) {
	const [updatedBooking] = await db.update(bookings).set({
		...data,
		status: data.status as BookingStatusEnum,
	}).where(eq(bookings.id, id)).returning();
	return updatedBooking;
}
