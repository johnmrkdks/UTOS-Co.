import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { Booking } from "@/schemas/shared";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import type { QueryBuilder } from "@/utils/query/query-builder";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getBookings(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: (opts?: any) => db.query.bookings.findMany({
			...opts,
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
			},
		}),
		filterBuilder: new RQBFilterBuilder(bookings),
		queryType: "rqb",
	};

	return await filterPaginationSort<Booking>(queryBuilder, options);
}
