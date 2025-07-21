import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { Booking } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function getBookingById(
	db: DB,
	id: string,
): Promise<Booking | null> {
	const record = await db.query.bookings.findFirst({
		where: eq(bookings.id, id),
		with: {
			car: true,
			user: true,
			package: true,
		},
	});

	if (!record) {
		throw new Error("Booking not found");
	}

	return record;
}
