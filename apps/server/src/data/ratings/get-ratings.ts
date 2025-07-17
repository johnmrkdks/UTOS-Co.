import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import type { Rating } from "@/schemas/shared/tables/rating";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetRatingsParams = AdvancedQuerySchema;

export async function getRatings(
	db: DB,
	params: GetRatingsParams,
): Promise<QueryListResult<Rating>> {
	const records = await advancedQuery(db, ratings, params);

	return records;
}
