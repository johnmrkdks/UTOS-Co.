import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import type { CarModel } from "@/schemas/shared";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarModels(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.carModels.findMany(),
		filterBuilder: new RQBFilterBuilder(carModels),
		queryType: "rqb",
	};

	return await filterPaginationSort<CarModel>(queryBuilder, options);
}
