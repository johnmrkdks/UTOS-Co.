import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteBooking(db: DB, id: string) {
	const [deletedBooking] = await db.delete(bookings).where(eq(bookings.id, id)).returning();
	return deletedBooking;
}
