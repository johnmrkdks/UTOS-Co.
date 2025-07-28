import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateBooking } from "@/schemas/shared";
import { BookingStatusEnum, BookingTypeEnum } from "@/db/sqlite/enums";

type UpdateBookingParams = {
	id: string;
	data: UpdateBooking;
};

export async function updateBooking(db: DB, { id, data }: UpdateBookingParams) {
	const [updatedBooking] = await db.update(bookings).set({
		...data,
		status: data.status as BookingStatusEnum,
		bookingType: data.bookingType as BookingTypeEnum,
	}).where(eq(bookings.id, id)).returning();
	return updatedBooking;
}
