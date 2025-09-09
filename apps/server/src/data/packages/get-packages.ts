import type { DB } from "@/db";
import { packages } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { Package } from "@/schemas/shared";

export async function getPackages(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: (opts?: any) => db.query.packages.findMany(opts),
		filterBuilder: new RQBFilterBuilder(packages),
		queryType: "rqb",
	};

	return await filterPaginationSort<Package>(queryBuilder, options);
}
