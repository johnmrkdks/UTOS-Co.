import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getBooking(db: DB, id: string) {
	const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
	return booking;
}
