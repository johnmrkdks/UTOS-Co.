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
	const query = db.query.cars.findMany({
		with: {
			bodyType: true,
			conditionType: true,
			category: true,
			driveType: true,
			fuelType: true,
			model: true,
			transmissionType: true,
		},
	});

	const queryBuilder: QueryBuilder = {
		baseQuery: () => query,
		filterBuilder: new RQBFilterBuilder(cars),
		queryType: "rqb",
	};

	return await filterPaginationSort<Car>(queryBuilder, params);
}
