import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getBookings(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, bookings, options);
	return result;
}
