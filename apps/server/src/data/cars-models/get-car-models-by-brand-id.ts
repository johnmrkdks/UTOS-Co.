import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { CarModel } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function getCarModelsByBrandId(db: DB, params: ResourceList & {
	brandId: string;
}) {
	const query = await db.query.carModels.findMany({
		where: eq(carModels.brandId, params.brandId),
	})

	const queryBuilder: QueryBuilder = {
		baseQuery: () => query,
		filterBuilder: new RQBFilterBuilder(carModels),
		queryType: "rqb",
	};

	return await filterPaginationSort<CarModel>(queryBuilder, params);
}
