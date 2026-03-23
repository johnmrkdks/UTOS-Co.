import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import type { CarImage } from "@/schemas/shared";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarImages(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.carImages.findMany(),
		filterBuilder: new RQBFilterBuilder(carImages),
		queryType: "rqb",
	};

	return await filterPaginationSort<CarImage>(queryBuilder, options);
}
