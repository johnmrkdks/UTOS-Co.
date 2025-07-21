import { getBookings } from "@/data/bookings/get-bookings";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getBookingsService(db: DB, options: ResourceList) {
	const bookings = await getBookings(db, options);
	return bookings;
}
