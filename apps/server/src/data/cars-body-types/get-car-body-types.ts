import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import type { CarBodyType } from "@/schemas/shared";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarBodyTypes(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.carBodyTypes.findMany(),
		filterBuilder: new RQBFilterBuilder(carBodyTypes),
		queryType: "rqb",
	};
	return await filterPaginationSort<CarBodyType>(queryBuilder, options);
}
