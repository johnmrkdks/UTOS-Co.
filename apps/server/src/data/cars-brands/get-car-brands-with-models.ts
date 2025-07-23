import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import type { CarBrandWithModels } from "@/schemas/shared";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarBrandsWithModels(db: DB, params: ResourceList) {
	const query = db.query.carBrands.findMany({
		with: { models: true },
	});

	const queryBuilder: QueryBuilder = {
		baseQuery: () => query,
		filterBuilder: new RQBFilterBuilder(carBrands),
		queryType: "rqb",
	};

	return filterPaginationSort<CarBrandWithModels>(queryBuilder, params);
}
