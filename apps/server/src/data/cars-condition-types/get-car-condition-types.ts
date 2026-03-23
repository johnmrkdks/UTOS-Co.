import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import type { CarConditionType } from "@/schemas/shared";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarConditionTypes(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.carConditionTypes.findMany(),
		filterBuilder: new RQBFilterBuilder(carConditionTypes),
		queryType: "rqb",
	};
	return await filterPaginationSort<CarConditionType>(queryBuilder, options);
}
