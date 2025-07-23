import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { CarFeature } from "@/schemas/shared";

export async function getCarFeatures(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.carFeatures.findMany(),
		filterBuilder: new RQBFilterBuilder(carFeatures),
		queryType: "rqb",
	};

	return await filterPaginationSort<CarFeature>(queryBuilder, options);
}
