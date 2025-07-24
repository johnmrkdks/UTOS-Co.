import type { DB } from "@/db";
import { carModels, cars } from "@/db/schema";
import type { Car } from "@/schemas/shared";
import type { QueryBuilder } from "@/utils/query/query-builder";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import { eq } from "drizzle-orm";
import { DefaultFilterBuilder } from "@/utils/query/filter-builders";

export async function getCarsByBrandId(
	db: DB,
	params: ResourceList & { brandId: string },
) {
	const query = db
		.select()
		.from(cars)
		.innerJoin(carModels, eq(cars.modelId, carModels.id))
		.where(eq(carModels.brandId, params.brandId))

	const queryBuilder: QueryBuilder = {
		baseQuery: query,
		filterBuilder: new DefaultFilterBuilder(cars),
		queryType: "sql",
	};

	return await filterPaginationSort<Car>(queryBuilder, params);
}
