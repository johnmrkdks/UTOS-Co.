import { getBookings } from "@/data/bookings/get-bookings";
import type { DB } from "@/db";
import type { ResourceList } from "@/types/resource-list";

export async function getBookingsService(db: DB, options: ResourceList) {
	const bookings = await getBookings(db, options);
	return bookings;
}
