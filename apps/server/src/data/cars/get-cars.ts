import type { DB } from "@/db";
import { cars } from "@/db/schema";
import type { Car } from "@/schemas/shared";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import type { QueryBuilder } from "@/utils/query/query-builder";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCars(
	db: DB,
	params: ResourceList,
) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.cars.findMany(),
		filterBuilder: new RQBFilterBuilder(cars),
		queryType: "rqb",
	};

	return await filterPaginationSort<Car>(queryBuilder, params);
}
