import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { Rating } from "@/schemas/shared";

export async function getRatings(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: () => db.query.ratings.findMany(),
		filterBuilder: new RQBFilterBuilder(ratings),
		queryType: "rqb",
	};

	return await filterPaginationSort<Rating>(queryBuilder, options);
}
