import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { CarFuelType } from "@/schemas/shared";

export async function getCarFuelTypes(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.carFuelTypes.findMany(),
		filterBuilder: new RQBFilterBuilder(carFuelTypes),
		queryType: "rqb",
	};

	return await filterPaginationSort<CarFuelType>(queryBuilder, options);
}
