import type { DB } from "@/db";
import { pricingConfig } from "@/db/schema";
import type { ResourceList } from "@/utils/query/resource-list";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { QueryBuilder } from "@/utils/query/query-builder";

export async function getPricingConfigsService(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.pricingConfig.findMany(),
		filterBuilder: new RQBFilterBuilder(pricingConfig),
		queryType: "rqb",
	};

	return await filterPaginationSort(queryBuilder, options);
}