import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarModelsWithBrand(db: DB, options: ResourceList) {
	const query = await db.query.carModels.findMany({
		with: { brand: true },
	});

	const queryBuilder: QueryBuilder = {
		baseQuery: () => query,
		filterBuilder: new RQBFilterBuilder(carModels),
		queryType: "rqb",
	};

	return filterPaginationSort(queryBuilder, options);
}
