import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carModels, cars } from "@/db/schema";
import type { Car } from "@/schemas/shared";
import { DefaultFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarsByBrandId(
	db: DB,
	params: ResourceList & { brandId: string },
) {
	const query = db
		.select()
		.from(cars)
		.innerJoin(carModels, eq(cars.modelId, carModels.id))
		.where(eq(carModels.brandId, params.brandId));

	const queryBuilder: QueryBuilder = {
		baseQuery: query,
		filterBuilder: new DefaultFilterBuilder(cars),
		queryType: "sql",
	};

	return await filterPaginationSort<Car>(queryBuilder, params);
}
