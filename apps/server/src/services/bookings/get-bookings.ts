import { getBookings } from "@/data/bookings/get-bookings";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getBookingsService(db: DB, params: ResourceList) {
	const bookings = await getBookings(db, params);
	return bookings;
}
