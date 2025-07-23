import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { CarTransmissionType } from "@/schemas/shared";

export async function getCarTransmissionTypes(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.carTransmissionTypes.findMany(),
		filterBuilder: new RQBFilterBuilder(carTransmissionTypes),
		queryType: "rqb",
	};

	return await filterPaginationSort<CarTransmissionType>(queryBuilder, options);
}
