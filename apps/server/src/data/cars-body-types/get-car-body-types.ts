import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import type { CarBodyType } from "@/schemas/shared";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";

export async function getCarBodyTypes(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.carBodyTypes.findMany(),
		filterBuilder: new RQBFilterBuilder(carBodyTypes),
		queryType: "rqb",
	};
	return await filterPaginationSort<CarBodyType>(queryBuilder, options);
}
