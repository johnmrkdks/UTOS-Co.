import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { Booking } from "@/schemas/shared";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getBookings(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: (opts?: any) =>
			db.query.bookings.findMany({
				...opts,
				with: {
					driver: {
						with: {
							user: true,
						},
					},
					car: true,
					user: true,
					package: {
						with: {
							packageServiceType: true, // Include service type for fixed/hourly identification
						},
					},
					extras: true, // Include extras data
					stops: true, // Include stops data
					offloadDetails: true, // Include offload booking details
				},
			}),
		filterBuilder: new RQBFilterBuilder(bookings),
		queryType: "rqb",
	};

	return await filterPaginationSort<Booking>(queryBuilder, options);
}
