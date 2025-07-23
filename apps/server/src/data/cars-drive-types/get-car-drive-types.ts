import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { CarDriveType } from "@/schemas/shared";

export async function getCarDriveTypes(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.carDriveTypes.findMany(),
		filterBuilder: new RQBFilterBuilder(carDriveTypes),
		queryType: "rqb",
	};

	return await filterPaginationSort<CarDriveType>(queryBuilder, options);
}
