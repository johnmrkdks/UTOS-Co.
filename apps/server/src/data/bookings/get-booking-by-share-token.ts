import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getBookingByShareToken(db: DB, shareToken: string) {
	const record = await db.query.bookings.findFirst({
		where: eq(bookings.shareToken, shareToken),
		with: {
			driver: {
				with: {
					user: true,
				},
			},
			car: true,
			user: true,
			package: true,
			extras: true,
			stops: true,
			offloadDetails: true,
		},
	});

	return record;
}
