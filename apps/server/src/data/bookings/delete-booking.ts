import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { Booking } from "@/schemas/shared/tables/booking";
import { eq } from "drizzle-orm";

export async function deleteBooking(db: DB, id: string): Promise<Booking> {
	const [record] = await db
		.delete(bookings)
		.where(eq(bookings.id, id))
		.returning();

	return record;
}
