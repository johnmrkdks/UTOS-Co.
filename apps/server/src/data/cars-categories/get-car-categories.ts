import type { DB } from "@/db";
import { carCategories } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { CarCategory } from "@/schemas/shared";

export async function getCarCategories(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.carCategories.findMany(),
		filterBuilder: new RQBFilterBuilder(carCategories),
		queryType: "rqb",
	};

	return await filterPaginationSort<CarCategory>(queryBuilder, options);
}
