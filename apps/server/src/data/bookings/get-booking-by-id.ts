import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { bookings } from "@/db/schema";

export async function getBookingById(db: DB, id: string) {
	const record = await db.query.bookings.findFirst({
		where: eq(bookings.id, id),
		with: {
			driver: {
				with: {
					user: true,
				},
			},
			car: true,
			user: true,
			package: true,
			extras: true, // Include extras data
			stops: true, // Include stops data
			offloadDetails: true, // Include offload booking details
		},
	});

	return record;
}
