import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { bookings } from "@/db/schema";

export async function deleteBooking(db: DB, id: string) {
	const [deletedBooking] = await db
		.delete(bookings)
		.where(eq(bookings.id, id))
		.returning();
	return deletedBooking;
}
